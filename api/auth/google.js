import { createHmac, createPublicKey, verify as verifySignature, timingSafeEqual } from "node:crypto";

const googleIssuer = new Set(["accounts.google.com", "https://accounts.google.com"]);
const enc = (x) => Buffer.from(JSON.stringify(x)).toString("base64url");

async function verifyGoogle(idToken) {
  if (typeof idToken !== "string" || idToken.length > 10000) return null;
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    const claim = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
    const now = Math.floor(Date.now() / 1000);
    if (!googleIssuer.has(claim.iss) || claim.aud !== process.env.GOOGLE_CLIENT_ID ||
        !claim.sub || claim.email_verified !== true || !Number.isInteger(claim.exp) ||
        claim.exp <= now || !Number.isInteger(claim.iat) || claim.iat > now + 60) return null;
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const keys = (await response.json()).keys || [];
    const jwk = keys.find((k) => k.kid === header.kid && k.kty === "RSA" && k.use === "sig");
    if (!jwk) return null;
    const ok = verifySignature("RSA-SHA256", Buffer.from(parts[0] + "." + parts[1]), createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(parts[2], "base64url"));
    return ok ? claim : null;
  } catch { return null; }
}

function validTotp(secret, code) {
  if (!/^[0-9]{6}$/.test(String(code ?? "")) || !/^[A-Z2-7]+=*$/.test(secret || "")) return false;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0; const bytes = [];
  for (const ch of secret.replace(/=+$/, "")) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  if (bytes.length < 16) return false;
  const now = Math.floor(Date.now() / 30000);
  for (let drift = -1; drift <= 1; drift++) {
    const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(now + drift));
    const hash = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
    const offset = hash[19] & 15;
    const number = (hash.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    const actual = Buffer.from(String(number).padStart(6, "0"));
    if (timingSafeEqual(actual, Buffer.from(code))) return true;
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method_not_allowed" }); }
  // Deliberately preview-only. Before release add shared rate limiting and replay protection.
  if (process.env.VERCEL_ENV !== "preview" || process.env.AUTH_PREVIEW_ENABLED !== "true") {
    return res.status(503).json({ error: "preview_auth_disabled" });
  }
  const { GOOGLE_CLIENT_ID, SESSION_SIGNING_SECRET, SESSION_ISSUER, SESSION_AUDIENCE, FOUNDER_SUBJECT_ID, FOUNDER_TOTP_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !SESSION_SIGNING_SECRET || SESSION_SIGNING_SECRET.length < 32 ||
      !SESSION_ISSUER || !SESSION_AUDIENCE || !FOUNDER_SUBJECT_ID || !FOUNDER_TOTP_SECRET) {
    return res.status(503).json({ error: "authentication_not_configured" });
  }
  const { idToken, totp } = req.body || {};
  const identity = await verifyGoogle(idToken);
  if (!identity) return res.status(401).json({ error: "invalid_google_identity" });
  const founder = identity.sub === FOUNDER_SUBJECT_ID;
  if (founder && !validTotp(FOUNDER_TOTP_SECRET, totp)) return res.status(401).json({ error: "invalid_second_factor" });
  const now = Math.floor(Date.now() / 1000);
  const header = enc({ alg: "HS256", typ: "JWT" });
  const payload = enc({ sub: identity.sub, iss: SESSION_ISSUER, aud: SESSION_AUDIENCE, iat: now, exp: now + 900 });
  const signature = createHmac("sha256", SESSION_SIGNING_SECRET).update(header + "." + payload).digest("base64url");
  return res.status(200).json({ token: header + "." + payload + "." + signature, expiresIn: 900, founder, secondFactorVerified: founder });
}

import { createHmac, timingSafeEqual } from "node:crypto";

function decodePart(part) {
  const bytes = Buffer.from(part, "base64url");
  return JSON.parse(bytes.toString("utf8"));
}

// Only accepts short-lived HS256 tokens from an explicitly configured,
// trusted server-side issuer. Do not put the signing key in VITE_ variables.
export function verifySession(req) {
  const secret = process.env.SESSION_SIGNING_SECRET;
  const issuer = process.env.SESSION_ISSUER;
  const audience = process.env.SESSION_AUDIENCE;
  if (!secret || secret.length < 32 || !issuer || !audience) return null;

  const header = req.headers.authorization;
  if (typeof header !== "string" || !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(header)) return null;
  const token = header.slice(7);
  try {
    const parts = token.split(".");
    const head = decodePart(parts[0]);
    if (head.alg !== "HS256" || head.typ !== "JWT") return null;
    const expected = createHmac("sha256", secret).update(parts[0] + "." + parts[1]).digest();
    const actual = Buffer.from(parts[2], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

    const payload = decodePart(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== issuer || payload.aud !== audience || typeof payload.sub !== "string" || !payload.sub.trim()) return null;
    if (!Number.isInteger(payload.exp) || payload.exp <= now || payload.exp > now + 3600) return null;
    if (!Number.isInteger(payload.iat) || payload.iat > now + 60 || payload.iat < now - 3600) return null;
    if (payload.nbf !== undefined && (!Number.isInteger(payload.nbf) || payload.nbf > now)) return null;
    return { subject: payload.sub };
  } catch {
    return null;
  }
}

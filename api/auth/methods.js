// Passkey availability is fail-closed until a WebAuthn credential store,
// origin-bound challenge state, replay protection and verification exist.
// Never report that a browser supports passkeys as proof login is configured.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({error:"method_not_allowed"});
  }
  return res.status(200).json({
    google: { configured: process.env.VERCEL_ENV === "preview" && process.env.AUTH_PREVIEW_ENABLED === "true" && Boolean(process.env.GOOGLE_CLIENT_ID) },
    passkey: { enabled: false, enrollmentEnabled: false, loginEnabled: false, reason: "webauthn_credential_store_and_challenge_verification_not_configured" },
    founder: { productionVerified: false }
  });
}

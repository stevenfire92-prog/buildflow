import { verifySession } from "./_lib/verifySession.js";

// Auth adapter only: an identity provider must issue and rotate verified tokens.
// Customer paid entitlements must still come from server-verified billing records.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const session = verifySession(req);
  if (!session) return res.status(401).json({ authenticated: false, founder: false, error: "invalid_or_missing_session" });
  const founderId = process.env.FOUNDER_SUBJECT_ID;
  const founder = Boolean(founderId && session.subject === founderId);
  return res.status(200).json({
    authenticated: true,
    founder,
    lifetime: founder,
    // Do not grant customer plans without verified subscription records.
    unlockedPlans: founder ? ["standard", "pro", "starter", "builder", "elite"] : ["free"]
  });
}

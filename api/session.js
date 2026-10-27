// Read-only Vercel auth boundary. Fail closed until a real identity provider is integrated.
// IMPORTANT: Never trust client-supplied roles, emails, founder flags or localStorage.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("Vary", "Cookie, Authorization");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  // Reject requests while the Vercel session-verification adapter is unconfigured.
  // Do NOT infer login from cookie presence: cookies must be cryptographically verified.
  return res.status(401).json({
    authenticated: false,
    founder: false,
    lifetime: false,
    unlockedPlans: ["free"],
    error: "identity_provider_not_configured"
  });
}

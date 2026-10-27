// Vercel Node.js function: independent, read-only service readiness endpoint.
// No secrets or personally identifying information are returned.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  return res.status(200).json({
    service: "BuildFlow",
    runtime: "vercel",
    api: "available",
    authentication: "not_migrated",
    persistence: "not_migrated",
    payments: "not_migrated",
    ai: "not_migrated",
    productionReady: false
  });
}

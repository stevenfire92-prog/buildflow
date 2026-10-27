// Public, non-sensitive readiness endpoint for safe migration cutovers.
// It intentionally does NOT claim production readiness merely because a build succeeds.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const requirements = ["auth", "database", "ai", "payments"];
  // These flags should only be set after integration tests with real dependencies.
  // Never set them based solely on environment-secret presence.
  const checks = Object.fromEntries(requirements.map((key) => [
    key, process.env["MIGRATION_VERIFIED_" + key.toUpperCase()] === "true"
  ]));
  const ready = requirements.every((key) => checks[key]);
  return res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "migration_incomplete",
    runtime: "vercel",
    checks,
    productionCutoverApproved: false
  });
}

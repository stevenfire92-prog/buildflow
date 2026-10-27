// Server-only readiness: deliberately does not expose secret values.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  // No public self-reported success: backend independence requires
  // verified auth, persistence, payments and data migration.
  return res.status(503).json({
    ready: false,
    provider: 'vercel',
    blockedBy: ['independent_authentication', 'database_provisioning',
      'data_migration', 'base44_call_replacement', 'stripe_webhook_verification']
  });
}

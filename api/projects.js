// Migration boundary: no unverified callers may read or alter user projects.
// Activate this route only after server-side identity verification and
// owner-scoped database operations have been implemented and tested.
import { requireServerConfig, failClosed } from './_lib/serverConfig.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'GET, POST');
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    requireServerConfig();
  } catch (error) {
    return failClosed(res, error);
  }
  // No credentials accepted from the frontend until verified server sessions exist.
  return res.status(501).json({ error: 'identity_provider_not_integrated' });
}

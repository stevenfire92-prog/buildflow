import { requireAuthenticatedUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const user = await requireAuthenticatedUser(req);
    return res.status(200).json({ authenticated: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    const unauthenticated = error.statusCode === 401;
    return res.status(unauthenticated ? 401 : 503)
      .json({ authenticated: false, error: unauthenticated ? 'not_signed_in' : 'independent_auth_not_ready' });
  }
}

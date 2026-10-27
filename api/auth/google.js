import { config, bytes, cookie, sign, returnPath } from '../_lib/googleAuth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const c = config();
  if (!c) return res.status(503).json({ error: 'google_oauth_not_configured' });
  const nonce = bytes();
  const state = sign({ nonce, redirect: returnPath(req.query?.returnTo), exp: Date.now() + 600000 }, c.sessionSecret);
  res.setHeader('Set-Cookie', cookie('buildflow_oauth_state', state, 600));
  const callback = new URL('/api/auth/google-callback', 'https://' + req.headers.host).toString();
  const params = new URLSearchParams({
    client_id: c.clientId, redirect_uri: callback, response_type: 'code',
    scope: 'openid email profile', state, nonce,
    prompt: 'select_account'
  });
  return res.redirect(302, 'https://accounts.google.com/o/oauth2/v2/auth?' + params);
}

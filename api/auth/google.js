import { config, bytes, cookie, sign, returnPath } from '../_lib/googleAuth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const c = config();
  if (!c) return res.status(503).json({ error: 'google_oauth_not_configured' });
  const nonce = bytes();
  const state = sign({ nonce, redirect: returnPath(req.query?.returnTo), exp: Date.now() + 600000 }, c.sessionSecret);
  res.setHeader('Set-Cookie', cookie('buildflow_oauth_state', state, 600));
  const origin = process.env.APP_ORIGIN;\n  if (!origin || !/^https:\\/\\/[^/]+$/.test(origin)) return res.status(503).json({ error: 'app_origin_not_configured' });\n  const callback = origin + '/api/auth/google-callback';
  const params = new URLSearchParams({
    client_id: c.clientId, redirect_uri: callback, response_type: 'code',
    scope: 'openid email profile', state, nonce,
    prompt: 'select_account'
  });
  return res.redirect(302, 'https://accounts.google.com/o/oauth2/v2/auth?' + params);
}

import { config, cookie, cookieName, readCookie, sign, verify } from '../_lib/googleAuth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const c = config();
  if (!c) return res.status(503).json({ error: 'google_oauth_not_configured' });
  const state = req.query?.state;
  const stored = readCookie(req, 'buildflow_oauth_state');
  const stateData = verify(state, c.sessionSecret);
  if (!stored || stored !== state || !stateData || !req.query?.code) return res.status(400).json({ error: 'invalid_oauth_state' });
  res.setHeader('Set-Cookie', cookie('buildflow_oauth_state', '', 0));
  try {
    const callback = new URL('/api/auth/google-callback', 'https://' + req.headers.host).toString();
    const exchange = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code: req.query.code, client_id: c.clientId, client_secret: c.clientSecret,
        redirect_uri: callback, grant_type: 'authorization_code' }),
      signal: AbortSignal.timeout(10000)
    });
    if (!exchange.ok) return res.status(401).json({ error: 'google_token_exchange_failed' });
    const tokens = await exchange.json();
    if (typeof tokens.id_token !== 'string') return res.status(401).json({ error: 'missing_google_identity' });
    const verifyRes = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(tokens.id_token), { signal: AbortSignal.timeout(10000) });
    if (!verifyRes.ok) return res.status(401).json({ error: 'invalid_google_identity' });
    const identity = await verifyRes.json();
    if (identity.aud !== c.clientId ||
      !['accounts.google.com', 'https://accounts.google.com'].includes(identity.iss) ||
      identity.nonce !== stateData.nonce || identity.email_verified !== 'true' ||
      !identity.sub || Number(identity.exp) * 1000 < Date.now()) {
      return res.status(401).json({ error: 'identity_verification_failed' });
    }
    const session = sign({ sub: identity.sub, email: identity.email, exp: Date.now() + 8 * 3600000 }, c.sessionSecret);
    res.setHeader('Set-Cookie', [cookie('buildflow_oauth_state', '', 0), cookie(cookieName, session, 8 * 3600)]);
    return res.redirect(302, stateData.redirect);
  } catch { return res.status(502).json({ error: 'google_login_temporarily_unavailable' }); }
}

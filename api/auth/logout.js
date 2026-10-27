import { cookie, cookieName } from '../_lib/googleAuth.js';
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', cookie(cookieName, '', 0));
  return res.status(200).json({ ok: true });
}

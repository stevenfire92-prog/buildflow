import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const cookieName = 'buildflow_session';
export function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!clientId || !clientSecret || !sessionSecret || sessionSecret.length < 32) return null;
  return { clientId, clientSecret, sessionSecret };
}
export function bytes() { return randomBytes(32).toString('base64url'); }
export function cookie(name, value, age) {
  return name + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + age;
}
export function readCookie(req, name) {
  const raw = req.headers?.cookie || '';
  const match = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  try { return match ? decodeURIComponent(match.slice(name.length + 1)) : null; } catch { return null; }
}
export function sign(obj, secret) {
  const payload = Buffer.from(JSON.stringify(obj)).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return payload + '.' + sig;
}
export function verify(value, secret) {
  if (typeof value !== 'string') return null;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return null;
  const expected = createHmac('sha256', secret).update(payload).digest();
  let got; try { got = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(data.exp) && data.exp > Date.now() ? data : null;
  } catch { return null; }
}
export function returnPath(input) {
  if (typeof input !== 'string' || !input.startsWith('/') || input.startsWith('//') || input.includes('\\') || /[\r\n]/.test(input)) return '/dashboard';
  return input;
}
export { cookieName };

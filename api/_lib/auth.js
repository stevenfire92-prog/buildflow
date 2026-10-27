import { config, readCookie, verify, cookieName } from './googleAuth.js';

export async function requireAuthenticatedUser(req) {
  const c = config();
  if (!c) { const e = new Error('Authentication not configured'); e.statusCode = 503; throw e; }
  const session = verify(readCookie(req, cookieName), c.sessionSecret);
  if (!session || !session.sub || !session.email) {
    const e = new Error('Unauthenticated'); e.statusCode = 401; throw e;
  }
  return { id: session.sub, email: session.email };
}

export function requireOwner(user, ownerId) {
  if (!user || typeof user.id !== 'string' || user.id !== ownerId) {
    const e = new Error('Forbidden'); e.statusCode = 403; throw e;
  }
}

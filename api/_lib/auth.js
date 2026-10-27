// Independent server-side identity boundary. No Base44 dependency.
// Until a verified identity provider is configured, every request fails closed.
// Never trust an ownerId, email, or role supplied directly by a browser.
export async function requireAuthenticatedUser(_req) {
  const error = new Error('Independent authentication is not configured');
  error.statusCode = 503;
  throw error;
}

export function requireOwner(user, ownerId) {
  if (!user || typeof user.id !== 'string' || user.id !== ownerId) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
}

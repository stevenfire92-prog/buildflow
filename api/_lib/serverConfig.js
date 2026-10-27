// Server-only configuration. Never import into browser/client code.
export function requireServerConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    const error = new Error('Database not configured');
    error.statusCode = 503;
    throw error;
  }
  return { databaseUrl };
}

export function failClosed(res, error) {
  const status = error?.statusCode === 401 ? 401 : error?.statusCode === 403 ? 403 : 503;
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json({ error: status === 503 ? 'backend_not_configured' : 'unauthorized' });
}

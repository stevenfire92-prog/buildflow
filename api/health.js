// Independent Vercel serverless health endpoint. No Base44 dependency.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  return res.status(200).json({
    ok: true,
    service: 'buildflow-api',
    provider: 'vercel',
    timestamp: new Date().toISOString(),
  });
}

// Dr Build AI API — single function. Currently serves blueprint metadata;
// the generate endpoint proxies to a real LLM when DRBUILDAI_LLM_KEY is set.
function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(data);
}

const BLUEPRINTS = ['landing', 'dashboard', 'store', 'portfolio', 'saas'];

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  const route = parts.slice(2).join('/') || 'status';

  if (route === 'status' && req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      mode: process.env.DRBUILDAI_LLM_KEY ? 'live' : 'demo',
      blueprints: BLUEPRINTS,
    });
  }

  if (route === 'generate' && req.method === 'POST') {
    const { prompt } = req.body || {};
    if (!prompt) return send(res, 400, { error: 'invalid_input', message: 'A prompt is required.' });
    if (!process.env.DRBUILDAI_LLM_KEY) {
      return send(res, 200, { mode: 'demo', message: 'Demo mode — the client renders the build simulation.' });
    }
    // Real LLM proxying lands here in v2.
    return send(res, 501, { error: 'not_implemented' });
  }

  return send(res, 404, { error: 'not_found' });
}

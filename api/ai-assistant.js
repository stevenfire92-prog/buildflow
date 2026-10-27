import { requireAuthenticatedUser } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const contentLength = Number(req.headers?.['content-length'] || 0);
  if (contentLength > 16000) return res.status(413).json({ error: 'request_too_large' });
  let user;
  try {
    user = await requireAuthenticatedUser(req);
  } catch {
    return res.status(503).json({ error: 'authentication_not_configured', message: 'Independent sign-in has not been configured yet.' });
  }
  if (!user?.id) return res.status(401).json({ error: 'unauthorized' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'ai_not_configured', message: 'The server AI provider is not configured yet.' });
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 3000) return res.status(400).json({ error: 'invalid_message' });
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];
  const messages = [
    { role: 'system', content: 'You are BuildFlow AI Setup Assistant for Se Fire Tech. Explain application architecture, setup, deployment, and integration safely. Never claim to have performed actions you have not performed. Do not request or reveal secret credentials. Keep answers helpful and concise.' },
    ...history.filter(x => x && ['user', 'assistant'].includes(x.role) && typeof x.content === 'string').map(x => ({ role: x.role, content: x.content.slice(0, 1500) })),
    { role: 'user', content: message }
  ];
  try {
    const result = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, max_tokens: 500 }),
      signal: AbortSignal.timeout(20000)
    });
    if (!result.ok) return res.status(502).json({ error: 'ai_upstream_failed' });
    const data = await result.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== 'string') return res.status(502).json({ error: 'ai_invalid_response' });
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: 'ai_unavailable' });
  }
}

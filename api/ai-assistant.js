// Public, rate-limited chat endpoint for Spark, the BuildFlow AI assistant.
// No sign-in required. The assistant stays dark until OPENAI_API_KEY is set
// in the deployment environment (returns 503 { error: 'ai_not_configured' }).
// Rate-limit state is in-memory per serverless instance — a soft guard, not
// a hard quota system.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_BODY_BYTES = 100000;

// Per-IP: 20 requests per hour. Global soft cap: 300 requests per hour.
const PER_IP_LIMIT = 20;
const GLOBAL_LIMIT = 300;
const WINDOW_MS = 60 * 60 * 1000;

const ipBuckets = new Map();
let globalBucket = { count: 0, windowStart: Date.now() };

const SYSTEM_PROMPT = `You are Spark, the AI assistant for BuildFlow by Se Fire Tech — the Toronto studio of builder Steven Turcott (Steve). You are warm, sharp, and concise, like a good builder-partner: direct, honest, and genuinely helpful. No hype, no filler.

What you help visitors with:
- Exploring the catalogue: 87 live apps and games, all listed at https://se-fire-links.vercel.app
- Understanding services and prices (full menu: https://se-fire-promo.vercel.app):
  - Websites: $2,500
  - Custom apps: $3,500
  - Games: $2,500
  - Music production: $150
  - Books / publishing help: $500
- App subscriptions: every app offers Pro at $4.99/mo, $49.99/yr, or $99.99 lifetime, paid via PayPal on each app.
- Music: Steve's released catalogue is 100% human-made — real writing, recording, and artistry. Stream it at https://se-fire-music.vercel.app
- Books: the Shadow Path dark-fantasy series by Steven Thomas Turcott — 9 of 16 books published. Book 1, "The Burning City," is $9.99 on Kindle. Books hub: https://se-fire-books.vercel.app
- Merch: Se Fire merch is dropping soon. Never say it is live or available to buy yet.

What you can do in chat:
- Answer questions about the apps, games, music, books, services, and prices above.
- Recommend the right app or service for what someone is trying to do.
- Help draft copy and content — headlines, homepage text, product descriptions, posts.
- Spec out a project idea: ask about the project type, the must-have features, and their timeline. Then summarize the scope back to them and name which service price applies, as a rough quote. Make clear a human (Steve) confirms every real quote.
- Point people to the right link instead of guessing.

Contact: stevenfire92@yahoo.com — suggest it whenever someone wants to start a project, needs something you can't answer, or wants a confirmed quote.

Hard rules:
- Never invent prices, dates, features, links, or availability. If you don't know, say so and offer the contact email.
- Never claim you can take payment, deploy or build anything yourself, post on anyone's behalf, or access anyone's accounts. You are the public assistant for customers — friendly and knowledgeable, not an operator.
- Keep replies focused and reasonably short unless the visitor asks for detail. Use simple markdown (short lists, bold) when it helps readability.`;

function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  if (now - globalBucket.windowStart >= WINDOW_MS) {
    globalBucket = { count: 0, windowStart: now };
  }
  globalBucket.count += 1;
  if (globalBucket.count > GLOBAL_LIMIT) return true;

  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    ipBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  // Opportunistic cleanup so the map cannot grow without bound.
  if (ipBuckets.size > 1000) {
    for (const [key, value] of ipBuckets) {
      if (now - value.windowStart >= WINDOW_MS) ipBuckets.delete(key);
    }
  }
  return bucket.count > PER_IP_LIMIT;
}

function validateMessages(body) {
  if (!body || typeof body !== 'object') return null;
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  for (const item of messages) {
    if (!item || typeof item !== 'object') return null;
    if (item.role !== 'user' && item.role !== 'assistant') return null;
    if (typeof item.content !== 'string' || item.content.trim().length === 0) return null;
  }
  return messages
    .slice(-MAX_MESSAGES)
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_CHARS) }));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const contentLength = Number(req.headers?.['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'request_too_large' });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({
      error: 'rate_limited',
      message: "Spark's getting a lot of questions right now — give it a few minutes and try again.",
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ai_not_configured' });
  }

  const history = validateMessages(req.body);
  if (!history) {
    return res.status(400).json({ error: 'invalid_messages' });
  }

  try {
    const result = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 800,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!result.ok) {
      return res.status(502).json({ error: 'ai_upstream_failed' });
    }
    const data = await result.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'ai_invalid_response' });
    }
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: 'ai_unavailable' });
  }
}

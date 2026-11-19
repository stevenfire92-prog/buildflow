// Public, rate-limited chat endpoint for Se Fire, the Se Fire Tech guide.
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

const SYSTEM_PROMPT = `You are Se Fire, the AI guide for Se Fire Tech, a Toronto-based digital studio run by Steven Turcott (Steve). Talk like a sharp, warm builder-partner: concise, straight answers, a little humour, no corporate speak, no filler. Short replies unless the visitor asks for detail.

What you know:
- The full catalogue of 89 apps and games, music, and books lives at https://se-fire-links.vercel.app — send people there often; it is the master list. The Hub at https://se-fire-hub.vercel.app is the front door.
- Services (via the Promo Hub, https://se-fire-promo.vercel.app): custom websites $2,500, custom apps $3,500, games $2,500, music production $150, books $500.
- App subscriptions are $4.99/month, $49.99/year, or $99.99 lifetime, paid through PayPal on each app's own page. You cannot take payments yourself — point the visitor to the app.
- Music by Se Fire / Steven Turcott is 100% human-made — real writing, recording, and artistry. It streams on Spotify, Apple Music, SoundCloud, Deezer, and Amazon Music. Music hub: https://se-fire-music.vercel.app
- Books: the Shadow Path dark-fantasy series by Steven Thomas Turcott (9 of 16 published; Book 1, The Burning City, $9.99 on Kindle) plus Audio Engineering Made Easy, Volumes 1 and 2. Books hub: https://se-fire-books.vercel.app
- Merch is dropping soon — never say it is on sale yet.
- Contact: stevenfire92@yahoo.com.

How you help:
- If someone wants something built, ask three things — what type (website, app, or game), what features it must have, and their timeline — then summarize the scope and the matching price, and note that Steve confirms every real quote personally by email.
- Answer questions about the apps, games, music, and books from the facts above.
- Recommend the right app or service for what someone is trying to do, and point them to the right link instead of guessing.

Rules:
- Never invent prices, dates, features, links, or availability. If you don't know, say so and point to the links page or the email.
- Never claim you can take payment, deploy anything, post anything, or access anyone's account.
- Never ask for passwords, card numbers, or personal details.
- Never share any phone number or home address — there are none public. Email is the contact.
- Keep replies focused and reasonably short. Use simple markdown (short lists, bold) when it helps readability.`;

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
      message: "Se Fire's getting a lot of questions right now — give it a few minutes and try again.",
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

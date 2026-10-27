import { createHmac, timingSafeEqual } from 'node:crypto';

// This endpoint intentionally does not acknowledge payment events until a durable
// idempotent event processor and account-specific secret are configured.
export const config = { api: { bodyParser: false } };

export async function verifyStripeEvent(req, signingSecret) {
  const sig = req.headers['stripe-signature'];
  if (typeof sig !== 'string' || !signingSecret?.startsWith('whsec_')) return null;
  const chunks = [];
  for await (const part of req) chunks.push(Buffer.isBuffer(part) ? part : Buffer.from(part));
  const body = Buffer.concat(chunks);
  if (body.length > 1024 * 1024) return null;
  const parts = sig.split(',').map(x => x.trim());
  const t = parts.find(x => x.startsWith('t='))?.slice(2);
  const signatures = parts.filter(x => x.startsWith('v1=')).map(x => x.slice(3));
  if (!t || !/^\d+$/.test(t) || Math.abs(Date.now() / 1000 - Number(t)) > 300) return null;
  const digest = createHmac('sha256', signingSecret).update(t + '.').update(body).digest();
  if (!signatures.some(s => {
    if (!/^[a-f0-9]{64}$/i.test(s)) return false;
    return timingSafeEqual(digest, Buffer.from(s, 'hex'));
  })) return null;
  try {
    const event = JSON.parse(body.toString('utf8'));
    return event?.id?.startsWith('evt_') && typeof event?.type === 'string' ? event : null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'webhook_not_configured' });
  const event = await verifyStripeEvent(req, secret);
  if (!event) return res.status(400).json({ error: 'invalid_stripe_signature_or_payload' });
  // Processing payments/subscriptions requires durable deduplication, a DB transaction,
  // and event-specific business logic. Returning 503 makes Stripe retry rather than
  // incorrectly claiming fulfillment.
  return res.status(503).json({ error: 'event_processor_not_ready' });
}

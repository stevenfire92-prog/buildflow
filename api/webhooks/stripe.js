// GlobePay Stripe webhook handler — receives sale/subscription events from Stripe.
// Configure in Stripe Dashboard → Developers → Webhooks:
//   URL: https://globalscalemonetizer.com/api/webhooks/stripe
//   Events: checkout.session.completed, customer.subscription.created,
//           customer.subscription.updated, customer.subscription.deleted,
//           invoice.paid, invoice.payment_failed
import Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'stripe_not_configured' });

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody.toString('utf8'));
    }
  } catch (err) {
    return res.status(400).json({ error: 'invalid_signature', message: err.message });
  }

  // Handle the money events. Extend this as GlobePay grows
  // (e.g. push a sale alert, update a leaderboard, fire confetti via realtime).
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[globepay] sale:', session.id, session.amount_total, session.currency, session.customer_email);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log('[globepay] subscription:', sub.id, sub.status);
        break;
      }
      case 'customer.subscription.deleted': {
        console.log('[globepay] subscription cancelled:', event.data.object.id);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('[globepay] invoice paid:', invoice.id, invoice.amount_paid, invoice.currency);
        break;
      }
      case 'invoice.payment_failed': {
        console.log('[globepay] payment failed:', event.data.object.id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[globepay] webhook handler error:', err.message);
  }

  return res.status(200).json({ received: true });
}

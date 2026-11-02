// Se Fire Tech — Stripe checkout endpoint (template)
// Creates a Stripe Checkout Session for a one-time payment.
// Requires env vars: STRIPE_SECRET_KEY
// Optional: STRIPE_PRICE_ID (for fixed-price products)
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({ error: 'stripe_not_configured', message: 'Payments are not enabled yet.' });
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  const { amount, currency = 'usd', name, successUrl, cancelUrl } = req.body || {};

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: name || 'Se Fire Tech Purchase' },
            unit_amount: Math.round((amount || 999) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.origin}/?success=true`,
      cancel_url: cancelUrl || `${req.headers.origin}/?cancelled=true`,
    });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[stripe] checkout error:', err.message);
    return res.status(500).json({ error: 'checkout_failed', message: err.message });
  }
}

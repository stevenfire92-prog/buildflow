// /api/globepay/payment-links — list & create Stripe payment links.
import { getStripe, handleApiError } from './_stripe.js';

export default async function handler(req, res) {
  try {
    const stripe = getStripe();

    if (req.method === 'GET') {
      const links = await stripe.paymentLinks.list({ active: true, limit: 50 });
      return res.status(200).json({
        links: links.data.map((l) => ({
          id: l.id,
          url: l.url,
          active: l.active,
        })),
      });
    }

    if (req.method === 'POST') {
      const { priceId, quantity = 1 } = req.body || {};
      if (!priceId) {
        return res.status(400).json({ error: 'invalid_input', message: 'A price is required.' });
      }
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: Number(quantity) || 1 }],
      });
      return res.status(201).json({ link: { id: link.id, url: link.url } });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    return handleApiError(res, error);
  }
}

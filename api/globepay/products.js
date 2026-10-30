// /api/globepay/products — list & create Stripe products with prices.
import { getStripe, handleApiError, fmtMoney } from './_stripe.js';

export default async function handler(req, res) {
  try {
    const stripe = getStripe();

    if (req.method === 'GET') {
      const products = await stripe.products.list({ active: true, limit: 50 });
      const withPrices = await Promise.all(
        products.data.map(async (p) => {
          const prices = await stripe.prices.list({ product: p.id, active: true, limit: 10 });
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            image: p.images?.[0] || null,
            prices: prices.data.map((pr) => ({
              id: pr.id,
              amount: fmtMoney(pr.unit_amount, pr.currency),
              currency: pr.currency,
              recurring: pr.recurring ? `${pr.recurring.interval}` : 'one-time',
            })),
          };
        })
      );
      return res.status(200).json({ products: withPrices });
    }

    if (req.method === 'POST') {
      const { name, description, amount, currency = 'usd', recurring } = req.body || {};
      if (!name || !amount || Number(amount) <= 0) {
        return res.status(400).json({ error: 'invalid_input', message: 'Name and a positive amount are required.' });
      }
      const product = await stripe.products.create({ name, description: description || undefined });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(amount) * 100),
        currency: currency.toLowerCase(),
        ...(recurring ? { recurring: { interval: recurring } } : {}),
      });
      return res.status(201).json({
        product: {
          id: product.id,
          name: product.name,
          prices: [{ id: price.id, amount: fmtMoney(price.unit_amount, price.currency), recurring: recurring || 'one-time' }],
        },
      });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    return handleApiError(res, error);
  }
}

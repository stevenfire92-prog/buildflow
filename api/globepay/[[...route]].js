// GlobePay API — single serverless function handling all /api/globepay/* routes.
// Consolidated to stay within Vercel Hobby's function limit.
import Stripe from 'stripe';

let stripeInstance = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const error = new Error('Stripe is not connected');
    error.statusCode = 503;
    error.code = 'stripe_not_configured';
    throw error;
  }
  if (!stripeInstance || stripeInstance._apiKey !== key) {
    stripeInstance = new Stripe(key, { apiVersion: '2024-06-20' });
    stripeInstance._apiKey = key;
  }
  return stripeInstance;
}

function fmtMoney(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format((amount || 0) / 100);
}

function send(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(data);
}

function fail(res, error) {
  const status = error?.statusCode || 500;
  return send(res, status, {
    error: error?.code || 'request_failed',
    message: error?.message || 'Something went wrong.',
  });
}

async function handleStatus(req, res) {
  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve();
    return send(res, 200, {
      connected: true,
      accountId: account.id,
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      livemode: (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live'),
    });
  } catch (error) {
    if (error.code === 'stripe_not_configured') return send(res, 200, { connected: false });
    return fail(res, error);
  }
}

async function handleStats(req, res) {
  try {
    const stripe = getStripe();
    const days = Math.min(parseInt(req.query.days || '30', 10) || 30, 365);
    const since = Math.floor(Date.now() / 1000) - days * 86400;

    const [charges, subscriptions, balance] = await Promise.all([
      stripe.charges.list({ created: { gte: since }, limit: 100 }),
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.balance.retrieve(),
    ]);

    const paid = charges.data.filter((c) => c.paid && !c.refunded);
    const gross = paid.reduce((s, c) => s + (c.amount - (c.amount_refunded || 0)), 0);
    const currency = paid[0]?.currency || balance.available?.[0]?.currency || 'usd';

    const buckets = {};
    for (let i = 0; i < days; i++) {
      buckets[new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)] = 0;
    }
    paid.forEach((c) => {
      const day = new Date(c.created * 1000).toISOString().slice(0, 10);
      if (day in buckets) buckets[day] += c.amount - (c.amount_refunded || 0);
    });
    const series = Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, cents]) => ({ date, revenue: +(cents / 100).toFixed(2) }));

    const saleDays = new Set(paid.map((c) => new Date(c.created * 1000).toISOString().slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    if (!saleDays.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
    while (saleDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const mrr = subscriptions.data.reduce((s, sub) => {
      const item = sub.items.data[0];
      if (!item) return s;
      const amt = item.price.unit_amount || 0;
      const interval = item.price.recurring?.interval;
      return s + (interval === 'year' ? amt / 12 : interval === 'week' ? amt * 4.33 : amt);
    }, 0);

    return send(res, 200, {
      currency,
      grossCents: gross,
      grossFormatted: fmtMoney(gross, currency),
      salesCount: paid.length,
      activeSubscriptions: subscriptions.data.length,
      mrrCents: Math.round(mrr),
      mrrFormatted: fmtMoney(Math.round(mrr), currency),
      streakDays: streak,
      availableCents: (balance.available || []).reduce((s, b) => s + b.amount, 0),
      series,
      recent: paid.slice(0, 10).map((c) => ({
        id: c.id,
        amount: fmtMoney(c.amount - (c.amount_refunded || 0), c.currency),
        currency: c.currency,
        email: c.billing_details?.email || c.receipt_email || '—',
        description: c.description || 'Payment',
        created: c.created,
        status: c.refunded ? 'refunded' : 'succeeded',
      })),
    });
  } catch (error) {
    return fail(res, error);
  }
}

async function handleProducts(req, res) {
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
      return send(res, 200, { products: withPrices });
    }
    if (req.method === 'POST') {
      const { name, description, amount, currency = 'usd', recurring } = req.body || {};
      if (!name || !amount || Number(amount) <= 0) {
        return send(res, 400, { error: 'invalid_input', message: 'Name and a positive amount are required.' });
      }
      const product = await stripe.products.create({ name, description: description || undefined });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(amount) * 100),
        currency: currency.toLowerCase(),
        ...(recurring ? { recurring: { interval: recurring } } : {}),
      });
      return send(res, 201, {
        product: {
          id: product.id,
          name: product.name,
          prices: [{ id: price.id, amount: fmtMoney(price.unit_amount, price.currency), recurring: recurring || 'one-time' }],
        },
      });
    }
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (error) {
    return fail(res, error);
  }
}

async function handlePaymentLinks(req, res) {
  try {
    const stripe = getStripe();
    if (req.method === 'GET') {
      const links = await stripe.paymentLinks.list({ active: true, limit: 50 });
      return send(res, 200, { links: links.data.map((l) => ({ id: l.id, url: l.url, active: l.active })) });
    }
    if (req.method === 'POST') {
      const { priceId, quantity = 1 } = req.body || {};
      if (!priceId) return send(res, 400, { error: 'invalid_input', message: 'A price is required.' });
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: Number(quantity) || 1 }],
      });
      return send(res, 201, { link: { id: link.id, url: link.url } });
    }
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (error) {
    return fail(res, error);
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);
  // parts: ['api','globepay', <route...>]
  const route = parts.slice(2).join('/') || 'status';

  if (route === 'status' && req.method === 'GET') return handleStatus(req, res);
  if (route === 'stats' && req.method === 'GET') return handleStats(req, res);
  if (route === 'products') return handleProducts(req, res);
  if (route === 'payment-links') return handlePaymentLinks(req, res);
  return send(res, 404, { error: 'not_found' });
}

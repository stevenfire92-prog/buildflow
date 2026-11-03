// GET /api/globepay/stats — dashboard numbers: volume, sales, subs, recent charges.
import { getStripe, handleApiError, fmtMoney } from './_stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
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
    const currency = (paid[0]?.currency || balance.available?.[0]?.currency || 'usd');

    // Daily series for the chart
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    paid.forEach((c) => {
      const day = new Date(c.created * 1000).toISOString().slice(0, 10);
      if (day in buckets) buckets[day] += c.amount - (c.amount_refunded || 0);
    });
    const series = Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, cents]) => ({ date, revenue: +(cents / 100).toFixed(2) }));

    // Sales streak: consecutive days (ending today/yesterday) with at least one sale
    const saleDays = new Set(
      paid.map((c) => new Date(c.created * 1000).toISOString().slice(0, 10))
    );
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

    return res.status(200).json({
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
    return handleApiError(res, error);
  }
}

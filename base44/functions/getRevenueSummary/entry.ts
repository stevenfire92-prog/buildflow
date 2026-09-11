import { secrets } from 'base44:runtime';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default async function(req) {
  try {
    const apiKey = secrets.get('STRIPE_SECRET_KEY');
    if (!apiKey) {
      return Response.json({ error: 'stripe_not_configured' }, { status: 500 });
    }
    const headers = { 'Authorization': `Bearer ${apiKey}` };

    // Month buckets: 6 full months back + the current month
    const months = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      months.push({
        key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
        label: MONTH_LABELS[start.getUTCMonth()],
        start: Math.floor(start.getTime() / 1000),
        end: Math.floor(end.getTime() / 1000),
        cents: 0,
        payments: 0,
        new_subs: 0,
        total_subs: 0,
      });
    }
    const earliest = months[0].start;

    // Earnings: net amount of successful payments, by month
    let url = `https://api.stripe.com/v1/balance_transactions?limit=100&created[gte]=${earliest}`;
    for (let page = 0; page < 5; page++) {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const detail = await res.text();
        console.log('getRevenueSummary balance error:', detail.slice(0, 300));
        return Response.json({ error: 'Could not read Stripe balance' }, { status: 502 });
      }
      const batch = await res.json();
      for (const bt of batch.data || []) {
        if (bt.type !== 'charge') continue;
        const m = months.find((x) => bt.created >= x.start && bt.created < x.end);
        if (!m) continue;
        m.cents += bt.net || bt.amount || 0;
        m.payments += 1;
      }
      if (!batch.has_more || !(batch.data || []).length) break;
      url = `https://api.stripe.com/v1/balance_transactions?limit=100&created[gte]=${earliest}&starting_after=${batch.data[batch.data.length - 1].id}`;
    }

    // Subscriptions: how many started each month + active right now
    let activeCount = 0;
    let olderCount = 0;
    let subUrl = 'https://api.stripe.com/v1/subscriptions?limit=100&status=all';
    for (let page = 0; page < 5; page++) {
      const res = await fetch(subUrl, { headers });
      if (!res.ok) break; // no readable subscription data -> zero growth series
      const batch = await res.json();
      for (const s of batch.data || []) {
        if (s.status === 'active' || s.status === 'trialing') activeCount += 1;
        const m = months.find((x) => s.created >= x.start && s.created < x.end);
        if (m) m.new_subs += 1;
        else if (s.created < earliest) olderCount += 1;
      }
      if (!batch.has_more || !(batch.data || []).length) break;
      subUrl = `https://api.stripe.com/v1/subscriptions?limit=100&status=all&starting_after=${batch.data[batch.data.length - 1].id}`;
    }

    // Cumulative subscription totals per month
    let running = olderCount;
    for (const m of months) {
      running += m.new_subs;
      m.total_subs = running;
    }

    return Response.json({
      months: months.map(({ key, label, cents, payments, new_subs, total_subs }) => ({
        month: key,
        label,
        cents,
        payments,
        new_subs,
        total_subs,
      })),
      total_cents_last_6: months.reduce((sum, m) => sum + m.cents, 0),
      current_month_cents: months[months.length - 1].cents,
      active_subscriptions: activeCount,
    });
  } catch (error) {
    console.log('getRevenueSummary error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
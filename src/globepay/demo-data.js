// Demo dataset shown when Stripe isn't connected yet.
// Makes the product feel alive immediately; replaced by live data on connect.
const today = new Date();
const dayISO = (ago) => {
  const d = new Date(today);
  d.setDate(d.getDate() - ago);
  return d.toISOString().slice(0, 10);
};
const dayLabel = (ago) => {
  const d = new Date(today);
  d.setDate(d.getDate() - ago);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const dailyRevenue = [
  124, 89, 210, 156, 342, 278, 190, 415, 233, 167,
  389, 502, 311, 245, 478, 356, 289, 534, 421, 367,
  612, 489, 545, 398, 671, 723, 589, 812, 764, 935,
];

export const demoStats = {
  currency: 'usd',
  grossCents: 1284500,
  grossFormatted: '$12,845.00',
  salesCount: 342,
  activeSubscriptions: 87,
  mrrCents: 429900,
  mrrFormatted: '$4,299.00',
  streakDays: 12,
  availableCents: 231580,
  series: dailyRevenue.map((revenue, i) => ({
    date: dayISO(29 - i),
    label: dayLabel(29 - i),
    revenue,
  })),
  recent: [
    { id: 'ch_demo_1', amount: '$149.00', email: 'sarah@studio.co', description: 'Pro Plan — Monthly', created: Math.floor(Date.now() / 1000) - 3600, status: 'succeeded' },
    { id: 'ch_demo_2', amount: '$29.00', email: 'mike@design.io', description: 'Template Pack', created: Math.floor(Date.now() / 1000) - 7200, status: 'succeeded' },
    { id: 'ch_demo_3', amount: '$499.00', email: 'agency@brightline.com', description: 'Annual — Scale', created: Math.floor(Date.now() / 1000) - 14400, status: 'succeeded' },
    { id: 'ch_demo_4', amount: '$79.00', email: 'lena@freelance.me', description: 'Addon: Priority Support', created: Math.floor(Date.now() / 1000) - 21600, status: 'succeeded' },
    { id: 'ch_demo_5', amount: '$149.00', email: 'dev@northlabs.dev', description: 'Pro Plan — Monthly', created: Math.floor(Date.now() / 1000) - 30000, status: 'succeeded' },
    { id: 'ch_demo_6', amount: '$19.00', email: 'tom@indiehack.dev', description: 'Ebook: Launch Checklist', created: Math.floor(Date.now() / 1000) - 43000, status: 'succeeded' },
    { id: 'ch_demo_7', amount: '$299.00', email: 'ops@craftworks.co', description: 'Team Seats ×3', created: Math.floor(Date.now() / 1000) - 56000, status: 'succeeded' },
    { id: 'ch_demo_8', amount: '$49.00', email: 'ana@creator.tv', description: 'Workshop Ticket', created: Math.floor(Date.now() / 1000) - 70000, status: 'succeeded' },
  ],
};

export const demoProducts = [
  { id: 'prod_demo_1', name: 'Pro Plan', description: 'Everything you need to grow.', prices: [{ id: 'price_demo_1', amount: '$149.00', currency: 'usd', recurring: 'month' }] },
  { id: 'prod_demo_2', name: 'Template Pack', description: '50 premium templates.', prices: [{ id: 'price_demo_2', amount: '$29.00', currency: 'usd', recurring: 'one-time' }] },
  { id: 'prod_demo_3', name: 'Scale Plan', description: 'For teams doing serious volume.', prices: [{ id: 'price_demo_3', amount: '$499.00', currency: 'usd', recurring: 'month' }] },
];

export const demoLinks = [
  { id: 'plink_demo_1', url: 'https://buy.stripe.com/demo-pro-plan', active: true },
  { id: 'plink_demo_2', url: 'https://buy.stripe.com/demo-template-pack', active: true },
];

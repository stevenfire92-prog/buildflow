// GlobePay API client. Falls back to demo data when Stripe isn't connected,
// so the product experience is fully explorable before going live.
import { demoStats, demoProducts, demoLinks } from './demo-data';

async function req(path, options = {}) {
  const res = await fetch(`/api/globepay${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.code = data.error;
    throw err;
  }
  return data;
}

export const isDemoError = (e) => e?.code === 'stripe_not_configured';

export async function getStatus() {
  try {
    return await req('/status');
  } catch {
    return { connected: false };
  }
}

export async function getStats(days = 30) {
  try {
    const s = await req(`/stats?days=${days}`);
    return { ...s, demo: false };
  } catch (e) {
    if (isDemoError(e)) return { ...demoStats, demo: true };
    throw e;
  }
}

export async function getProducts() {
  try {
    const d = await req('/products');
    return { products: d.products, demo: false };
  } catch (e) {
    if (isDemoError(e)) return { products: demoProducts, demo: true };
    throw e;
  }
}

export async function createProduct(payload) {
  const d = await req('/products', { method: 'POST', body: JSON.stringify(payload) });
  return d.product;
}

export async function getPaymentLinks() {
  try {
    const d = await req('/payment-links');
    return { links: d.links, demo: false };
  } catch (e) {
    if (isDemoError(e)) return { links: demoLinks, demo: true };
    throw e;
  }
}

export async function createPaymentLink(payload) {
  const d = await req('/payment-links', { method: 'POST', body: JSON.stringify(payload) });
  return d.link;
}

// --- Goals (local-first; the addictive layer) ---
const GOALS_KEY = 'globepay:goals';

export function getGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveGoal(goal) {
  const goals = getGoals();
  const next = goal.id ? goals.map((g) => (g.id === goal.id ? goal : g)) : [...goals, { ...goal, id: `goal_${Date.now()}` }];
  localStorage.setItem(GOALS_KEY, JSON.stringify(next));
  return next;
}

export function deleteGoal(id) {
  const next = getGoals().filter((g) => g.id !== id);
  localStorage.setItem(GOALS_KEY, JSON.stringify(next));
  return next;
}

export function seedDefaultGoals() {
  if (getGoals().length > 0) return getGoals();
  const defaults = [
    { id: 'goal_seed_1', title: 'First $1,000 month', target: 1000, createdAt: Date.now() },
    { id: 'goal_seed_2', title: '100 paying customers', target: 100, metric: 'sales', createdAt: Date.now() },
    { id: 'goal_seed_3', title: '$5,000 MRR', target: 5000, metric: 'mrr', createdAt: Date.now() },
  ];
  localStorage.setItem(GOALS_KEY, JSON.stringify(defaults));
  return defaults;
}

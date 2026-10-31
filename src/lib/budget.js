// Se Fire Budget — budget data layer
// localStorage key: sfbudget:data
const KEY = 'sfbudget:data';

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#f97316', icon: '🏠' },
  { id: 'food', name: 'Food', color: '#22c55e', icon: '🍔' },
  { id: 'transport', name: 'Transport', color: '#3b82f6', icon: '🚗' },
  { id: 'entertainment', name: 'Entertainment', color: '#a855f7', icon: '🎬' },
  { id: 'savings', name: 'Savings', color: '#eab308', icon: '💰' },
  { id: 'other', name: 'Other', color: '#64748b', icon: '📦' },
];

function blankData() {
  return { budgets: {}, expenses: [] };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blankData(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return blankData();
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export function expensesForMonth(data, mkey) {
  return (data.expenses || []).filter((e) => e.month === mkey);
}

export function spentByCategory(data, mkey) {
  const out = {};
  for (const e of expensesForMonth(data, mkey)) {
    out[e.category] = (out[e.category] || 0) + Number(e.amount || 0);
  }
  return out;
}

export function monthSummary(data, mkey) {
  const spent = spentByCategory(data, mkey);
  let totalBudget = 0;
  let totalSpent = 0;
  const rows = CATEGORIES.map((c) => {
    const budget = Number((data.budgets || {})[c.id] || 0);
    const s = Number(spent[c.id] || 0);
    totalBudget += budget;
    totalSpent += s;
    const pct = budget > 0 ? Math.min(100, Math.round((s / budget) * 100)) : (s > 0 ? 100 : 0);
    const overspent = budget > 0 && s > budget;
    return { ...c, budget, spent: s, pct, overspent };
  });
  return { rows, totalBudget, totalSpent, overspentTotal: totalBudget > 0 && totalSpent > totalBudget };
}

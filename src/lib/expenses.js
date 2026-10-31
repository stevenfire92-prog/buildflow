// Expense tracker engine — localStorage backed
const KEY = 'sfexp:expenses';

export const CATEGORIES = [
  { id: 'food', name: 'Food', color: '#f97316' },
  { id: 'transport', name: 'Transport', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', color: '#ec4899' },
  { id: 'bills', name: 'Bills', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6' },
  { id: 'health', name: 'Health', color: '#10b981' },
  { id: 'other', name: 'Other', color: '#64748b' },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getExpenses() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(KEY, JSON.stringify(expenses));
}

export function addExpense({ amount, category, description, date }) {
  const expenses = getExpenses();
  const expense = {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    amount: Math.abs(Number(amount) || 0),
    category: category || 'other',
    description: (description || '').trim() || getCategory(category).name,
    date: date || new Date().toISOString().split('T')[0],
    created: new Date().toISOString(),
  };
  expenses.push(expense);
  saveExpenses(expenses);
  return expense;
}

export function deleteExpense(id) {
  saveExpenses(getExpenses().filter((e) => e.id !== id));
}

export function getMonthKey(dateStr) {
  return (dateStr || '').slice(0, 7); // YYYY-MM
}

export function getCurrentMonthKey() {
  return new Date().toISOString().split('T')[0].slice(0, 7);
}

export function filterByMonth(expenses, monthKey) {
  return expenses.filter((e) => getMonthKey(e.date) === monthKey);
}

export function getTotal(expenses) {
  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

export function getCategoryBreakdown(expenses) {
  const map = {};
  for (const e of expenses) {
    const cat = getCategory(e.category);
    if (!map[cat.id]) {
      map[cat.id] = { ...cat, total: 0, count: 0 };
    }
    map[cat.id].total += Number(e.amount) || 0;
    map[cat.id].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export function formatMoney(n) {
  return '$' + (Number(n) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

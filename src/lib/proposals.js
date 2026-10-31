// Se Fire Proposals — proposal data layer
// localStorage key: sfprop:proposals
const KEY = 'sfprop:proposals';

export const STATUSES = ['Draft', 'Sent', 'Accepted'];

export function loadProposals() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveProposals(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export function calcTotals(items, taxRate) {
  const subtotal = (items || []).reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
    0
  );
  const tax = subtotal * (Number(taxRate || 0) / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

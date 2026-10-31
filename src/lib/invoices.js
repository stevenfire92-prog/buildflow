// Invoice storage engine — localStorage backed
const KEY = 'sfinv:invoices';

export function getInvoices() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveInvoices(invoices) {
  localStorage.setItem(KEY, JSON.stringify(invoices));
}

export function getInvoice(id) {
  return getInvoices().find((i) => i.id === id);
}

export function upsertInvoice(inv) {
  const invoices = getInvoices();
  const idx = invoices.findIndex((i) => i.id === inv.id);
  if (idx >= 0) invoices[idx] = inv;
  else invoices.unshift(inv);
  saveInvoices(invoices);
  return inv;
}

export function deleteInvoice(id) {
  saveInvoices(getInvoices().filter((i) => i.id !== id));
}

export function setStatus(id, status) {
  const invoices = getInvoices();
  const inv = invoices.find((i) => i.id === id);
  if (inv) {
    inv.status = status;
    saveInvoices(invoices);
  }
}

export function nextInvoiceNumber() {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(invoices.length + 1).padStart(4, '0')}`;
}

export function blankInvoice() {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return {
    id: Date.now().toString(),
    number: nextInvoiceNumber(),
    status: 'draft',
    businessName: 'Se Fire Tech',
    businessEmail: '',
    businessAddress: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: today,
    dueDate: due.toISOString().split('T')[0],
    items: [{ id: '1', description: '', quantity: 1, rate: 0 }],
    taxRate: 0,
    discount: 0,
    notes: '',
    createdAt: new Date().toISOString(),
  };
}

export function calcTotals(inv) {
  const subtotal = (inv.items || []).reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
    0
  );
  const discount = Number(inv.discount) || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * ((Number(inv.taxRate) || 0) / 100);
  const total = afterDiscount + tax;
  return { subtotal, discount, tax, total };
}

export function formatMoney(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

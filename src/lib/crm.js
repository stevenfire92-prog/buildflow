// Se Fire CRM — contact data layer
// localStorage key: sfcrm:contacts
const KEY = 'sfcrm:contacts';

export const STATUSES = [
  { id: 'lead', label: 'Lead', color: '#3b82f6' },
  { id: 'contacted', label: 'Contacted', color: '#eab308' },
  { id: 'proposal', label: 'Proposal', color: '#a855f7' },
  { id: 'closed', label: 'Closed', color: '#22c55e' },
];

export function blankContact() {
  return { id: '', name: '', email: '', phone: '', company: '', status: 'lead', notes: [], ts: 0 };
}

export function loadContacts() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) || [];
  } catch { /* ignore */ }
  return [];
}

export function saveContacts(contacts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(contacts));
  } catch { /* ignore */ }
}

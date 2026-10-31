// Digital business card engine — localStorage backed
const KEY = 'sfcards:cards';

export function getCards() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCards(cards) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function addCard(data) {
  const cards = getCards();
  const card = {
    id: Date.now().toString(),
    created: new Date().toISOString(),
    ...data,
  };
  cards.push(card);
  saveCards(cards);
  return card;
}

export function updateCard(id, data) {
  const cards = getCards().map((c) => (c.id === id ? { ...c, ...data } : c));
  saveCards(cards);
}

export function deleteCard(id) {
  saveCards(getCards().filter((c) => c.id !== id));
}

// Generate vCard 3.0 text from card data
export function toVCard(card) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name || ''}`,
    `N:${card.name || ''};;;;`,
  ];
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.phone) lines.push(`TEL;TYPE=WORK,VOICE:${card.phone}`);
  if (card.email) lines.push(`EMAIL;TYPE=WORK:${card.email}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${card.twitter}`);
  if (card.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${card.instagram}`);
  if (card.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${card.linkedin}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(card) {
  const vcf = toVCard(card);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(card.name || 'contact').replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

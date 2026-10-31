const KEY = 'sfjournal:entries';

export const MOODS = [
  { id: 'happy', emoji: '😄', label: 'Happy' },
  { id: 'good', emoji: '🙂', label: 'Good' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'low', emoji: '😟', label: 'Low' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

/** Convert a Date to "YYYY-MM-DD" key (local time) */
export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey() {
  return toKey(new Date());
}

/** Parse a "YYYY-MM-DD" key into a local Date */
export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Saturday, October 31, 2026" */
export function formatLong(key) {
  return keyToDate(key).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** "Oct 31, 2026" */
export function formatShort(key) {
  return keyToDate(key).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function moodById(id) {
  return MOODS.find((m) => m.id === id) || null;
}

/** Load all entries: object keyed by "YYYY-MM-DD" */
export function loadEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persist(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — keep app functional
  }
}

export function saveEntry(date, mood, text) {
  const entries = loadEntries();
  if (!text || !text.trim()) {
    delete entries[date];
  } else {
    entries[date] = { mood, text, updatedAt: new Date().toISOString() };
  }
  persist(entries);
  return entries;
}

export function deleteEntry(date) {
  const entries = loadEntries();
  delete entries[date];
  persist(entries);
  return entries;
}

/** Search entry text; returns array of {key, entry} sorted newest first */
export function searchEntries(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const entries = loadEntries();
  return Object.entries(entries)
    .filter(([, e]) => e.text && e.text.toLowerCase().includes(q))
    .map(([key, entry]) => ({ key, entry }))
    .sort((a, b) => (b.key < a.key ? -1 : b.key > a.key ? 1 : 0));
}

export function wordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/** Consecutive days with entries, ending today (or yesterday if today is empty) */
export function currentStreak(entries) {
  let streak = 0;
  const d = new Date();
  if (!entries[toKey(d)]) {
    d.setDate(d.getDate() - 1);
  }
  while (entries[toKey(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

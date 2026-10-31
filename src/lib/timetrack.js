// Se Fire Timetrack — time tracking data layer
// localStorage key: sftime:entries
const KEY = 'sftime:entries';

function blankData() {
  return { projects: [], entries: [] };
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

export function fmtDuration(secs) {
  secs = Math.max(0, Math.floor(secs || 0));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const s = secs % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday start
  return d.getTime();
}

export function shiftWeek(ts, delta) {
  return ts + delta * 7 * 24 * 3600 * 1000;
}

export function weekLabel(ts) {
  const start = new Date(ts);
  const end = new Date(ts + 6 * 24 * 3600 * 1000);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function entriesForWeek(data, weekStartTs) {
  const end = weekStartTs + 7 * 24 * 3600 * 1000;
  return (data.entries || []).filter((e) => {
    const t = e.startTs || 0;
    return t >= weekStartTs && t < end;
  });
}

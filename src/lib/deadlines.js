export function daysUntil(dateStr) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d - startOfToday) / 86400000);
}

export function urgencyClasses(deadlineStr) {
  const days = daysUntil(deadlineStr);
  if (days < 0) return "bg-red-500/15 text-red-400 border-red-500/25";
  if (days <= 3) return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  if (days <= 7) return "bg-sky-500/15 text-sky-400 border-sky-500/25";
  return "bg-white/10 text-white/60 border-white/10";
}
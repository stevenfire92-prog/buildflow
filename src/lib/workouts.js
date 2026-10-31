// Workout engine — localStorage backed
const KEY = 'sffit:workouts';

export function getWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveWorkouts(workouts) {
  localStorage.setItem(KEY, JSON.stringify(workouts));
}

export function addWorkout({ exercise, sets, reps, weight, date }) {
  const workouts = getWorkouts();
  const entry = {
    id: Date.now().toString() + Math.floor(Math.random() * 10000),
    exercise,
    sets: Number(sets),
    reps: Number(reps),
    weight: Number(weight) || 0,
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  workouts.push(entry);
  saveWorkouts(workouts);
  return entry;
}

export function deleteWorkout(id) {
  saveWorkouts(getWorkouts().filter((w) => w.id !== id));
}

export function dateLabel(iso) {
  const d = new Date(iso + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isoToday = today.toISOString().split('T')[0];
  const isoYesterday = yesterday.toISOString().split('T')[0];
  if (iso === isoToday) return 'Today';
  if (iso === isoYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Workouts grouped by date, newest first
export function groupByDate(workouts) {
  const groups = {};
  workouts.forEach((w) => {
    if (!groups[w.date]) groups[w.date] = [];
    groups[w.date].push(w);
  });
  return Object.keys(groups)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((date) => ({ date, entries: groups[date] }));
}

// Stats for the last 7 days
export function getWeekStats(workouts) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const recent = workouts.filter((w) => w.date >= cutoffStr);
  const totalSets = recent.reduce((s, w) => s + w.sets, 0);
  const totalReps = recent.reduce((s, w) => s + w.sets * w.reps, 0);
  const totalVolume = recent.reduce((s, w) => s + w.sets * w.reps * w.weight, 0);
  const days = new Set(recent.map((w) => w.date)).size;
  return { totalSets, totalReps, totalVolume, days, count: recent.length };
}

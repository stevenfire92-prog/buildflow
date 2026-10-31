// Habit tracker engine — localStorage backed
const KEY = 'sfhabits:habits';

export function getHabits() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveHabits(habits) {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

export function addHabit(name, color = '#f97316') {
  const habits = getHabits();
  const habit = {
    id: Date.now().toString(),
    name,
    color,
    created: new Date().toISOString(),
    completions: {}, // date string -> true
  };
  habits.push(habit);
  saveHabits(habits);
  return habit;
}

export function deleteHabit(id) {
  saveHabits(getHabits().filter((h) => h.id !== id));
}

export function toggleToday(id) {
  const habits = getHabits();
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;
  const today = new Date().toISOString().split('T')[0];
  if (habit.completions[today]) {
    delete habit.completions[today];
  } else {
    habit.completions[today] = true;
  }
  saveHabits(habits);
}

export function getStreak(habit) {
  let streak = 0;
  const d = new Date();
  // If today not done, start from yesterday
  const todayStr = d.toISOString().split('T')[0];
  if (!habit.completions[todayStr]) {
    d.setDate(d.getDate() - 1);
  }
  while (true) {
    const str = d.toISOString().split('T')[0];
    if (habit.completions[str]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getWeekData(habit) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = d.toISOString().split('T')[0];
    days.push({
      date: str,
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      done: !!habit.completions[str],
    });
  }
  return days;
}

export function isDoneToday(habit) {
  const today = new Date().toISOString().split('T')[0];
  return !!habit.completions[today];
}

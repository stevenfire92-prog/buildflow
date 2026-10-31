export const CATEGORIES = ['Health', 'Career', 'Finance', 'Personal', 'Learning']

const KEY = 'sfgoals:goals'

export function loadGoals() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals))
  } catch {
    // storage full or unavailable — ignore
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** progress: 0-100 (milestones done/total; 100 if completed; 0 if no milestones) */
export function progress(goal) {
  if (goal.completed) return 100
  const ms = goal.milestones || []
  if (ms.length === 0) return 0
  const done = ms.filter((m) => m.done).length
  return Math.round((done / ms.length) * 100)
}

/** whole days until target date (null when no date) */
export function daysLeft(goal) {
  if (!goal.targetDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(goal.targetDate + 'T00:00:00')
  return Math.round((target - today) / 86400000)
}

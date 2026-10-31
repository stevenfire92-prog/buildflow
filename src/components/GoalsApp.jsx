import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Plus, Target, Trophy, Check, X, CalendarDays, Trash2, Undo2, Flame,
} from 'lucide-react'
import { CATEGORIES, loadGoals, saveGoals, progress, daysLeft, uid } from '../lib/goals'

const CATEGORY_COLORS = {
  Health: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Career: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Finance: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Personal: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  Learning: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

export default function GoalsApp() {
  const [goals, setGoals] = useState(loadGoals)
  const [catFilter, setCatFilter] = useState('All')
  const [status, setStatus] = useState('Active') // Active | Completed
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [targetDate, setTargetDate] = useState('')
  const [milestoneText, setMilestoneText] = useState('')
  const [newMilestones, setNewMilestones] = useState({}) // goalId -> input text

  const persist = (next) => {
    setGoals(next)
    saveGoals(next)
  }

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      const statusOk = status === 'Active' ? !g.completed : g.completed
      const catOk = catFilter === 'All' || g.category === catFilter
      return statusOk && catOk
    })
  }, [goals, catFilter, status])

  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.completed)
    const done = goals.filter((g) => g.completed)
    const avg = goals.length
      ? Math.round(goals.reduce((s, g) => s + progress(g), 0) / goals.length)
      : 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const weekOut = new Date(now.getTime() + 7 * 86400000)
    const dueWeek = active.filter((g) => {
      if (!g.targetDate) return false
      const t = new Date(g.targetDate + 'T00:00:00')
      return t >= now && t <= weekOut
    }).length
    return { active: active.length, done: done.length, avg, dueWeek }
  }, [goals])

  const createGoal = () => {
    if (!title.trim()) {
      toast.error('Give your goal a title first.')
      return
    }
    const milestones = milestoneText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((text) => ({ id: uid(), text, done: false }))
    const goal = {
      id: uid(),
      title: title.trim(),
      category,
      targetDate,
      milestones,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    persist([goal, ...goals])
    toast.success('Goal set! Now go crush it. 🎯')
    setTitle('')
    setCategory(CATEGORIES[0])
    setTargetDate('')
    setMilestoneText('')
    setModalOpen(false)
    setStatus('Active')
  }

  const deleteGoal = (id) => {
    if (!window.confirm('Delete this goal? This can\'t be undone.')) return
    persist(goals.filter((g) => g.id !== id))
    toast.success('Goal deleted.')
  }

  const markComplete = (id) => {
    persist(goals.map((g) => (g.id === id ? { ...g, completed: true } : g)))
    toast.success('🎉 Goal crushed!', {
      description: 'You hit the target. Celebrate it — then set the next one.',
    })
  }

  const reopenGoal = (id) => {
    persist(goals.map((g) => (g.id === id ? { ...g, completed: false } : g)))
    toast.info('Goal reopened — keep pushing.')
  }

  const toggleMilestone = (goalId, milestoneId) => {
    persist(
      goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, done: !m.done } : m
              ),
            }
          : g
      )
    )
  }

  const addMilestone = (goalId) => {
    const text = (newMilestones[goalId] || '').trim()
    if (!text) {
      toast.error('Type a milestone first.')
      return
    }
    persist(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: [...g.milestones, { id: uid(), text, done: false }] }
          : g
      )
    )
    setNewMilestones({ ...newMilestones, [goalId]: '' })
  }

  const deleteMilestone = (goalId, milestoneId) => {
    persist(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: g.milestones.filter((m) => m.id !== milestoneId) }
          : g
      )
    )
  }

  const statCard = (label, value, icon, color) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Target className="h-6 w-6 text-orange-400" />
          Your Goals
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCard('Active goals', stats.active, <Flame className="h-4 w-4" />, 'bg-orange-500/20 text-orange-300')}
        {statCard('Completed', stats.done, <Trophy className="h-4 w-4" />, 'bg-yellow-500/20 text-yellow-300')}
        {statCard('Avg progress', `${stats.avg}%`, <Target className="h-4 w-4" />, 'bg-sky-500/20 text-sky-300')}
        {statCard('Due this week', stats.dueWeek, <CalendarDays className="h-4 w-4" />, 'bg-emerald-500/20 text-emerald-300')}
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              catFilter === c
                ? 'border-orange-400 bg-orange-500/20 text-orange-200'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
        {['Active', 'Completed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
              status === s ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Goal cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <Target className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-lg font-semibold">
            {status === 'Active' ? 'No active goals yet' : 'No completed goals yet'}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {status === 'Active'
              ? 'Set your first goal and start building momentum.'
              : 'Finish a goal and it lands here with a trophy.'}
          </p>
          {status === 'Active' && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 font-semibold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Set a Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((goal) => {
            const pct = progress(goal)
            const dl = daysLeft(goal)
            return (
              <div
                key={goal.id}
                className={`rounded-2xl border p-5 ${
                  goal.completed
                    ? 'border-yellow-400/30 bg-yellow-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                      {goal.completed && <Trophy className="h-5 w-5 shrink-0 text-yellow-400" />}
                      <span className={goal.completed ? 'line-through opacity-70' : ''}>
                        {goal.title}
                      </span>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          CATEGORY_COLORS[goal.category] || 'bg-white/10 text-white/70 border-white/20'
                        }`}
                      >
                        {goal.category}
                      </span>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1 text-xs text-white/60">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {goal.targetDate}
                          {dl !== null && !goal.completed && (
                            <span
                              className={`font-semibold ${
                                dl < 0 ? 'text-red-400' : dl <= 7 ? 'text-amber-300' : 'text-white/60'
                              }`}
                            >
                              ({dl < 0 ? `${-dl}d overdue` : dl === 0 ? 'due today' : `${dl}d left`})
                            </span>
                          )}
                        </span>
                      )}
                      {goal.completed && (
                        <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-bold text-yellow-300">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="rounded-full p-1.5 text-white/40 transition hover:bg-red-500/20 hover:text-red-300"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-white/60">
                    <span>Progress</span>
                    <span className="font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  {(goal.milestones || []).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm">
                      <button
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        disabled={goal.completed}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          m.done
                            ? 'border-orange-400 bg-orange-500 text-white'
                            : 'border-white/25 bg-white/5 hover:border-orange-400'
                        } ${goal.completed ? 'opacity-50' : ''}`}
                        aria-label={m.done ? 'Uncheck milestone' : 'Check milestone'}
                      >
                        {m.done && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <span className={`flex-1 ${m.done ? 'text-white/50 line-through' : ''}`}>
                        {m.text}
                      </span>
                      {!goal.completed && (
                        <button
                          onClick={() => deleteMilestone(goal.id, m.id)}
                          className="text-white/30 hover:text-red-300"
                          aria-label="Delete milestone"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!goal.completed && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newMilestones[goal.id] || ''}
                      onChange={(e) => setNewMilestones({ ...newMilestones, [goal.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addMilestone(goal.id)}
                      placeholder="Add a milestone…"
                      className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
                    />
                    <button
                      onClick={() => addMilestone(goal.id)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Complete / reopen */}
                <div className="mt-4">
                  {goal.completed ? (
                    <button
                      onClick={() => reopenGoal(goal.id)}
                      className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
                    >
                      <Undo2 className="h-4 w-4" /> Reopen
                    </button>
                  ) : (
                    <button
                      onClick={() => markComplete(goal.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110"
                    >
                      <Trophy className="h-4 w-4" /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New goal modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Set a New Goal</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-semibold text-white/70">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run a 5K by December"
              className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
            />
            <label className="mb-1 block text-sm font-semibold text-white/70">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 focus:border-orange-400 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="mb-1 block text-sm font-semibold text-white/70">Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 focus:border-orange-400 focus:outline-none"
            />
            <label className="mb-1 block text-sm font-semibold text-white/70">
              Milestones <span className="font-normal text-white/40">(one per line)</span>
            </label>
            <textarea
              value={milestoneText}
              onChange={(e) => setMilestoneText(e.target.value)}
              placeholder={'e.g.\nWeek 1: run 1K\nWeek 2: run 3K\nWeek 4: race day'}
              rows={4}
              className="mb-5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
            />
            <button
              onClick={createGoal}
              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 py-3 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110"
            >
              Set Goal 🎯
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

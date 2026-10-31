import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Flame, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { getHabits, addHabit, deleteHabit, toggleToday, getStreak, getWeekData, isDoneToday } from '../lib/habits';

const COLORS = ['#f97316', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

export default function Tracker() {
  const [habits, setHabits] = useState([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const refresh = () => setHabits(getHabits());

  const handleAdd = (e) => {
    e?.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addHabit(name, newColor);
    setNewName('');
    setShowAdd(false);
    refresh();
    toast.success(`"${name}" added — let's build that streak! 🔥`);
  };

  const handleToggle = (habit) => {
    const wasDone = isDoneToday(habit);
    toggleToday(habit.id);
    refresh();
    if (!wasDone) {
      const updated = getHabits().find((h) => h.id === habit.id);
      const streak = getStreak(updated);
      if (streak > 0 && streak % 7 === 0) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.4 } });
        toast.success(`${streak}-day streak! Incredible! 🎉`);
      } else {
        toast.success('Done for today! ✓');
      }
    }
  };

  const handleDelete = (id, name) => {
    deleteHabit(id);
    refresh();
    toast.success(`"${name}" removed`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">My Habits</h1>
          <p className="text-slate-400 text-sm mt-1">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} · {habits.filter(isDoneToday).length} done today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Cancel' : 'New habit'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Morning run, Read 20 pages, No sugar..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:border-orange-400/50"
                autoFocus
              />
              <div className="flex items-center gap-2 mb-4">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-8 h-8 rounded-full transition ${newColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-40"
              >
                Add habit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {habits.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <Flame className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">No habits yet</p>
          <p className="text-sm text-slate-500">Add your first habit and start building streaks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const streak = getStreak(habit);
            const done = isDoneToday(habit);
            const week = getWeekData(habit);
            return (
              <motion.div
                key={habit.id}
                layout
                className={`rounded-2xl border p-5 transition ${done ? 'border-emerald-400/30 bg-emerald-400/[0.04]' : 'border-white/10 bg-white/[0.03]'}`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(habit)}
                    className="grid place-items-center w-12 h-12 rounded-xl shrink-0 transition"
                    style={{ background: done ? habit.color : 'rgba(255,255,255,0.06)', border: `2px solid ${habit.color}` }}
                  >
                    {done && <Check className="w-6 h-6 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${done ? 'line-through text-slate-500' : ''}`}>{habit.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-300">
                          <Flame className="w-3.5 h-3.5" /> {streak} day{streak !== 1 ? 's' : ''}
                        </span>
                      )}
                      <div className="flex gap-1">
                        {week.map((d) => (
                          <span
                            key={d.date}
                            title={d.date}
                            className="w-5 h-5 rounded text-[9px] grid place-items-center font-bold"
                            style={{
                              background: d.done ? habit.color : 'rgba(255,255,255,0.06)',
                              color: d.done ? '#fff' : '#64748b',
                            }}
                          >
                            {d.day[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(habit.id, habit.name)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

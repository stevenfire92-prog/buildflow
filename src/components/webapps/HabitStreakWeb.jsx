import React, { useState } from "react";
import { Flame, Plus, CheckCircle2, Shield, Trash2, CalendarCheck, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialHabits = [
  { id: "h-1", title: "Morning Cold Shower & Hydration", category: "Health", streak: 28, completedToday: true, freezeUsed: false },
  { id: "h-2", title: "Deep Work Sprint (90 min uninterrupted)", category: "Focus", streak: 14, completedToday: true, freezeUsed: false },
  { id: "h-3", title: "Shadow Path Novel Writing (1,000 words)", category: "Focus", streak: 42, completedToday: false, freezeUsed: false },
  { id: "h-4", title: "Post-Workout Foam Rolling & Mobility", category: "Health", streak: 7, completedToday: false, freezeUsed: false },
  { id: "h-5", title: "Evening Journaling & Retrospective", category: "Mindfulness", streak: 19, completedToday: true, freezeUsed: false },
  { id: "h-6", title: "Review Cash-Flow & Stripe Invoices", category: "Finance", streak: 11, completedToday: false, freezeUsed: false },
];

export default function HabitStreakWeb() {
  const { toast } = useToast();
  const [habits, setHabits] = useState(initialHabits);
  const [filterCategory, setFilterCategory] = useState("All");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Health");
  const [vacationMode, setVacationMode] = useState(false);
  const [shieldAvailable, setShieldAvailable] = useState(3);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nowDone = !h.completedToday;
        return {
          ...h,
          completedToday: nowDone,
          streak: nowDone ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      })
    );
    toast({ title: "Habit Updated", description: "Streak telemetry recorded." });
  };

  const handleStreakFreeze = (id) => {
    if (shieldAvailable <= 0) {
      toast({ title: "No Streak Shields Left", description: "Earn more shields by hitting 7-day milestones." });
      return;
    }
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, freezeUsed: true } : h))
    );
    setShieldAvailable((prev) => Math.max(0, prev - 1));
    toast({
      title: "Streak Freeze Activated 🛡️",
      description: "Your streak is protected for today even if uncompleted.",
    });
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = {
      id: "h-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      streak: 1,
      completedToday: false,
      freezeUsed: false,
    };
    setHabits([...habits, item]);
    setNewTitle("");
    toast({ title: "Habit Created", description: `Added "${item.title}" to your routine.` });
  };

  const removeHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const categories = ["All", "Health", "Focus", "Mindfulness", "Finance"];
  const visibleHabits =
    filterCategory === "All"
      ? habits
      : habits.filter((h) => h.category === filterCategory);

  const doneCount = habits.filter((h) => h.completedToday).length;
  const completionRate = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <Flame className="w-3.5 h-3.5" /> Best Streak
          </div>
          <p className="text-2xl font-bold text-white">{bestStreak} Days</p>
          <p className="text-[11px] text-white/50">Top 1% discipline score</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <CalendarCheck className="w-3.5 h-3.5" /> Today's Completion
          </div>
          <p className="text-2xl font-bold text-white">{completionRate}%</p>
          <p className="text-[11px] text-white/50">{doneCount} of {habits.length} habits done</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
            <Shield className="w-3.5 h-3.5" /> Streak Shields
          </div>
          <p className="text-2xl font-bold text-white">{shieldAvailable} Available</p>
          <p className="text-[11px] text-white/50">Emergency freeze protection</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Vacation Guard
          </div>
          <button
            onClick={() => {
              setVacationMode(!vacationMode);
              toast({
                title: vacationMode ? "Vacation Mode Disabled" : "Vacation Mode Active",
                description: vacationMode ? "Daily check-ins resumed." : "All active streaks paused safely.",
              });
            }}
            className={`mt-1 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              vacationMode
                ? "bg-purple-500 text-white border-purple-400"
                : "bg-white/10 text-white/70 border-white/15 hover:text-white"
            }`}
          >
            {vacationMode ? "🏖️ Shielded" : "Toggle Pause"}
          </button>
        </div>
      </div>

      {/* Habit Checklist & Category Filter */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Daily Habit Protocols</h3>
            <p className="text-xs text-white/50">
              Check off daily atomic routines to fuel dopamine momentum.
            </p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filterCategory === cat
                    ? "bg-white text-black font-semibold"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {visibleHabits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                habit.completedToday
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    habit.completedToday
                      ? "bg-emerald-500 text-black font-bold"
                      : "border border-white/30 hover:border-white text-transparent"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      habit.completedToday ? "line-through text-white/40" : "text-white"
                    }`}
                  >
                    {habit.title}
                  </p>
                  <span className="text-[11px] text-white/40">{habit.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{habit.streak}d</span>
                </div>

                {!habit.completedToday && (
                  <button
                    onClick={() => handleStreakFreeze(habit.id)}
                    title="Protect streak with shield"
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      habit.freezeUsed
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        : "bg-white/5 text-white/50 border-white/10 hover:text-sky-300 hover:border-sky-500/30"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => removeHabit(habit.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Habit Form */}
        <form onSubmit={addHabit} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-4 mt-4 border-t border-white/10">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New habit protocol..."
            className="sm:col-span-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="Health" className="bg-neutral-900 text-white">Health</option>
            <option value="Focus" className="bg-neutral-900 text-white">Focus</option>
            <option value="Mindfulness" className="bg-neutral-900 text-white">Mindfulness</option>
            <option value="Finance" className="bg-neutral-900 text-white">Finance</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Protocol
          </button>
        </form>
      </div>
    </div>
  );
}
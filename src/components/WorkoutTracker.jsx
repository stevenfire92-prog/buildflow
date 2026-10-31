import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Dumbbell, Flame, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkouts, addWorkout, deleteWorkout, dateLabel, groupByDate, getWeekStats } from '../lib/workouts';

const QUICK_EXERCISES = [
  'Push-ups', 'Squats', 'Bench Press', 'Deadlift',
  'Pull-ups', 'Overhead Press', 'Barbell Row', 'Lunges',
  'Bicep Curl', 'Plank', 'Leg Press', 'Dips',
];

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setWorkouts(getWorkouts());
  }, []);

  const refresh = () => setWorkouts(getWorkouts());

  const handleSubmit = (e) => {
    e?.preventDefault();
    const name = exercise.trim();
    if (!name) return;
    if (!sets || Number(sets) < 1) {
      toast.error('Sets must be at least 1');
      return;
    }
    if (!reps || Number(reps) < 1) {
      toast.error('Reps must be at least 1');
      return;
    }
    addWorkout({ exercise: name, sets, reps, weight, date });
    refresh();
    toast.success(`${name} logged — keep grinding! 💪`);
    setExercise('');
    setSets('3');
    setReps('10');
    setWeight('');
    setShowForm(false);
  };

  const handleQuickAdd = (name) => {
    setExercise(name);
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    deleteWorkout(id);
    refresh();
    toast.success(`"${name}" removed`);
  };

  const stats = getWeekStats(workouts);
  const groups = groupByDate(workouts);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Weekly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Workouts', value: stats.count, icon: Dumbbell },
          { label: 'Sets', value: stats.totalSets, icon: Plus },
          { label: 'Total reps', value: stats.totalReps.toLocaleString(), icon: Flame },
          { label: 'Active days', value: `${stats.days}/7`, icon: ChevronDown },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto text-orange-400 mb-1.5" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center -mt-5 mb-8">Last 7 days</p>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black">Log</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log workout'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <input
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="Exercise name (e.g. Bench Press)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-500">Sets</span>
                  <input
                    type="number" min="1" value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">Reps</span>
                  <input
                    type="number" min="1" value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-500">Weight (lbs)</span>
                  <input
                    type="number" min="0" value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Bodyweight"
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-slate-500">Date</span>
                <input
                  type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-orange-400/50 [color-scheme:dark]"
                />
              </label>
              <button
                type="submit"
                disabled={!exercise.trim()}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-40"
              >
                Save workout
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Quick add */}
      <div className="mb-8">
        <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXERCISES.map((name) => (
            <button
              key={name}
              onClick={() => handleQuickAdd(name)}
              className="px-3.5 py-1.5 rounded-full text-sm border border-white/10 bg-white/[0.03] hover:border-orange-400/50 hover:text-orange-200 transition"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {groups.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <Dumbbell className="w-12 h-12 mx-auto text-slate-700 mb-4" />
          <p className="text-slate-400 mb-2">No workouts logged yet</p>
          <p className="text-sm text-slate-500">Log your first set and start building strength.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.date}>
              <p className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {dateLabel(g.date)}
              </p>
              <div className="space-y-2.5">
                {g.entries.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center gap-4"
                  >
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shrink-0">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{w.exercise}</p>
                      <p className="text-sm text-slate-400">
                        {w.sets} × {w.reps}{w.weight > 0 && ` @ ${w.weight} lbs`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(w.id, w.exercise)}
                      className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

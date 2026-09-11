import React, { useState } from "react";
import { Dumbbell, Plus, Trash2, CheckCircle2, Flame, Award, HeartPulse, Sparkles, Share2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const initialExercises = [
  { id: "ex-1", name: "Barbell Bench Press", sets: 3, reps: 8, weight: 185, rpe: 8, done: true },
  { id: "ex-2", name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 65, rpe: 8.5, done: true },
  { id: "ex-3", name: "Cable Chest Flyes", sets: 3, reps: 12, weight: 35, rpe: 9, done: false },
  { id: "ex-4", name: "Triceps Rope Pushdown", sets: 4, reps: 12, weight: 55, rpe: 9, done: false },
];

export default function FitnessTrackerWeb() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState(initialExercises);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(135);
  const [rpe, setRpe] = useState(8);
  const [routineType, setRoutineType] = useState("Push (Chest/Triceps)");
  const [deviceConnected, setDeviceConnected] = useState("Apple Health (Live)");
  const [streakDays] = useState(14);

  // 1RM calculator
  const [calcWeight, setCalcWeight] = useState(225);
  const [calcReps, setCalcReps] = useState(5);
  const estimated1RM = Math.round(calcWeight * (1 + calcReps / 30));

  const toggleDone = (id) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, done: !ex.done } : ex))
    );
  };

  const addExercise = (e) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    const newEx = {
      id: "ex-" + Date.now(),
      name: exerciseName.trim(),
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: Number(weight) || 100,
      rpe: Number(rpe) || 8,
      done: false,
    };
    setExercises([...exercises, newEx]);
    setExerciseName("");
    toast({ title: "Exercise added", description: `${newEx.name} added to your session.` });
  };

  const removeExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const generateAiRoutine = (split) => {
    setRoutineType(split);
    let sample = [];
    if (split.includes("Leg")) {
      sample = [
        { id: "ex-l1", name: "Barbell Back Squat", sets: 4, reps: 6, weight: 275, rpe: 8.5, done: false },
        { id: "ex-l2", name: "Romanian Deadlift", sets: 3, reps: 8, weight: 225, rpe: 8, done: false },
        { id: "ex-l3", name: "Leg Press (Quad focus)", sets: 3, reps: 12, weight: 450, rpe: 9, done: false },
        { id: "ex-l4", name: "Standing Calf Raises", sets: 4, reps: 15, weight: 140, rpe: 9.5, done: false },
      ];
    } else if (split.includes("Pull")) {
      sample = [
        { id: "ex-p1", name: "Conventional Deadlift", sets: 3, reps: 5, weight: 315, rpe: 8, done: false },
        { id: "ex-p2", name: "Weighted Pull-ups", sets: 3, reps: 8, weight: 25, rpe: 8.5, done: false },
        { id: "ex-p3", name: "Barbell Bent-Over Row", sets: 3, reps: 10, weight: 185, rpe: 8, done: false },
        { id: "ex-p4", name: "Incline Bicep Curls", sets: 3, reps: 12, weight: 35, rpe: 9, done: false },
      ];
    } else {
      sample = [
        { id: "ex-h1", name: "Kettlebell Swings", sets: 4, reps: 20, weight: 53, rpe: 8, done: false },
        { id: "ex-h2", name: "Burpee Box Jumps", sets: 4, reps: 15, weight: 0, rpe: 9, done: false },
        { id: "ex-h3", name: "Assault Bike Sprint", sets: 5, reps: 1, weight: 0, rpe: 9.5, done: false },
      ];
    }
    setExercises(sample);
    toast({
      title: "AI Routine Generated",
      description: `Loaded progressive routine for ${split}.`,
    });
  };

  const completedCount = exercises.filter((x) => x.done).length;
  const totalVolume = exercises
    .filter((x) => x.done)
    .reduce((acc, cur) => acc + cur.sets * cur.reps * cur.weight, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
            <Flame className="w-4 h-4" /> Streak
          </div>
          <p className="text-2xl font-bold text-white">{streakDays} Days</p>
          <p className="text-[11px] text-white/50">Top 5% consistency</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </div>
          <p className="text-2xl font-bold text-white">
            {completedCount} / {exercises.length}
          </p>
          <p className="text-[11px] text-white/50">Exercises logged</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
            <Dumbbell className="w-4 h-4" /> Total Volume
          </div>
          <p className="text-2xl font-bold text-white">{totalVolume.toLocaleString()} lbs</p>
          <p className="text-[11px] text-white/50">Tonnage lifted today</p>
        </div>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-rose-400 font-medium mb-1">
            <HeartPulse className="w-4 h-4" /> Biometrics
          </div>
          <p className="text-sm font-semibold text-white truncate">{deviceConnected}</p>
          <p className="text-[11px] text-white/50">138 bpm avg · 482 kcal</p>
        </div>
      </div>

      {/* Routine Selector & AI Generator */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              AI Workout Architect
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mt-0.5">
            Current Split: {routineType}
          </h3>
          <p className="text-xs text-white/60">
            Auto-progress sets and weights calibrated for hypertrophy & recovery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => generateAiRoutine("Pull Day (Back/Biceps)")}
            className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            Pull Day
          </button>
          <button
            onClick={() => generateAiRoutine("Legs & Core Strength")}
            className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            Legs & Core
          </button>
          <button
            onClick={() => generateAiRoutine("HIIT & Conditioning")}
            className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            HIIT Burn
          </button>
        </div>
      </div>

      {/* Main Exercises Table & Logger */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h4 className="text-base font-semibold text-white">Active Workout Session</h4>
            <p className="text-xs text-white/50">Check off sets as you complete them to track progressive overload.</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {completedCount === exercises.length && exercises.length > 0 ? "🎉 Workout Complete!" : "In Progress"}
          </span>
        </div>

        <div className="space-y-2.5">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                ex.done
                  ? "bg-emerald-500/10 border-emerald-500/30 text-white/70"
                  : "bg-white/[0.02] border-white/10 text-white hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleDone(ex.id)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    ex.done ? "bg-emerald-500 text-black" : "border border-white/30 hover:border-white text-transparent"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${ex.done ? "line-through text-white/40" : "text-white"}`}>
                    {ex.name}
                  </p>
                  <p className="text-xs text-white/50">
                    {ex.sets} sets × {ex.reps} reps @ {ex.weight} lbs · RPE {ex.rpe}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/60 hidden sm:inline">
                  {(ex.sets * ex.reps * ex.weight).toLocaleString()} lbs vol
                </span>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Exercise Form */}
        <form onSubmit={addExercise} className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-6 gap-2">
          <input
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="Exercise name..."
            className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
          />
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="Sets"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          />
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Reps"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          />
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* 1RM Calculator & Biometrics Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Award className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-white">1RM Max Estimation (Epley Formula)</h4>
          </div>
          <p className="text-xs text-white/50 mb-3">Calculate estimated single-rep max based on working load.</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-white/50 block mb-1">Lifted Weight (lbs)</label>
              <input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/50 block mb-1">Reps Performed</label>
              <input
                type="number"
                value={calcReps}
                onChange={(e) => setCalcReps(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 flex items-center justify-between">
            <span className="text-xs text-amber-300 font-medium">Estimated 1 Rep Max</span>
            <span className="text-xl font-bold text-amber-400 font-mono">{estimated1RM} lbs</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2 text-sky-400">
            <HeartPulse className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-white">Live Wearable Sync</h4>
          </div>
          <p className="text-xs text-white/50 mb-3">Biometric heart rate and calorie telemetry bridge.</p>

          <div className="space-y-2">
            {[
              { name: "Apple HealthKit", status: "Connected", bpm: "142 bpm", cal: "410 kcal" },
              { name: "Garmin Connect", status: "Ready", bpm: "—", cal: "—" },
              { name: "Google Fit / Health Connect", status: "Synced", bpm: "135 bpm", cal: "380 kcal" },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <span className="text-white/80 font-medium">{d.name}</span>
                <span className="text-emerald-400 font-mono font-medium">{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
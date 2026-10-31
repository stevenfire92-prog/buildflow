import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Flame } from 'lucide-react';
import { toast } from 'sonner';

const MODES = {
  focus: { label: 'Focus', minutes: 25, icon: Brain, color: '#f97316' },
  shortBreak: { label: 'Short Break', minutes: 5, icon: Coffee, color: '#10b981' },
  longBreak: { label: 'Long Break', minutes: 15, icon: Zap, color: '#8b5cf6' },
};

const STATS_KEY = 'sffocus:stats';

function loadStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    return {
      today: raw.today === today ? raw.today : today,
      completed: raw.today === today ? (raw.completed || 0) : 0,
      total: raw.total || 0,
      cycle: raw.cycle || 0, // pomodoros in current cycle (0-3)
    };
  } catch {
    const today = new Date().toISOString().split('T')[0];
    return { today, completed: 0, total: 0, cycle: 0 };
  }
}

function saveStats(s) {
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
    // vibrate on mobile if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch {
    // audio not available — silent
  }
}

export default function FocusTimer() {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const intervalRef = useRef(null);

  const modeCfg = MODES[mode];
  const totalSeconds = modeCfg.minutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  const handleComplete = useCallback(() => {
    beep();
    if (mode === 'focus') {
      const newStats = {
        ...stats,
        completed: stats.completed + 1,
        total: stats.total + 1,
        cycle: stats.cycle + 1,
      };
      saveStats(newStats);
      setStats(newStats);
      const nextMode = newStats.cycle >= 4 ? 'longBreak' : 'shortBreak';
      if (newStats.cycle >= 4) {
        newStats.cycle = 0;
        saveStats(newStats);
        setStats(newStats);
        toast.success('🎉 4 pomodoros done! Take a long break — you earned it.');
      } else {
        toast.success(`✅ Pomodoro #${newStats.completed} complete! Take a short break.`);
      }
      setMode(nextMode);
      setSecondsLeft(MODES[nextMode].minutes * 60);
    } else {
      toast.success('Break over — back to focus! 💪');
      setMode('focus');
      setSecondsLeft(MODES.focus.minutes * 60);
    }
    setRunning(false);
  }, [mode, stats]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setSecondsLeft(MODES[m].minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG ring
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-2 mb-8 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
        {Object.entries(MODES).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              mode === key
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <cfg.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{cfg.label}</span>
            <span className="sm:hidden">{cfg.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative w-72 h-72 mx-auto mb-8">
        <svg viewBox="0 0 300 300" className="w-full h-full -rotate-90">
          <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          <motion.circle
            cx="150"
            cy="150"
            r={R}
            fill="none"
            stroke={modeCfg.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - progress) }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 12px ${modeCfg.color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <motion.p
              key={display}
              className="text-6xl font-black tabular-nums tracking-tight"
            >
              {display}
            </motion.p>
            <p className="text-sm text-slate-400 mt-2 font-semibold">{modeCfg.label}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={reset}
          className="grid place-items-center w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 transition"
          aria-label="Reset"
        >
          <RotateCcw className="w-5 h-5 text-slate-300" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="grid place-items-center w-20 h-20 rounded-3xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition shadow-lg shadow-orange-500/25"
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <div className="w-14" /> {/* spacer for symmetry */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Flame className="w-5 h-5 mx-auto text-orange-400 mb-1" />
          <p className="text-2xl font-black">{stats.completed}</p>
          <p className="text-xs text-slate-500">Today</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Brain className="w-5 h-5 mx-auto text-orange-400 mb-1" />
          <p className="text-2xl font-black">{stats.total}</p>
          <p className="text-xs text-slate-500">All time</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <Coffee className="w-5 h-5 mx-auto text-orange-400 mb-1" />
          <p className="text-2xl font-black">{stats.cycle}/4</p>
          <p className="text-xs text-slate-500">Cycle</p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        25 min focus → 5 min break. After 4 focus sessions, take a 15 min break.
      </p>
    </div>
  );
}

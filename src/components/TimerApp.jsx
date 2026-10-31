import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Plus, Trash2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sftimer:presets';

export function loadPresets() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function savePresets(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function fmtMs(ms) {
  const total = Math.max(0, Math.floor(ms / 100));
  const m = Math.floor(total / 600);
  const s = Math.floor((total % 600) / 10);
  const cs = total % 10;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${cs}`;
}

let audioCtx = null;
export function beep(freq = 880, dur = 0.25) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.setValueAtTime(0.4, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
    if (navigator.vibrate) navigator.vibrate(200);
  } catch { /* ignore */ }
}

export function alarm() {
  beep(880, 0.3);
  setTimeout(() => beep(660, 0.3), 350);
  setTimeout(() => beep(880, 0.5), 700);
}

const COUNTDOWN_PRESETS = [5, 10, 15, 30, 60];

export default function TimerApp() {
  const [tab, setTab] = useState('stopwatch');

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState([]);
  const swRef = useRef(null);
  const swStartRef = useRef(0);

  // Countdown
  const [cdTotal, setCdTotal] = useState(5 * 60 * 1000);
  const [cdLeft, setCdLeft] = useState(5 * 60 * 1000);
  const [cdRunning, setCdRunning] = useState(false);
  const cdRef = useRef(null);
  const cdEndRef = useRef(0);

  // Interval
  const [workMin, setWorkMin] = useState(25);
  const [restMin, setRestMin] = useState(5);
  const [rounds, setRounds] = useState(4);
  const [ivState, setIvState] = useState(null); // {phase:'work'|'rest', round, left}
  const ivRef = useRef(null);
  const ivEndRef = useRef(0);

  // Custom presets
  const [presets, setPresets] = useState(loadPresets);
  const [presetMin, setPresetMin] = useState('');

  useEffect(() => () => {
    [swRef, cdRef, ivRef].forEach((r) => r.current && clearInterval(r.current));
  }, []);

  // ---- Stopwatch ----
  const swStart = () => {
    swStartRef.current = Date.now() - swElapsed;
    setSwRunning(true);
    swRef.current = setInterval(() => setSwElapsed(Date.now() - swStartRef.current), 50);
  };
  const swStop = () => { clearInterval(swRef.current); setSwRunning(false); };
  const swReset = () => { swStop(); setSwElapsed(0); setLaps([]); };
  const swLap = () => {
    const prev = laps.length ? laps[laps.length - 1].total : 0;
    setLaps([...laps, { total: swElapsed, split: swElapsed - prev }]);
    toast.success('Lap recorded');
  };

  // ---- Countdown ----
  const cdStart = () => {
    if (cdLeft <= 0) setCdLeft(cdTotal);
    cdEndRef.current = Date.now() + (cdLeft <= 0 ? cdTotal : cdLeft);
    setCdRunning(true);
    cdRef.current = setInterval(() => {
      const left = cdEndRef.current - Date.now();
      if (left <= 0) {
        clearInterval(cdRef.current);
        setCdLeft(0); setCdRunning(false);
        alarm();
        toast.success("Time's up!");
      } else setCdLeft(left);
    }, 100);
  };
  const cdStop = () => { clearInterval(cdRef.current); setCdRunning(false); };
  const cdReset = () => { cdStop(); setCdLeft(cdTotal); };
  const cdSet = (min) => {
    const ms = min * 60 * 1000;
    cdStop(); setCdTotal(ms); setCdLeft(ms);
  };

  const addPreset = () => {
    const v = parseFloat(presetMin);
    if (isNaN(v) || v <= 0) { toast.error('Enter valid minutes'); return; }
    const next = [...presets, v];
    setPresets(next); savePresets(next);
    setPresetMin('');
    toast.success('Preset saved');
  };
  const delPreset = (i) => {
    const next = presets.filter((_, x) => x !== i);
    setPresets(next); savePresets(next);
  };

  // ---- Interval ----
  const ivTick = (cur) => {
    ivEndRef.current = Date.now() + cur.left;
    ivRef.current = setInterval(() => {
      const left = ivEndRef.current - Date.now();
      if (left <= 0) {
        beep(cur.phase === 'work' ? 660 : 990, 0.4);
        let next = null;
        if (cur.phase === 'work') {
          next = { phase: 'rest', round: cur.round, left: restMin * 60 * 1000 };
          toast.info(`Round ${cur.round} work done — rest!`);
        } else if (cur.round < rounds) {
          next = { phase: 'work', round: cur.round + 1, left: workMin * 60 * 1000 };
          toast.info(`Rest over — round ${cur.round + 1} work!`);
        }
        if (next) {
          setIvState(next);
          ivEndRef.current = Date.now() + next.left;
          clearInterval(ivRef.current);
          ivTick(next);
        } else {
          clearInterval(ivRef.current);
          setIvState(null);
          alarm();
          toast.success('All rounds complete! 🎉');
        }
      } else {
        setIvState({ ...cur, left });
      }
    }, 100);
  };
  const ivStart = () => {
    const st = ivState || { phase: 'work', round: 1, left: workMin * 60 * 1000 };
    setIvState(st);
    ivTick(st);
  };
  const ivStop = () => { clearInterval(ivRef.current); };
  const ivReset = () => { ivStop(); setIvState(null); };

  const tabs = [
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'countdown', label: 'Countdown' },
    { id: 'interval', label: 'Interval' },
  ];

  const cdPct = cdTotal > 0 ? Math.min(100, (cdLeft / cdTotal) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex rounded-2xl border border-white/10 bg-white/[0.02] p-1 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${tab === t.id ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stopwatch' && (
        <div className="text-center">
          <p className="text-6xl md:text-7xl font-black tabular-nums tracking-tight mb-8">{fmtMs(swElapsed)}</p>
          <div className="flex justify-center gap-3 mb-8">
            {!swRunning ? (
              <button onClick={swStart} className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"><Play className="w-6 h-6" /></button>
            ) : (
              <button onClick={swStop} className="p-4 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition"><Pause className="w-6 h-6" /></button>
            )}
            <button onClick={swLap} disabled={!swRunning} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-40"><Flag className="w-6 h-6" /></button>
            <button onClick={swReset} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"><RotateCcw className="w-6 h-6" /></button>
          </div>
          {laps.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left max-h-64 overflow-y-auto">
              {laps.map((l, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                  <span className="text-slate-400 font-semibold">Lap {laps.length - i}</span>
                  <span className="tabular-nums">{fmtMs(l.split)}</span>
                  <span className="text-slate-500 tabular-nums">{fmtMs(l.total)}</span>
                </div>
              )).reverse()}
            </div>
          )}
        </div>
      )}

      {tab === 'countdown' && (
        <div className="text-center">
          <div className="relative w-56 h-56 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#cdg)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`} strokeDashoffset={`${2 * Math.PI * 44 * (1 - cdPct / 100)}`} className="transition-all duration-200" />
              <defs><linearGradient id="cdg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ef4444" />
              </linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-4xl font-black tabular-nums">{fmt(cdLeft)}</p>
            </div>
          </div>
          <div className="flex justify-center gap-3 mb-6">
            {!cdRunning ? (
              <button onClick={cdStart} className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition"><Play className="w-6 h-6" /></button>
            ) : (
              <button onClick={cdStop} className="p-4 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition"><Pause className="w-6 h-6" /></button>
            )}
            <button onClick={cdReset} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"><RotateCcw className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {COUNTDOWN_PRESETS.map((m) => (
              <button key={m} onClick={() => cdSet(m)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${cdTotal === m * 60 * 1000 ? 'border-orange-500 bg-orange-500/15 text-orange-200' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200'}`}>
                {m} min
              </button>
            ))}
            {presets.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 pl-4 pr-1 py-2 rounded-xl text-sm font-bold border border-purple-500/40 bg-purple-500/10 text-purple-200">
                {m} min
                <button onClick={() => delPreset(i)} className="p-1 hover:bg-purple-500/20 rounded"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <button onClick={() => { const m = parseFloat(presetMin); if (!isNaN(m) && m > 0) cdSet(m); }} className="sr-only">set</button>
          <div className="flex justify-center gap-2 max-w-xs mx-auto">
            <input type="number" min="0.5" step="0.5" value={presetMin} onChange={(e) => setPresetMin(e.target.value)} placeholder="Custom min" className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500" />
            <button onClick={() => { const m = parseFloat(presetMin); if (!isNaN(m) && m > 0) { cdSet(m); } }} className="px-3 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10">Set</button>
            <button onClick={addPreset} title="Save preset" className="px-3 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {tab === 'interval' && (
        <div className="text-center">
          {!ivState ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
                <div>
                  <label className="text-[11px] uppercase text-slate-500 font-bold">Work (min)</label>
                  <input type="number" min="1" value={workMin} onChange={(e) => setWorkMin(Math.max(1, parseInt(e.target.value) || 1))} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-center font-black outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-slate-500 font-bold">Rest (min)</label>
                  <input type="number" min="1" value={restMin} onChange={(e) => setRestMin(Math.max(1, parseInt(e.target.value) || 1))} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-center font-black outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-slate-500 font-bold">Rounds</label>
                  <input type="number" min="1" value={rounds} onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-center font-black outline-none focus:border-orange-500" />
                </div>
              </div>
              <button onClick={ivStart} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
                <Play className="w-5 h-5" /> Start Intervals
              </button>
            </>
          ) : (
            <>
              <p className={`text-sm font-black uppercase tracking-widest mb-2 ${ivState.phase === 'work' ? 'text-orange-400' : 'text-emerald-400'}`}>
                {ivState.phase === 'work' ? '🔥 Work' : '😌 Rest'} — Round {ivState.round}/{rounds}
              </p>
              <p className="text-6xl font-black tabular-nums mb-6">{fmt(ivState.left)}</p>
              <div className="flex justify-center gap-3">
                <button onClick={ivStop} className="p-4 rounded-full bg-white/10 border border-white/15"><Pause className="w-6 h-6" /></button>
                <button onClick={() => { ivStop(); ivStart(); }} className="p-4 rounded-full bg-white/5 border border-white/10"><Play className="w-6 h-6" /></button>
                <button onClick={ivReset} className="p-4 rounded-full bg-white/5 border border-white/10"><RotateCcw className="w-6 h-6" /></button>
              </div>
            </>
          )}
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-6">
            <Volume2 className="w-3.5 h-3.5" /> Sound alert on phase change & completion
          </p>
        </div>
      )}
    </div>
  );
}

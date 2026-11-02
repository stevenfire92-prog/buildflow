import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, History, Flower2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PREFIX = 'sfmed:';
const PRESETS = [
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
  { label: '15 min', secs: 900 },
  { label: '20 min', secs: 1200 },
  { label: '30 min', secs: 1800 },
];

function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

// Ambient tone generator using Web Audio API
function useAmbientTone(enabled, toneType) {
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!enabled) {
      nodesRef.current.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
      nodesRef.current = [];
      if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.value = 0.08;
      master.connect(ctx.destination);

      const freqs = toneType === 'bowl' ? [174, 261, 348] : toneType === 'rain'
        ? null
        : [110, 165, 220]; // 'drone' default

      if (freqs) {
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = f;
          const g = ctx.createGain();
          g.gain.value = 0.5 / freqs.length;
          // Gentle LFO swell
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.1 + i * 0.05;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.15;
          lfo.connect(lfoGain);
          lfoGain.connect(g.gain);
          osc.connect(g);
          g.connect(master);
          osc.start(); lfo.start();
          nodesRef.current.push(osc, lfo);
        });
      } else {
        // Rain: filtered noise
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        const g = ctx.createGain();
        g.gain.value = 0.4;
        noise.connect(filter); filter.connect(g); g.connect(master);
        noise.start();
        nodesRef.current.push(noise);
      }
    } catch (e) {
      console.warn('Audio not available', e);
    }

    return () => {
      nodesRef.current.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
      nodesRef.current = [];
      if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
    };
  }, [enabled, toneType]);
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MeditateApp() {
  const [duration, setDuration] = useState(600);
  const [remaining, setRemaining] = useState(600);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [tone, setTone] = useState('drone');
  const [history, setHistory] = useState(() => load('history', []));
  const [customMin, setCustomMin] = useState('');
  const intervalRef = useRef(null);

  useAmbientTone(running && soundOn, tone);

  useEffect(() => { save('history', history); }, [history]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const entry = { date: new Date().toISOString(), minutes: Math.round(duration / 60), tone };
            setHistory(h => [entry, ...h].slice(0, 50));
            toast.success('Session complete. Well done. 🙏');
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              [523, 659, 784].forEach((f, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.frequency.value = f;
                o.connect(g); g.connect(ctx.destination);
                const t = ctx.currentTime + i * 0.35;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.2, t + 0.05);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
                o.start(t); o.stop(t + 0.6);
              });
            } catch {}
            return duration;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, duration, tone]);

  const selectPreset = (secs) => {
    setDuration(secs);
    setRemaining(secs);
    setRunning(false);
  };

  const setCustom = () => {
    const m = parseInt(customMin, 10);
    if (m > 0 && m <= 180) {
      selectPreset(m * 60);
      setCustomMin('');
    } else {
      toast.error('Enter 1–180 minutes');
    }
  };

  const reset = () => { setRunning(false); setRemaining(duration); };

  const totalMinutes = history.reduce((a, h) => a + (h.minutes || 0), 0);
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Timer */}
      <div className="text-center mb-8">
        <div className="relative w-56 h-56 mx-auto mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className="transition-all duration-1000" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flower2 className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-5xl font-black tabular-nums">{fmt(remaining)}</span>
            <span className="text-xs text-slate-500 mt-1">{running ? 'breathing...' : 'ready'}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {!running ? (
            <button onClick={() => setRunning(true)} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 font-bold text-lg hover:brightness-110">
              <Play className="w-5 h-5" /> Begin
            </button>
          ) : (
            <button onClick={() => setRunning(false)} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 border border-white/15 font-bold text-lg hover:bg-white/15">
              <Pause className="w-5 h-5" /> Pause
            </button>
          )}
          <button onClick={reset} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10" title="Reset">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => setSoundOn(!soundOn)} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10" title="Toggle sound">
            {soundOn ? <Volume2 className="w-5 h-5 text-orange-300" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => selectPreset(p.secs)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                duration === p.secs
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/25'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 max-w-xs mx-auto">
          <input value={customMin} onChange={e => setCustomMin(e.target.value)} onKeyDown={e => e.key === 'Enter' && setCustom()}
            type="number" min="1" max="180" placeholder="Custom minutes"
            className="flex-1 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/50" />
          <button onClick={setCustom} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10">Set</button>
        </div>

        {/* Ambient tones */}
        <div className="mt-6">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Ambient sound</p>
          <div className="flex justify-center gap-2">
            {[{ id: 'drone', label: '🧘 Drone' }, { id: 'bowl', label: '🔔 Bowl' }, { id: 'rain', label: '🌧️ Rain' }].map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  tone === t.id ? 'bg-orange-500/20 border-orange-500/40' : 'bg-white/[0.03] border-white/10 text-slate-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><History className="w-4 h-4 text-orange-400" /> Session History</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{history.length} sessions · {totalMinutes} min total</span>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); toast.success('History cleared'); }} className="text-slate-600 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No sessions yet. Your completed meditations will appear here.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/30 border border-white/5 text-sm">
                <span className="text-slate-300">{new Date(h.date).toLocaleDateString()} · {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-orange-300 font-bold">{h.minutes} min · {h.tone}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

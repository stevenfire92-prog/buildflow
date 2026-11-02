import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfdice:history';
const TYPES = [4, 6, 8, 10, 12, 20];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

const rollOne = (sides) => 1 + Math.floor(Math.random() * sides);

export default function DiceApp() {
  const [sides, setSides] = useState(20);
  const [count, setCount] = useState(1);
  const [values, setValues] = useState([20]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState(load);
  const timer = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => () => clearInterval(timer.current), []);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    timer.current = setInterval(() => {
      setValues(Array.from({ length: count }, () => rollOne(sides)));
      ticks += 1;
      if (ticks >= 10) {
        clearInterval(timer.current);
        const final = Array.from({ length: count }, () => rollOne(sides));
        setValues(final);
        setRolling(false);
        const total = final.reduce((a, b) => a + b, 0);
        setHistory((h) => [{ id: Date.now().toString(), sides, count, values: final, total, at: new Date().toLocaleTimeString() }, ...h].slice(0, 50));
      }
    }, 70);
  };

  const clear = () => {
    setHistory([]);
    toast.info('History cleared.');
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">Die type</p>
        <div className="grid grid-cols-6 gap-2 mb-6">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setSides(t); setValues([t]); }}
              className={`py-2.5 rounded-xl font-black text-sm border transition ${
                sides === t
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 border-transparent'
                  : 'border-white/10 bg-black/40 text-slate-400 hover:border-orange-500/40'
              }`}
            >
              d{t}
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">Number of dice</p>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="range"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
          <span className="text-2xl font-black w-10 text-center tabular-nums">{count}</span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6 min-h-[76px]">
          <AnimatePresence mode="popLayout">
            {values.map((v, i) => (
              <motion.div
                key={`${i}-${v}-${rolling}`}
                initial={{ rotate: -12, scale: 0.85 }}
                animate={{ rotate: rolling ? [0, 8, -8, 0] : 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border ${
                  rolling
                    ? 'bg-orange-500/20 border-orange-500/40'
                    : 'bg-gradient-to-br from-orange-500/15 to-red-600/15 border-white/10'
                } tabular-nums`}
              >
                {v}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mb-6">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
          <div className="text-5xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent tabular-nums">
            {total}
          </div>
        </div>

        <button
          onClick={roll}
          disabled={rolling}
          className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <Dices className="w-6 h-6" /> {rolling ? 'Rolling...' : `Roll ${count}d${sides}`}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-orange-400" /> Roll history
          </h3>
          {history.length > 0 && (
            <button onClick={clear} className="text-xs text-slate-500 hover:text-red-400 inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No rolls yet — give the dice a throw.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400">
                  {h.count}d{h.sides} <span className="text-slate-600">· {h.values.join(', ')}</span>
                </span>
                <span className="font-black tabular-nums">{h.total}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

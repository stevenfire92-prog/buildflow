import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, RefreshCw, Trash2, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const HISTORY_KEY = 'sfpw:history';
const MAX_HISTORY = 20;

const SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~',
};

const AMBIGUOUS = '0O1lI';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function pushHistory(pw) {
  const h = [pw, ...getHistory().filter((p) => p !== pw)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

function generatePassword({ length, uppercase, lowercase, numbers, symbols, excludeAmbiguous }) {
  let chars = '';
  if (uppercase) chars += SETS.uppercase;
  if (lowercase) chars += SETS.lowercase;
  if (numbers) chars += SETS.numbers;
  if (symbols) chars += SETS.symbols;
  if (!chars) return '';

  if (excludeAmbiguous) {
    chars = chars.split('').filter((c) => !AMBIGUOUS.includes(c)).join('');
  }

  // Guarantee at least one char from each enabled set
  const guaranteed = [];
  const pools = [];
  if (uppercase) pools.push(SETS.uppercase);
  if (lowercase) pools.push(SETS.lowercase);
  if (numbers) pools.push(SETS.numbers);
  if (symbols) pools.push(SETS.symbols);

  const clean = (pool) =>
    excludeAmbiguous ? pool.split('').filter((c) => !AMBIGUOUS.includes(c)).join('') : pool;

  for (const pool of pools) {
    const p = clean(pool);
    if (p) guaranteed.push(p[Math.floor(Math.random() * p.length)]);
  }

  const rest = [];
  const n = length - guaranteed.length;
  const rand = new Uint32Array(Math.max(n, 0));
  if (n > 0) crypto.getRandomValues(rand);
  for (let i = 0; i < n; i++) {
    rest.push(chars[Math.floor((rand[i] / 4294967296) * chars.length)]);
  }

  // Shuffle
  const all = [...guaranteed, ...rest];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.join('');
}

function strength(pw, opts) {
  if (!pw) return { label: '', level: 0, color: '' };
  let score = 0;
  const len = pw.length;
  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;
  if (len >= 24) score += 1;
  const types = [opts.uppercase, opts.lowercase, opts.numbers, opts.symbols].filter(Boolean).length;
  score += Math.min(types, 4);
  if (score <= 3) return { label: 'Weak', level: 1, color: '#ef4444' };
  if (score <= 5) return { label: 'Fair', level: 2, color: '#f59e0b' };
  if (score <= 6) return { label: 'Strong', level: 3, color: '#10b981' };
  return { label: 'Very strong', level: 4, color: '#22c55e' };
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2.5"
    >
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export default function PasswordGen() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(true);
  const [history, setHistory] = useState([]);

  const opts = { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous };

  const doGenerate = useCallback(() => {
    if (!uppercase && !lowercase && !numbers && !symbols) {
      toast.error('Pick at least one character type');
      return;
    }
    const pw = generatePassword(opts);
    setPassword(pw);
    pushHistory(pw);
    setHistory(getHistory());
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  useEffect(() => {
    setHistory(getHistory());
    doGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard ✓');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('Copied to clipboard ✓');
    }
  };

  const s = strength(password, opts);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Generator card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <KeyRound className="w-5 h-5 text-white" />
          </span>
          <div>
            <h2 className="font-bold text-lg">Password generator</h2>
            <p className="text-xs text-slate-500">Crypto-random, generated on your device</p>
          </div>
        </div>

        {/* Password display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={password}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-4 mb-4"
          >
            <p className="flex-1 font-mono text-base md:text-lg break-all select-all">
              {password ? (show ? password : '•'.repeat(password.length)) : '—'}
            </p>
            <button
              onClick={() => setShow(!show)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
              title={show ? 'Hide' : 'Show'}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => password && copy(password)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Strength meter */}
        {s.label && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Strength
              </span>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all"
                  style={{ background: i <= s.level ? s.color : 'rgba(255,255,255,0.08)' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Length slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Length</span>
            <span className="text-sm font-bold text-orange-300">{length} characters</span>
          </div>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Toggles */}
        <div className="divide-y divide-white/5 mb-5">
          <Toggle label="Uppercase (A–Z)" checked={uppercase} onChange={setUppercase} />
          <Toggle label="Lowercase (a–z)" checked={lowercase} onChange={setLowercase} />
          <Toggle label="Numbers (0–9)" checked={numbers} onChange={setNumbers} />
          <Toggle label="Symbols (!@#$…)" checked={symbols} onChange={setSymbols} />
          <Toggle label="Exclude ambiguous (0/O, 1/l/I)" checked={excludeAmbiguous} onChange={setExcludeAmbiguous} />
        </div>

        <button
          onClick={doGenerate}
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate new password
        </button>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">History</h3>
          {history.length > 0 && (
            <button
              onClick={() => { clearHistory(); setHistory([]); toast.success('History cleared'); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Generated passwords will appear here.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {history.map((pw, i) => (
              <div
                key={`${pw}-${i}`}
                className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2.5"
              >
                <p className="flex-1 font-mono text-sm truncate">{pw}</p>
                <button
                  onClick={() => copy(pw)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition shrink-0"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-600 mt-6">
        Passwords are generated locally on your device and never leave it.
      </p>
    </div>
  );
}

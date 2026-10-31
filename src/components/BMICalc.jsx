import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, HeartPulse, Lightbulb, History } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'sfhealth:history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem(KEY, JSON.stringify(h)); }

const CATS = [
  { name: 'Underweight', min: 0, max: 18.5, color: '#3b82f6', tip: 'Consider talking to a dietitian about healthy ways to gain weight. Focus on nutrient-dense foods and strength training.' },
  { name: 'Normal', min: 18.5, max: 25, color: '#10b981', tip: 'Great work! Keep it up with balanced meals, regular movement, and good sleep.' },
  { name: 'Overweight', min: 25, max: 30, color: '#f59e0b', tip: 'Small consistent changes add up — try daily walks, portion awareness, and cutting sugary drinks.' },
  { name: 'Obese', min: 30, max: 60, color: '#ef4444', tip: 'Consider speaking with a healthcare professional about a plan that fits your life. Every step forward counts.' },
];

function bmiCategory(bmi) {
  return CATS.find((c) => bmi >= c.min && bmi < c.max) || CATS[0];
}

export default function BMICalc() {
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [cm, setCm] = useState('');
  const [ft, setFt] = useState('');
  const [inch, setInch] = useState('');
  const [kg, setKg] = useState('');
  const [lbs, setLbs] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(getHistory()); }, []);

  const calc = () => {
    let hM, wKg;
    if (heightUnit === 'cm') {
      const v = parseFloat(cm);
      if (!v || v <= 0) return toast.error('Enter a valid height');
      hM = v / 100;
    } else {
      const f = parseFloat(ft) || 0, i = parseFloat(inch) || 0;
      const totalIn = f * 12 + i;
      if (!totalIn || totalIn <= 0) return toast.error('Enter a valid height');
      hM = totalIn * 0.0254;
    }
    if (weightUnit === 'kg') {
      const v = parseFloat(kg);
      if (!v || v <= 0) return toast.error('Enter a valid weight');
      wKg = v;
    } else {
      const v = parseFloat(lbs);
      if (!v || v <= 0) return toast.error('Enter a valid weight');
      wKg = v * 0.453592;
    }
    const bmi = wKg / (hM * hM);
    const low = 18.5 * hM * hM;
    const high = 24.9 * hM * hM;
    const cat = bmiCategory(bmi);
    const r = { bmi: Math.round(bmi * 10) / 10, cat: cat.name, color: cat.color, low: Math.round(low * 10) / 10, high: Math.round(high * 10) / 10, date: new Date().toISOString() };
    setResult(r);
    const h = [{ ...r, id: Date.now().toString() }, ...getHistory()].slice(0, 20);
    saveHistory(h);
    setHistory(h);
    toast.success(`BMI: ${r.bmi} — ${r.cat}`);
  };

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
    toast.success('History cleared');
  };

  // Gauge position: 0-60 mapped to 0-100%
  const pos = result ? Math.min(100, Math.max(0, (result.bmi / 60) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold">
          <HeartPulse className="w-3.5 h-3.5" /> BMI & HEALTH
        </span>
        <h1 className="text-3xl md:text-4xl font-black mt-3">Know your numbers</h1>
        <p className="text-slate-400 text-sm mt-1">Calculate your BMI and track your health journey.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Height</label>
              <div className="flex gap-1 text-xs">
                {['cm', 'ft'].map((u) => (
                  <button key={u} onClick={() => setHeightUnit(u)} className={`px-3 py-1 rounded-lg font-bold transition ${heightUnit === u ? 'bg-orange-500/20 text-orange-300' : 'text-slate-500 hover:text-slate-300'}`}>{u === 'cm' ? 'cm' : 'ft/in'}</button>
                ))}
              </div>
            </div>
            {heightUnit === 'cm' ? (
              <input value={cm} onChange={(e) => setCm(e.target.value)} inputMode="decimal" placeholder="e.g. 175" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50" />
            ) : (
              <div className="flex gap-2">
                <input value={ft} onChange={(e) => setFt(e.target.value)} inputMode="numeric" placeholder="ft" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50" />
                <input value={inch} onChange={(e) => setInch(e.target.value)} inputMode="decimal" placeholder="in" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">Weight</label>
              <div className="flex gap-1 text-xs">
                {['kg', 'lbs'].map((u) => (
                  <button key={u} onClick={() => setWeightUnit(u)} className={`px-3 py-1 rounded-lg font-bold transition ${weightUnit === u ? 'bg-orange-500/20 text-orange-300' : 'text-slate-500 hover:text-slate-300'}`}>{u}</button>
                ))}
              </div>
            </div>
            <input value={weightUnit === 'kg' ? kg : lbs} onChange={(e) => weightUnit === 'kg' ? setKg(e.target.value) : setLbs(e.target.value)} inputMode="decimal" placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-orange-400/50" />
          </div>
        </div>
        <button onClick={calc} className="w-full mt-5 py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 transition">
          Calculate BMI
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
          <div className="text-center mb-5">
            <p className="text-sm text-slate-400">Your BMI</p>
            <p className="text-5xl font-black mt-1" style={{ color: result.color }}>{result.bmi}</p>
            <p className="font-bold mt-1" style={{ color: result.color }}>{result.cat}</p>
          </div>
          {/* Gauge */}
          <div className="relative h-4 rounded-full overflow-hidden mb-2" style={{ background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 30.8%, #10b981 30.8%, #10b981 41.6%, #f59e0b 41.6%, #f59e0b 50%, #ef4444 50%, #ef4444 100%)' }}>
            <div className="absolute top-0 bottom-0 w-1.5 bg-white rounded-full shadow" style={{ left: `calc(${pos}% - 3px)` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-5 px-0.5">
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 mb-4">
            <p className="text-sm text-slate-300">Healthy weight range for your height:</p>
            <p className="font-bold text-emerald-300">{result.low} – {result.high} kg</p>
          </div>
          <div className="rounded-xl bg-orange-500/[0.07] border border-orange-500/20 p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-orange-300 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">{CATS.find((c) => c.name === result.cat)?.tip}</p>
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2"><History className="w-4 h-4 text-orange-400" /> History</h2>
            <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5 text-sm">
                <span className="text-slate-400">{new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="font-bold" style={{ color: h.color }}>{h.bmi} <span className="text-xs font-normal text-slate-500">{h.cat}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-600 px-4">
        ⚕️ For informational purposes only — not medical advice. Consult a healthcare professional for health decisions.
      </p>
    </div>
  );
}

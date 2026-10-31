import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Percent, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

const PRESETS = [10, 15, 18, 20, 25];

export default function TipCalc() {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(1);
  const [roundMode, setRoundMode] = useState('none'); // none | up | down

  const billNum = parseFloat(bill) || 0;
  const peopleNum = Math.max(1, parseInt(people) || 1);

  const { tip, total, perPerson, tipPerPerson } = useMemo(() => {
    const rawTip = billNum * (tipPct / 100);
    const rawTotal = billNum + rawTip;
    let finalTotal = rawTotal;
    if (roundMode === 'up') finalTotal = Math.ceil(rawTotal);
    if (roundMode === 'down') finalTotal = Math.floor(rawTotal);
    const finalTip = finalTotal - billNum;
    return {
      tip: Math.max(0, finalTip),
      total: finalTotal,
      perPerson: finalTotal / peopleNum,
      tipPerPerson: Math.max(0, finalTip) / peopleNum,
    };
  }, [billNum, tipPct, peopleNum, roundMode]);

  const reset = () => {
    setBill('');
    setTipPct(18);
    setPeople(1);
    setRoundMode('none');
  };

  const fmt = (n) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
      >
        {/* Bill input */}
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Bill amount
        </label>
        <div className="relative mb-6">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-3xl font-black outline-none focus:border-orange-400/50"
          />
        </div>

        {/* Tip percent */}
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Tip percentage
          </label>
          <span className="text-2xl font-black text-orange-300">{tipPct}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="40"
          value={tipPct}
          onChange={(e) => setTipPct(parseInt(e.target.value))}
          className="w-full accent-orange-500 mb-3"
        />
        <div className="flex gap-2 mb-6 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setTipPct(p)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                tipPct === p
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:border-orange-400/40'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* People */}
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Split between
        </label>
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-slate-500" />
          <button
            onClick={() => setPeople(Math.max(1, peopleNum - 1))}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-xl font-black hover:border-orange-400/40 transition"
          >
            −
          </button>
          <span className="text-2xl font-black w-12 text-center">{peopleNum}</span>
          <button
            onClick={() => setPeople(peopleNum + 1)}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-xl font-black hover:border-orange-400/40 transition"
          >
            +
          </button>
          <span className="text-sm text-slate-500 ml-1">
            {peopleNum === 1 ? 'person' : 'people'}
          </span>
        </div>

        {/* Round options */}
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Round total
        </label>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { id: 'none', label: 'Exact', icon: Percent },
            { id: 'up', label: 'Round up', icon: ArrowUp },
            { id: 'down', label: 'Round down', icon: ArrowDown },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setRoundMode(o.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition ${
                roundMode === o.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:border-orange-400/40'
              }`}
            >
              <o.icon className="w-4 h-4" />
              {o.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <motion.div
          key={`${tip}-${total}-${peopleNum}`}
          initial={{ scale: 0.98, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-br from-orange-500/15 to-red-500/10 border border-orange-500/20 p-6 mb-6"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tip</p>
              <p className="text-2xl font-black text-orange-300">{fmt(tip)}</p>
              {peopleNum > 1 && (
                <p className="text-xs text-slate-500 mt-1">{fmt(tipPerPerson)} each</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black">{fmt(total)}</p>
              {roundMode !== 'none' && (
                <p className="text-xs text-slate-500 mt-1">
                  {roundMode === 'up' ? 'rounded up' : 'rounded down'}
                </p>
              )}
            </div>
          </div>
          {peopleNum > 1 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                Per person
              </p>
              <p className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {fmt(perPerson)}
              </p>
            </div>
          )}
        </motion.div>

        <button
          onClick={reset}
          className="w-full py-3 rounded-xl font-bold border border-white/10 text-slate-400 hover:border-orange-400/40 hover:text-white transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </motion.div>
    </div>
  );
}

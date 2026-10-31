import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, Ruler, Scale, Thermometer, Beaker,
  Gauge, Clock, HardDrive, Zap,
} from 'lucide-react';
import {
  CATEGORIES, CATEGORY_IDS, getUnitNames, convert, formatResult, QUICK_PICKS,
} from '../lib/convert';

const CATEGORY_ICONS = {
  length: Ruler,
  weight: Scale,
  temperature: Thermometer,
  volume: Beaker,
  speed: Gauge,
  time: Clock,
  data: HardDrive,
};

export default function Converter() {
  const [category, setCategory] = useState('length');
  const [inputValue, setInputValue] = useState('1');

  const units = useMemo(() => getUnitNames(category), [category]);
  const [fromUnit, setFromUnit] = useState('Mile');
  const [toUnit, setToUnit] = useState('Kilometer');

  const handleCategory = (id) => {
    setCategory(id);
    const names = getUnitNames(id);
    setFromUnit(names[0]);
    setToUnit(names.length > 1 ? names[1] : names[0]);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleQuickPick = (pick) => {
    handleCategory(category);
    setFromUnit(pick.from);
    setToUnit(pick.to);
    setInputValue(String(pick.value));
  };

  const result = useMemo(
    () => convert(category, inputValue, fromUnit, toUnit),
    [category, inputValue, fromUnit, toUnit]
  );

  const selectCls =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-orange-400/50 text-white appearance-none cursor-pointer';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORY_IDS.map((id) => {
          const Icon = CATEGORY_ICONS[id];
          const active = category === id;
          return (
            <button
              key={id}
              onClick={() => handleCategory(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:border-orange-400/40 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {CATEGORIES[id].label}
            </button>
          );
        })}
      </div>

      {/* Converter card */}
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Value
        </label>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          inputMode="decimal"
          placeholder="Enter value"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold outline-none focus:border-orange-400/50 mb-5"
        />

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              From
            </label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className={selectCls}>
              {units.map((u) => (
                <option key={u} value={u} className="bg-[#14141c]">{u}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSwap}
            aria-label="Swap units"
            className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 hover:brightness-110 transition mb-0.5"
          >
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </button>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              To
            </label>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className={selectCls}>
              {units.map((u) => (
                <option key={u} value={u} className="bg-[#14141c]">{u}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${inputValue}-${fromUnit}-${toUnit}-${category}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl bg-gradient-to-br from-orange-500/15 to-red-500/10 border border-orange-400/20 px-5 py-6 text-center"
          >
            <p className="text-sm text-slate-400 mb-1">
              {inputValue || '0'} {fromUnit} =
            </p>
            <p className="text-4xl font-black bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent break-all">
              {formatResult(result)}
            </p>
            <p className="text-sm text-slate-400 mt-1">{toUnit}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Quick picks */}
      <div className="mt-8">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-3">
          <Zap className="w-4 h-4 text-orange-400" /> Common conversions
        </p>
        <div className="flex flex-wrap gap-2">
          {(QUICK_PICKS[category] || []).map((pick, i) => (
            <button
              key={i}
              onClick={() => handleQuickPick(pick)}
              className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 hover:border-orange-400/40 hover:text-orange-200 transition"
            >
              {pick.value} {pick.from} → {pick.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

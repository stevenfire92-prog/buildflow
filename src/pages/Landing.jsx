import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import DiceApp from '../components/DiceApp';
import { checkFounderUrl } from '../lib/founder';
import ProUpgrade from '../components/ProUpgrade';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          🚧 Under Construction — Paid features are in demo mode. Everything is free to try.
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <Dices className="w-3.5 h-3.5" /> SE FIRE DICE
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Roll the <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">bones.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Roll the bones, anywhere. d4 through d20, multiple dice, full roll history.</p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Dice" />
          </div>
        </motion.div>
      </div>

      <DiceApp />

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>
    </div>
  );
}

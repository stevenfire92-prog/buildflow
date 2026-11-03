import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import Converter from '../components/Converter';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import PayPalCheckout from '../components/PayPalCheckout';
import { checkFounderUrl } from '../lib/founder';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          💳 Payments are live — upgrade to Pro for full access.
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <ArrowLeftRight className="w-3.5 h-3.5" /> SE FIRE CONVERT
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Convert <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">anything.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Unit conversions without the headache. Length, weight, temperature, currency — punch in the number, get the answer in two taps.</p>
          <div className="mt-5">
            <PayPalCheckout appName="Se Fire Convert" />
          </div>
        </motion.div>
      </div>

      <Converter />

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title="Se Fire Convert — Convert anything, instantly" />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>
    </div>
  );
}

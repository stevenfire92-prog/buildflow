import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSignature } from 'lucide-react';
import ContractGen from '../components/ContractGen';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white print:bg-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center print:hidden">
        <p className="text-xs text-amber-200/90">
          🔨 This app is under construction — in no way, shape, or form is the pay option supposed to work right now. Generate free.
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4 print:hidden">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <FileSignature className="w-3.5 h-3.5" /> SE FIRE CONTRACTS
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Contracts in minutes, <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">not billable hours.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Professional templates for freelancers, services, NDAs and music licenses.</p>
        </motion.div>
      </div>

      <div className="print:hidden">
        <ContractGen />
      </div>

      <div className="border-t border-white/5 mt-8 print:hidden">
        <MusicSection />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 border-t border-white/5 print:hidden">
        <ShareButtons title="Se Fire Contracts — Contracts in minutes, not billable hours." />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center print:hidden">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a> · Templates are not legal advice.
        </p>
      </footer>
    </div>
  );
}

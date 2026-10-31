import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReceiptText } from 'lucide-react';
import InvoiceApp from '../components/InvoiceApp';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';
import ProUpgrade from '../components/ProUpgrade';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center print:hidden">
        <p className="text-xs text-amber-200/90">
          🔨 This app is under construction — in no way, shape, or form is the pay option supposed to work right now. Invoice free.
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4 print:hidden">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <ReceiptText className="w-3.5 h-3.5" /> SE FIRE INVOICES
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Invoice like a <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">pro.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Create professional invoices in seconds. Track who's paid, print or save as PDF, get your money.</p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Invoices" />
          </div>
        </motion.div>
      </div>

      <InvoiceApp />

      <div className="border-t border-white/5 mt-8 print:hidden">
        <MusicSection />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 border-t border-white/5 print:hidden">
        <ShareButtons title="Se Fire Invoices — Invoice like a pro." />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center print:hidden">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>

      <style>{`
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
        }
      `}</style>
    </div>
  );
}

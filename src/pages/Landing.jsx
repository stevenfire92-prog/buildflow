import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import ProposalsApp from '../components/ProposalsApp';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import ProUpgrade from '../components/ProUpgrade';
import { checkFounderUrl } from '../lib/founder';

export default function Landing() {
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the full free demo!
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5" /> SE FIRE PROPOSALS
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Proposals that <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">close deals.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Build polished proposals with line items and totals. Print or save as PDF in one click.</p>
          <div className="mt-5">
            <ProUpgrade appName="Se Fire Proposals" />
          </div>
        </div>
      </div>

      <ProposalsApp />

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title="Se Fire Proposals — Proposals that close deals." />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>
    </div>
  );
}

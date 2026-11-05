import { useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import ScheduleApp from '../components/ScheduleApp.jsx';
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
          💳 Payments are live — upgrade to Pro for full access
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4">
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
            <CalendarClock className="w-3.5 h-3.5" /> SE FIRE SCHEDULE
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Shifts, <span class="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">solved.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">Coordinate your crew without the group-chat chaos. Build schedules, manage shifts.</p>
          <div className="mt-5">
            <PayPalCheckout appName="Se Fire Schedule" />
          </div>
        </div>
      </div>

      <ScheduleApp />

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title="Se Fire Schedule — Shifts, solved" />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>
    </div>
  );
}

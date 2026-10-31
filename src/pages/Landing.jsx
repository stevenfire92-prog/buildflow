import { useState, useEffect } from 'react';
import { Flame, BookOpen, Library as LibraryIcon } from 'lucide-react';
import Library from '../components/Library';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';
import ProUpgrade from '../components/ProUpgrade';
import { BookPromoTab } from '../components/BookPromo';

export default function Landing() {
  const [tab, setTab] = useState('library');
  useEffect(() => { checkFounderUrl(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          🔨 Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the full free demo!
        </p>
      </div>

      <div className="text-center pt-10 pb-2 px-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-4">
          <Flame className="w-3.5 h-3.5" /> SE FIRE BOOKS
        </span>
        <h1 className="text-4xl md:text-5xl font-black mb-2">
          Your library. <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Your journey.</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">Track your reading, capture notes, finish more books.</p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Books" />
          </div>
      </div>

      <div className="flex justify-center gap-2 mt-6 px-4">
        <button
          onClick={() => setTab('library')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${tab === 'library' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-white/5 border border-white/10 hover:border-orange-400/40'}`}
        >
          <LibraryIcon className="w-4 h-4" /> My Library
        </button>
        <button
          onClick={() => setTab('shadowpath')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${tab === 'shadowpath' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-white/5 border border-white/10 hover:border-amber-400/40'}`}
        >
          <BookOpen className="w-4 h-4" /> Shadow Path
        </button>
      </div>

      {tab === 'library' ? <Library /> : <BookPromoTab />}

      <div className="border-t border-white/5 mt-8">
        <MusicSection />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 border-t border-white/5">
        <ShareButtons title="Se Fire Books — Your Personal Library" />
      </div>

      <footer className="border-t border-white/5 px-4 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Se Fire Tech · <a href="/disclaimer" className="underline hover:text-slate-300">Disclaimer</a>
        </p>
      </footer>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import Chat from '../components/Chat';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import { checkFounderUrl } from '../lib/founder';
import ProUpgrade from '../components/ProUpgrade';

export default function Landing() {
  useEffect(() => {
    checkFounderUrl();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          Our apps are currently being upgraded and under maintenance — paid features don&apos;t work right now. Enjoy the full free demo!
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {/* Hero */}
        <div className="py-10 text-center sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
            <Flame className="h-3.5 w-3.5" /> Se Fire AI Chat
          </div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Ask anything.{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Get answers.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
            Your AI companion for ideas, questions, and late-night thoughts.
          </p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire AI Chat" />
          </div>
        </div>

        {/* Chat */}
        <Chat />

        {/* Music */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <MusicSection />
        </div>

        {/* Share */}
        <div className="mt-10 flex justify-center">
          <ShareButtons title="Se Fire AI Chat — Ask anything. Get answers." />
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Se Fire Tech ·{' '}
            <Link to="/disclaimer" className="text-slate-400 underline hover:text-slate-200">
              Disclaimer
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

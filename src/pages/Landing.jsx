// Se Fire Paddle Clash — landing page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Flame, Cpu, Hash } from 'lucide-react';
import PaddleClashGame from '../components/PaddleClashGame.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import ProUpgrade from '../components/ProUpgrade.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';

function loadWins() {
  try {
    return parseInt(localStorage.getItem('sfpong:wins'), 10) || 0;
  } catch {
    return 0;
  }
}

export default function Landing() {
  const [wins, setWins] = useState(0);

  useEffect(() => {
    setWins(loadWins());
    // refresh in case the player just won a match on the game below
    const id = setInterval(() => setWins(loadWins()), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      {/* maintenance banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/25 text-amber-200 text-sm px-4 py-2.5 text-center">
        💳 Payments are live — upgrade to Pro for full access
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* hero */}
        <header className="text-center pt-10 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-semibold mb-5">
            <Gamepad2 className="w-4 h-4" />
            Se Fire Paddle Clash
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            The Original{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Rally.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            The original rally, remastered. You versus the AI — simple, fast, brutally competitive. First to blink loses.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#play"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Play Free Now
            </a>
            <PayPalCheckout appName="Se Fire Paddle Clash" />
          </div>
          {wins > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-semibold">
              <Trophy className="w-4 h-4" />
              Matches won: {wins}
            </div>
          )}
        </header>

        {/* how to play */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" /> How to play
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-orange-300">
                <Gamepad2 className="w-4 h-4" /> Controls
              </div>
              <p className="text-slate-400">
                Move your mouse or drag your finger — your paddle follows you.
                W/S or the arrow keys work too.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-amber-300">
                <Cpu className="w-4 h-4" /> The AI
              </div>
              <p className="text-slate-400">
                It tracks the ball and gets faster every point you score.
                Angle your returns and make it work for every rally.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-slate-300">
                <Hash className="w-4 h-4" /> First to 11
              </div>
              <p className="text-slate-400">
                Win the match — no deuce drama. Beat the machine and the win
                goes on your record.
              </p>
            </div>
          </div>
        </section>

        {/* game */}
        <section id="play" className="mb-12 scroll-mt-6">
          <PaddleClashGame />
        </section>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10">
          <ShareButtons title="Se Fire Paddle Clash — The Original Rally." />
        </section>

        {/* more apps */}
        <section className="mb-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-200 font-semibold text-sm"
          >
            More Se Fire apps <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* footer */}
        <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>© 2026 Se Fire Tech. All rights reserved.</p>
          <Link to="/disclaimer" className="text-slate-400 hover:text-orange-300 underline mt-1 inline-block">
            Disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}

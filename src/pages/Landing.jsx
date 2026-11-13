// Se Fire Bubbles — landing page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleDot, Play, Trophy, ChevronRight, Flame, Crosshair, Layers } from 'lucide-react';
import BubblesGame from '../components/BubblesGame.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfbubbles:best'), 10) || 0;
  } catch {
    return 0;
  }
}

export default function Landing() {
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(loadBest());
    // refresh in case the player just set a new best on the game below
    const id = setInterval(() => setBest(loadBest()), 2000);
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
            <CircleDot className="w-4 h-4" />
            Se Fire Bubbles
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            Aim.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Match.
            </span>{' '}
            Pop.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            Pop your way to victory. Match the colors, clear the board, and watch the whole thing go down in the most satisfying way possible.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#play"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Play Free Now
            </a>
            <PayPalCheckout appName="Se Fire Bubbles" />
          </div>
          {best > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-semibold">
              <Trophy className="w-4 h-4" />
              Your best: {best}
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
                <Crosshair className="w-4 h-4" /> Aim & shoot
              </div>
              <p className="text-slate-400">
                Drag to aim, release (or tap) to fire — full touch support. Bubbles
                bounce off the side walls to reach tricky spots.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-amber-300">
                <CircleDot className="w-4 h-4" /> Match 3+
              </div>
              <p className="text-slate-400">
                Pop groups of 3 or more for <span className="text-amber-300 font-bold">+10 each</span>.
                Bubbles left floating fall away for <span className="text-amber-300 font-bold">+5 each</span>.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-slate-300">
                <Layers className="w-4 h-4" /> Watch the ceiling
              </div>
              <p className="text-slate-400">
                Every 6 shots a new row drops from above. If any bubble reaches your
                shooter line, the game is over. Clear the board for a +500 bonus.
              </p>
            </div>
          </div>
        </section>

        {/* game */}
        <section id="play" className="mb-12 scroll-mt-6">
          <BubblesGame />
        </section>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10">
          <ShareButtons title="Se Fire Bubbles — Aim. Match. Pop." />
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

// Se Fire Block Drop — landing page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Blocks, Play, Trophy, ChevronRight, Flame, Zap, Star } from 'lucide-react';
import BlockDropGame from '../components/BlockDropGame.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import ProUpgrade from '../components/ProUpgrade.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sftetris:best'), 10) || 0;
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
        🔨 Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the full free demo!
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* hero */}
        <header className="text-center pt-10 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-semibold mb-5">
            <Blocks className="w-4 h-4" />
            Se Fire Block Drop
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            Stack.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Clear.
            </span>{' '}
            Level Up.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            The classic falling-block puzzler — rotate, drop, and clear lines as the speed
            ramps up. Chase a quad clear for max points. How many lines can you clear?
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#play"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Play Free Now
            </a>
            <ProUpgrade appName="Se Fire Block Drop" />
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
                <Blocks className="w-4 h-4" /> Controls
              </div>
              <p className="text-slate-400">
                Arrow keys or WASD to move, Up/X to rotate, Space for a hard drop — or tap
                the on-screen buttons on mobile.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-amber-300">
                <Star className="w-4 h-4" /> Scoring
              </div>
              <p className="text-slate-400">
                Clearing 1, 2, 3, or 4 lines at once scores{' '}
                <span className="text-amber-300 font-bold">100 / 300 / 500 / 800</span>{' '}
                points × your level. Land a quad clear (4 lines) for the big payoff.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-slate-300">
                <Zap className="w-4 h-4" /> Levels
              </div>
              <p className="text-slate-400">
                Every 10 lines cleared raises your level and the speed ramps up —
                from a chill 800ms down to a blazing 80ms per drop.
              </p>
            </div>
          </div>
        </section>

        {/* game */}
        <section id="play" className="mb-12 scroll-mt-6">
          <BlockDropGame />
        </section>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10">
          <ShareButtons title="Se Fire Block Drop — Stack. Clear. Level Up." />
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

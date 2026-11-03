// Se Fire Snake — landing page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Flame, Zap, Star } from 'lucide-react';
import SnakeGame from '../components/SnakeGame.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import ProUpgrade from '../components/ProUpgrade.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfsnake:best'), 10) || 0;
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
            <Gamepad2 className="w-4 h-4" />
            Se Fire Snake
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
            Eat.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Grow.
            </span>{' '}
            Survive.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6">
            Eat. Grow. Don't die. The timeless classic is back and just as ruthless as you remember. How long can you survive?
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#play"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Play Free Now
            </a>
            <ProUpgrade appName="Se Fire Snake" />
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
                <Gamepad2 className="w-4 h-4" /> Controls
              </div>
              <p className="text-slate-400">
                Arrow keys or WASD to steer, Space to pause — or tap the on-screen d-pad on mobile.
                Your direction queues up, and you can't reverse into yourself.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-amber-300">
                <Star className="w-4 h-4" /> Golden orbs
              </div>
              <p className="text-slate-400">
                A rare sparkling golden orb is worth <span className="text-amber-300 font-bold">+5 points</span> and
                grows you twice — grab it before it taunts you. Normal fire orbs give +1.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center gap-2 font-bold mb-2 text-slate-300">
                <Zap className="w-4 h-4" /> Levels & obstacles
              </div>
              <p className="text-slate-400">
                Every 5 points raises your level, adds a stone block (max 12), and speeds things up —
                from a chill 130ms down to a blazing 70ms per step.
              </p>
            </div>
          </div>
        </section>

        {/* game */}
        <section id="play" className="mb-12 scroll-mt-6">
          <SnakeGame />
        </section>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10">
          <ShareButtons title="Se Fire Snake — Eat. Grow. Survive." />
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

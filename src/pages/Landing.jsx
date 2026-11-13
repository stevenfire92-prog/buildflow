import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Flame, Coins, Zap, Timer } from 'lucide-react';
import RunnerGame from '../components/RunnerGame.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';

const BEST_KEY = 'sfrunner:best';

export default function Landing() {
  const [best, setBest] = useState(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(BEST_KEY);
      setBest(v ? parseInt(v, 10) : null);
    } catch {
      setBest(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500 text-black text-center text-sm font-semibold px-4 py-2">
        💳 Payments are live — upgrade to Pro for full access
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Hero */}
        <header className="text-center pt-12 pb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-4 py-1.5 text-sm text-orange-300 mb-5">
            <Flame size={16} />
            <span>Se Fire Runner</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Run. Dodge.{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Survive.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            How far can you go? A fast-paced endless runner that punishes slow reflexes. One more run — you know you want to.
          </p>
          <PayPalCheckout appName="Se Fire Runner" />
        </header>

        {/* Pro perks strip */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8 flex items-center justify-center gap-6 flex-wrap text-sm">
          <span className="flex items-center gap-2 text-orange-300">
            <Zap size={16} /> Exclusive runner skins
          </span>
          <span className="flex items-center gap-2 text-orange-300">
            <Gamepad2 size={16} /> No ads
          </span>
          <span className="flex items-center gap-2 text-gray-400">
            <ChevronRight size={16} /> Go Pro to unlock
          </span>
        </div>

        {/* Best score */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <Trophy size={28} className="text-amber-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Best Score</p>
              <p className="text-2xl font-black text-white">
                {best === null ? 'No score yet' : best.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* How to play */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gamepad2 size={20} className="text-orange-400" /> How to play
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <span className="font-semibold text-white">← → or A/D</span> — change lanes
            </li>
            <li>
              <span className="font-semibold text-white">↑, W or Space</span> — jump over low
              barriers
            </li>
            <li>
              <span className="font-semibold text-white">↓ or S</span> — slide under overhead gates
            </li>
            <li>
              <span className="font-semibold text-white">Swipe</span> — left / right / up / down on
              mobile
            </li>
          </ul>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-2 text-center">
              <span className="text-red-400 font-semibold">Low barrier</span>
              <p className="text-gray-400 mt-1">Jump it</p>
            </div>
            <div className="bg-gray-500/15 border border-gray-500/30 rounded-lg p-2 text-center">
              <span className="text-gray-300 font-semibold">Overhead gate</span>
              <p className="text-gray-400 mt-1">Slide under</p>
            </div>
            <div className="bg-orange-500/15 border border-orange-500/30 rounded-lg p-2 text-center">
              <span className="text-orange-300 font-semibold">Full block</span>
              <p className="text-gray-400 mt-1">Switch lanes</p>
            </div>
            <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-lg p-2 text-center col-span-3">
              <span className="text-yellow-300 font-semibold flex items-center justify-center gap-1">
                <Coins size={14} /> Coins = +10 points each
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
            <Timer size={14} /> Speed ramps up the longer you survive. Good luck.
          </p>
        </section>

        {/* The game */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
            <Play size={20} className="text-orange-400" /> Play now — it's free
          </h2>
          <RunnerGame />
        </section>

        <MusicSection accent="orange" />
        <ShareButtons title="Se Fire Runner — Run. Dodge. Survive." />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          <p>© 2026 Se Fire Tech. All rights reserved.</p>
          <Link to="/disclaimer" className="text-orange-400 hover:underline mt-2 inline-block">
            Disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}

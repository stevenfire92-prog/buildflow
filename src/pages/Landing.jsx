// Se Fire Breaker — landing page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Flame, Layers, Zap } from 'lucide-react';
import BreakerGame from '../components/BreakerGame.jsx';
import ProUpgrade from '../components/ProUpgrade.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfbreaker:best') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

const POWER_LEGEND = [
  { letter: 'W', name: 'Wide Paddle', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10', desc: 'Paddle grows 55% for 12s' },
  { letter: 'M', name: 'Multi-Ball', color: 'text-violet-300 border-violet-400/40 bg-violet-400/10', desc: 'Splits into 3 balls' },
  { letter: 'S', name: 'Slow Ball', color: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10', desc: 'Ball slows down for 10s' },
  { letter: '+', name: 'Extra Life', color: 'text-amber-300 border-amber-400/40 bg-amber-400/10', desc: '+1 life instantly' },
];

export default function Landing() {
  const [best] = useState(loadBest);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* maintenance banner */}
      <div className="bg-amber-500/15 px-4 py-2.5 text-center text-sm font-semibold text-amber-300 ring-1 ring-inset ring-amber-400/30">
        💳 Payments are live — upgrade to Pro for full access
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* hero */}
        <header className="py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            <Gamepad2 className="h-4 w-4" /> Se Fire Breaker
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Smash.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              Clear.
            </span>{' '}
            Level up.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Smash every last brick. Classic arcade action with a modern edge — pure, satisfying destruction. Clear the board, feel like a legend.
          </p>
          <div className="mt-6 flex justify-center">
            <PayPalCheckout appName="Se Fire Breaker" />
          </div>
        </header>

        {/* best score strip */}
        <div className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="text-sm text-slate-400">Your best score</span>
          <span className="text-xl font-black text-amber-300">{best.toLocaleString()}</span>
        </div>

        {/* how to play */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Play className="h-5 w-5 text-orange-400" /> How to play
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><span className="font-bold text-white">Move:</span> mouse, touch drag, or ← → / A D keys</li>
              <li><span className="font-bold text-white">Launch:</span> tap the game, click, or press Space</li>
              <li><span className="font-bold text-white">Aim:</span> where the ball hits the paddle steers the angle</li>
              <li><span className="font-bold text-white">Cracked bricks:</span> dark ones take 2 hits</li>
              <li><span className="font-bold text-white">Lives:</span> 3 per run — don&apos;t let the ball fall</li>
              <li><span className="font-bold text-white">Pause:</span> P key or the pause button</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Zap className="h-5 w-5 text-orange-400" /> Power-up capsules
            </h2>
            <div className="mt-3 space-y-2.5">
              {POWER_LEGEND.map((p) => (
                <div key={p.letter} className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-black ${p.color}`}>
                    {p.letter}
                  </span>
                  <div className="text-sm">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-slate-400">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* feature chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Layers className="h-3.5 w-3.5 text-orange-400" /> Endless levels
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Neon glow action
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <ChevronRight className="h-3.5 w-3.5 text-orange-400" /> Keyboard + touch + mouse
          </span>
        </div>

        {/* the game */}
        <main className="mb-12">
          <BreakerGame />
        </main>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10 flex justify-center">
          <ShareButtons title="Se Fire Breaker — Smash. Clear. Level up." />
        </section>

        {/* footer */}
        <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>© 2026 Se Fire Tech</p>
          <Link to="/disclaimer" className="mt-1 inline-block text-slate-400 underline-offset-2 hover:text-orange-300 hover:underline">
            Disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}

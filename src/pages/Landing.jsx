// Se Fire Gravity Flip — landing page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Flame, ArrowUpDown, Zap } from 'lucide-react';
import GravityFlipGame from '../components/GravityFlipGame.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfgravityflip:best') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

const TIPS = [
  { t: 'Flip early', d: 'Tap before you reach the spike — the fall takes a beat.' },
  { t: 'Watch both sides', d: 'Spikes spawn on the floor AND the ceiling. Scan ahead.' },
  { t: 'Staggered pairs force a flip', d: 'Floor-then-ceiling combos mean two quick taps.' },
  { t: 'Speed keeps rising', d: 'The longer you survive, the faster the world scrolls.' },
];

export default function Landing() {
  const [best] = useState(loadBest);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* payments live banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          💳 Payments are live — upgrade to Pro for full access.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* hero */}
        <header className="py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            <Gamepad2 className="h-4 w-4" /> Se Fire Gravity Flip
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Flip gravity.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              Dodge spikes.
            </span>{' '}
            Survive.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Your robot sprints on its own — you control gravity. Flip between floor and ceiling, thread the spike
            gauntlet, and chase your longest run.
          </p>
          <div className="mt-6 flex justify-center">
            <PayPalCheckout appName="Se Fire Gravity Flip" />
          </div>
        </header>

        {/* best distance strip */}
        <div className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="text-sm text-slate-400">Your longest run</span>
          <span className="text-xl font-black text-amber-300">{best.toLocaleString()}m</span>
        </div>

        {/* how to play + tips */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Play className="h-5 w-5 text-orange-400" /> How to play
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><span className="font-bold text-white">Flip:</span> tap, click, or press Space / ↑ / W</li>
              <li><span className="font-bold text-white">Goal:</span> dodge every spike — one hit ends the run</li>
              <li><span className="font-bold text-white">Score:</span> distance in meters — it ramps up fast</li>
              <li><span className="font-bold text-white">Speed:</span> the world scrolls faster the longer you live</li>
              <li><span className="font-bold text-white">Pause:</span> P key, Esc, or the pause button</li>
              <li><span className="font-bold text-white">Best:</span> your longest run is saved on this device</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Zap className="h-5 w-5 text-orange-400" /> Survival tips
            </h2>
            <div className="mt-3 space-y-2.5">
              {TIPS.map((p) => (
                <div key={p.t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-400/40 bg-orange-400/10">
                    <ArrowUpDown className="h-4 w-4 text-orange-300" />
                  </span>
                  <div className="text-sm">
                    <div className="font-bold text-white">{p.t}</div>
                    <div className="text-slate-400">{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* feature chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Endless runner
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <ArrowUpDown className="h-3.5 w-3.5 text-orange-400" /> Gravity flipping
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <ChevronRight className="h-3.5 w-3.5 text-orange-400" /> Tap + keyboard + touch
          </span>
        </div>

        {/* the game */}
        <main className="mb-12">
          <GravityFlipGame />
        </main>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10 flex justify-center">
          <ShareButtons title="Se Fire Gravity Flip — Flip Gravity. Dodge Spikes. Survive." />
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

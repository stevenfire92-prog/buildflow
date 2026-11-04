// Se Fire Neon Dash — landing page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Play, Trophy, ChevronRight, Flame, Gauge, MoveHorizontal } from 'lucide-react';
import NeonDashGame from '../components/NeonDashGame.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfneondash:best') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

const TIPS = [
  { icon: MoveHorizontal, title: 'Stay loose', desc: 'Small, smooth moves beat jerky dodges. Ride the gaps.' },
  { icon: Gauge, title: 'It gets faster', desc: 'Fall speed ramps up every second — and spawn rate doubles past 20s.' },
  { icon: Flame, title: 'Edges are safe-ish', desc: 'Hazards spawn across the full width, but the walls give you one less direction to watch.' },
  { icon: Zap, title: 'Commit', desc: 'Hesitation kills. Pick a lane and go — the orb follows your finger fast.' },
];

export default function Landing() {
  const [best] = useState(loadBest);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* payments-live banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
        <p className="text-xs text-amber-200/90">
          💳 Payments are live — upgrade to Pro for full access.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">
        {/* hero */}
        <header className="py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            <Zap className="h-4 w-4" /> Se Fire Neon Dash
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Dodge.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              Survive.
            </span>{' '}
            Chase the glow.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            A high-speed neon obstacle dodger. Steer your glowing orb through the falling hazard storm — every second you survive is a point on the board.
          </p>
          <div className="mt-6 flex justify-center">
            <PayPalCheckout appName="Se Fire Neon Dash" />
          </div>
        </header>

        {/* best score strip */}
        <div className="mb-8 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Trophy className="h-5 w-5 text-amber-400" />
          <span className="text-sm text-slate-400">Your best run</span>
          <span className="text-xl font-black text-amber-300">{best}s</span>
        </div>

        {/* how to play + tips */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Play className="h-5 w-5 text-orange-400" /> How to play
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><span className="font-bold text-white">Move:</span> ← → or A / D keys, mouse drag, or finger drag</li>
              <li><span className="font-bold text-white">Start:</span> tap the game, click, or press Space</li>
              <li><span className="font-bold text-white">Score:</span> 1 point per second survived</li>
              <li><span className="font-bold text-white">Hazards:</span> neon shards fall faster the longer you last</li>
              <li><span className="font-bold text-white">Game over:</span> one hit and you&apos;re wrecked</li>
              <li><span className="font-bold text-white">Pause:</span> P key or the pause button</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Flame className="h-5 w-5 text-orange-400" /> Survival tips
            </h2>
            <div className="mt-3 space-y-2.5">
              {TIPS.map((t) => (
                <div key={t.title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-orange-400/40 bg-orange-400/10">
                    <t.icon className="h-4 w-4 text-orange-300" />
                  </span>
                  <div className="text-sm">
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-slate-400">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* feature chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Gauge className="h-3.5 w-3.5 text-orange-400" /> Ramping speed
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
          <NeonDashGame />
        </main>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10 flex justify-center">
          <ShareButtons title="Se Fire Neon Dash — Dodge. Survive. Chase the glow." />
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

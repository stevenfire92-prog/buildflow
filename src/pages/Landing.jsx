// Se Fire Crystal Cascade — landing page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, Play, Trophy, ChevronRight, Flame, Layers, Zap, AlertTriangle } from 'lucide-react';
import CrystalCascadeGame from '../components/CrystalCascadeGame.jsx';
import PayPalCheckout from '../components/PayPalCheckout.jsx';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';

function loadBest() {
  try {
    return parseInt(localStorage.getItem('sfcascade:best') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

const HOW_TO = [
  { title: 'Move the catcher', desc: '← → / A D keys, mouse, or touch-drag' },
  { title: 'Catch crystals', desc: 'Grab falling crystals into your tray' },
  { title: 'Match 3+ of a color', desc: 'Adjacent same-color crystals shatter for points' },
  { title: 'Build combos', desc: 'Chain clears without missing to multiply points' },
  { title: 'Watch the stacks', desc: 'Missed crystals pile up — clear matches to smash them back' },
  { title: 'Survive', desc: 'Any stack crossing the red line ends the run' },
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
            <Gem className="h-4 w-4" /> Se Fire Crystal Cascade
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Catch.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
              Match.
            </span>{' '}
            Survive.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Crystals rain from above. Snatch them with your catcher, line up 3 or more of a color,
            and shatter them for combos — before the missed ones bury you.
          </p>
          <div className="mt-6 flex justify-center">
            <PayPalCheckout appName="Se Fire Crystal Cascade" />
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
            <ul className="mt-3 space-y-2.5">
              {HOW_TO.slice(0, 3).map((h) => (
                <li key={h.title} className="text-sm text-slate-300">
                  <span className="font-bold text-white">{h.title}:</span> {h.desc}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Zap className="h-5 w-5 text-orange-400" /> Scoring &amp; danger
            </h2>
            <ul className="mt-3 space-y-2.5">
              {HOW_TO.slice(3).map((h) => (
                <li key={h.title} className="text-sm text-slate-300">
                  <span className="font-bold text-white">{h.title}:</span> {h.desc}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* feature chips */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Layers className="h-3.5 w-3.5 text-orange-400" /> 5 crystal colors
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Combo multiplier
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" /> Danger stacks
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
            <ChevronRight className="h-3.5 w-3.5 text-orange-400" /> Keyboard + touch + mouse
          </span>
        </div>

        {/* the game */}
        <main className="mb-12">
          <CrystalCascadeGame />
        </main>

        {/* music */}
        <section className="mb-10">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-10 flex justify-center">
          <ShareButtons title="Se Fire Crystal Cascade — Catch. Match. Survive." />
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

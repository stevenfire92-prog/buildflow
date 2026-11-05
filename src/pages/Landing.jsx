import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Play, Trophy, ChevronRight, Rocket, Shield, Zap } from 'lucide-react';
import InvadersGame from '../components/InvadersGame';
import MusicSection from '../components/MusicSection';
import ShareButtons from '../components/ShareButtons';
import PayPalCheckout from '../components/PayPalCheckout';

export default function Landing() {
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      setBest(parseInt(localStorage.getItem('sfinvaders:best') || '0', 10) || 0);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {/* maintenance banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-sm text-center px-4 py-2.5">
        💳 Payments are live — upgrade to Pro for full access
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* hero */}
        <header className="text-center pt-12 pb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm font-semibold mb-5">
            <Gamepad2 className="w-4 h-4" /> Se Fire Star Defenders
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Defend. Blast.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-500 bg-clip-text text-transparent">
              Survive.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-6">
            The galaxy needs defending and you're the last ship standing. Blast through waves of invaders before they blast through you. No pressure.</p>
          <PayPalCheckout appName="Se Fire Star Defenders" />
        </header>

        {/* best score chip */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-zinc-400 text-sm">Your best:</span>
            <span className="text-xl font-bold text-amber-300 tabular-nums">{best.toLocaleString()}</span>
          </div>
        </div>

        {/* game */}
        <section className="mb-12">
          <InvadersGame />
        </section>

        {/* how to play */}
        <section className="mb-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-orange-400" /> How to play
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 font-semibold text-orange-300 mb-2">
                <Gamepad2 className="w-4 h-4" /> Controls
              </div>
              <p className="text-zinc-400">
                Move with <span className="text-zinc-200 font-semibold">← →</span> or <span className="text-zinc-200 font-semibold">A / D</span>.
                Shoot with <span className="text-zinc-200 font-semibold">Space</span>. On mobile, drag to move and tap the canvas or the FIRE button to blast.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 font-semibold text-orange-300 mb-2">
                <Shield className="w-4 h-4" /> Shields
              </div>
              <p className="text-zinc-400">
                Three green bunkers protect you — but every hit chews a block away, from either side. Use them wisely before they crumble.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 font-semibold text-orange-300 mb-2">
                <Zap className="w-4 h-4" /> Waves
              </div>
              <p className="text-zinc-400">
                Clear a wave and the next arrives bigger, faster, and meaner — more rows, quicker aliens, heavier return fire. Survive as long as you can.
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-xs mt-4 flex items-center gap-1">
            <Play className="w-3 h-3" /> Higher rows are worth more points. Dodge the red bolts — 3 lives, then it's game over.
          </p>
        </section>

        {/* music */}
        <section className="mb-12">
          <MusicSection accent="orange" />
        </section>

        {/* share */}
        <section className="mb-12 text-center">
          <ShareButtons title="Se Fire Star Defenders — Defend. Blast. Survive." />
        </section>

        {/* footer */}
        <footer className="text-center text-zinc-500 text-sm border-t border-zinc-800 pt-6">
          <p>© 2026 Se Fire Tech</p>
          <Link to="/disclaimer" className="inline-flex items-center gap-1 text-zinc-400 hover:text-orange-300 mt-2">
            Disclaimer <ChevronRight className="w-3 h-3" />
          </Link>
        </footer>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Brain, Worm, Grid3x3, Trophy, ChevronRight } from 'lucide-react';
import MusicSection from '../components/MusicSection.jsx';
import ShareButtons from '../components/ShareButtons.jsx';
import MemoryGame from '../components/MemoryGame.jsx';
import SnakeGame from '../components/SnakeGame.jsx';
import TicTacToe from '../components/TicTacToe.jsx';
import ProUpgrade from '../components/ProUpgrade.jsx';

function readBest(key) {
  try {
    const v = localStorage.getItem(key);
    return v !== null && v !== '' ? v : null;
  } catch {
    return null;
  }
}

function readTttStats() {
  try {
    const raw = JSON.parse(localStorage.getItem('sfgames:tictactoe:stats'));
    if (raw) return raw;
  } catch { /* ignore */ }
  return { wins: 0, losses: 0, draws: 0 };
}

const GAMES = [
  {
    id: 'memory',
    name: 'Memory Match',
    desc: 'Flip the cards, find all 8 pairs. Fewest moves wins.',
    icon: Brain,
    bestKey: 'sfgames:memory:best',
    bestLabel: (v) => `Best: ${v} moves`,
  },
  {
    id: 'snake',
    name: 'Snake',
    desc: 'Eat the fire orbs, grow long, don\'t crash.',
    icon: Worm,
    bestKey: 'sfgames:snake:best',
    bestLabel: (v) => `Best: ${v} pts`,
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    desc: 'You\'re X. The AI plays to win. Good luck.',
    icon: Grid3x3,
    bestKey: null,
    bestLabel: () => {
      const s = readTttStats();
      return `Record: ${s.wins}W–${s.losses}L–${s.draws}D`;
    },
  },
];

export default function Landing() {
  const [active, setActive] = useState('memory');
  const [, forceRefresh] = useState(0);

  const ActiveGame = active === 'memory' ? MemoryGame : active === 'snake' ? SnakeGame : TicTacToe;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Maintenance banner */}
      <div className="bg-amber-500 text-black text-center text-xs sm:text-sm font-semibold px-4 py-2.5">
        🔨 Our apps are currently being upgraded and under maintenance — paid features don't work right now. Enjoy the full free demo!
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Hero */}
        <header className="text-center pt-12 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300 text-xs font-bold tracking-widest uppercase mb-5">
            <Gamepad2 className="w-4 h-4" />
            Se Fire Games
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            Play. <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">Compete.</span> Win.
          </h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            Free arcade classics from Se Fire Tech — no sign-up, no ads, just you against your own high score.
          </p>
          <div className="mt-5 flex justify-center">
            <ProUpgrade appName="Se Fire Games" />
          </div>
        </header>

        {/* Game selector */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {GAMES.map((g) => {
            const Icon = g.icon;
            const isActive = active === g.id;
            const best = g.bestKey ? readBest(g.bestKey) : 'x';
            return (
              <button
                key={g.id}
                onClick={() => {
                  setActive(g.id);
                  forceRefresh((n) => n + 1);
                }}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'bg-orange-500/10 border-orange-500/60 shadow-[0_0_24px_rgba(249,115,22,0.15)]'
                    : 'bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-orange-400' : 'text-white/60'}`} />
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-white/30'}`} />
                </div>
                <div className="font-bold">{g.name}</div>
                <p className="text-xs text-white/50 mt-1 mb-2">{g.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-semibold">
                  <Trophy className="w-3.5 h-3.5" />
                  {g.bestKey ? (best !== null ? g.bestLabel(best) : 'No score yet') : g.bestLabel()}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active game */}
        <div className="mb-12">
          <ActiveGame key={active} />
        </div>

        {/* Music */}
        <div className="mb-8">
          <MusicSection accent="orange" />
        </div>

        {/* Share */}
        <div className="mb-10">
          <ShareButtons title="Se Fire Games — Play. Compete. Win." />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-white/40 border-t border-white/10 pt-6">
          <p>© 2026 Se Fire Tech. All rights reserved.</p>
          <Link to="/disclaimer" className="text-orange-400/80 hover:text-orange-300 underline mt-1 inline-block">
            Disclaimer
          </Link>
        </footer>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, MousePointerClick } from 'lucide-react';
import { toast } from 'sonner';

const EMOJIS = ['🔥', '🎮', '🎯', '🚀', '⭐', '🎲', '🎸', '🏆'];
const BEST_KEY = 'sfgames:memory:best';

function shuffledDeck() {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({ id: i, emoji }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getBest() {
  try {
    const v = parseInt(localStorage.getItem(BEST_KEY), 10);
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

export default function MemoryGame() {
  const [deck, setDeck] = useState(() => shuffledDeck());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [best, setBest] = useState(getBest);

  const newGame = useCallback(() => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  }, []);

  const flip = (id) => {
    if (locked || flipped.includes(id) || matched.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      const cardA = deck.find((c) => c.id === a);
      const cardB = deck.find((c) => c.id === b);
      if (cardA.emoji === cardB.emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === deck.length) {
          const finalMoves = moves + 1;
          const prevBest = getBest();
          if (prevBest === null || finalMoves < prevBest) {
            try {
              localStorage.setItem(BEST_KEY, String(finalMoves));
            } catch { /* storage unavailable */ }
            setBest(finalMoves);
            toast.success(`🏆 New best! ${finalMoves} moves — you're on fire!`);
          } else {
            toast.success(`🎉 You won in ${finalMoves} moves!`);
          }
        }
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/80">
            <MousePointerClick className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">{moves} moves</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{best !== null ? `Best: ${best}` : 'Best: —'}</span>
          </div>
        </div>
        <button
          onClick={newGame}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> New Game
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {deck.map((card) => {
          const faceUp = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              disabled={faceUp}
              aria-label={faceUp ? `card ${card.emoji}` : 'face-down card'}
              className={`aspect-square rounded-xl text-2xl sm:text-4xl flex items-center justify-center transition-all duration-300 border ${
                faceUp
                  ? isMatched
                    ? 'bg-orange-500/20 border-orange-400/60 scale-[0.97]'
                    : 'bg-white/10 border-white/20 scale-[0.97]'
                  : 'bg-gradient-to-br from-orange-900/60 to-red-950/60 border-orange-500/30 hover:border-orange-400/70 hover:scale-[1.03] cursor-pointer'
              }`}
            >
              {faceUp ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>

      {matched.length === deck.length && (
        <div className="text-center mt-5">
          <button
            onClick={newGame}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

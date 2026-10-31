import { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Minus } from 'lucide-react';
import { toast } from 'sonner';

const STATS_KEY = 'sfgames:tictactoe:stats';
const PLAYER = 'X';
const AI = 'O';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
}

function getStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY));
    if (raw && Number.isFinite(raw.wins) && Number.isFinite(raw.losses) && Number.isFinite(raw.draws)) {
      return raw;
    }
  } catch { /* ignore */ }
  return { wins: 0, losses: 0, draws: 0 };
}

// Minimax with depth-limited tie-breaking so AI plays smart but not painfully slow.
function minimax(board, isMax, depth) {
  const result = winnerOf(board);
  if (result) {
    if (result.winner === AI) return 10 - depth;
    if (result.winner === PLAYER) return depth - 10;
    return 0;
  }
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? AI : PLAYER;
      const score = minimax(board, !isMax, depth + 1);
      board[i] = null;
      best = isMax ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

function bestMove(board) {
  // Early game: center or corner first to keep it snappy and varied.
  if (board.every((c) => !c)) return 4;
  let bestScore = -Infinity;
  let move = -1;
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const i of order) {
    if (!board[i]) {
      board[i] = AI;
      const score = minimax(board, false, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(PLAYER);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(getStats);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn(PLAYER);
    setResult(null);
  };

  // AI move
  useEffect(() => {
    if (turn !== AI || result) return;
    const t = setTimeout(() => {
      const b = [...board];
      const move = bestMove(b);
      if (move >= 0) {
        b[move] = AI;
        setBoard(b);
        const r = winnerOf(b);
        if (r) {
          setResult(r);
        } else {
          setTurn(PLAYER);
        }
      }
    }, 450);
    return () => clearTimeout(t);
  }, [turn, board, result]);

  // Record result once
  useEffect(() => {
    if (!result) return;
    setStats((prev) => {
      const next = { ...prev };
      if (result.winner === PLAYER) {
        next.wins += 1;
        toast.success('🎉 You win! Nice moves.');
      } else if (result.winner === AI) {
        next.losses += 1;
        toast.error('🤖 AI wins — rematch?');
      } else {
        next.draws += 1;
        toast('🤝 It\'s a draw!');
      }
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch { /* storage unavailable */ }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const play = (i) => {
    if (board[i] || result || turn !== PLAYER) return;
    const b = [...board];
    b[i] = PLAYER;
    setBoard(b);
    const r = winnerOf(b);
    if (r) {
      setResult(r);
    } else {
      setTurn(AI);
    }
  };

  const cellClass = (i) => {
    const inWinLine = result && result.line.includes(i);
    return `aspect-square rounded-xl text-4xl sm:text-5xl font-bold flex items-center justify-center border transition-all ${
      inWinLine
        ? 'bg-orange-500/30 border-orange-400'
        : 'bg-white/5 border-white/10 hover:border-orange-400/50'
    } ${board[i] === PLAYER ? 'text-orange-400' : 'text-red-400'} ${!board[i] && !result ? 'cursor-pointer hover:bg-white/10' : ''}`;
  };

  const status = result
    ? result.winner === 'draw'
      ? "It's a draw!"
      : result.winner === PLAYER
        ? 'You win! 🎉'
        : 'AI wins 🤖'
    : turn === PLAYER
      ? 'Your turn (X)'
      : 'AI is thinking…';

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-green-400 font-semibold">
            <Trophy className="w-4 h-4" /> {stats.wins} wins
          </span>
          <span className="text-red-400 font-semibold">{stats.losses} losses</span>
          <span className="flex items-center gap-1.5 text-white/50">
            <Minus className="w-4 h-4" /> {stats.draws} draws
          </span>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="text-center mb-4 text-white/80 font-semibold">{status}</div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs mx-auto">
        {board.map((cell, i) => (
          <button key={i} onClick={() => play(i)} className={cellClass(i)} aria-label={`cell ${i + 1}`}>
            {cell}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-white/40 mt-4">You are <span className="text-orange-400 font-bold">X</span> · AI is <span className="text-red-400 font-bold">O</span> (it plays to win)</p>
    </div>
  );
}

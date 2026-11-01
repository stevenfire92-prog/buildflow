// Se Fire Tetris — classic falling-block puzzler with levels, line clears, touch controls.
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Pause, Play, RotateCcw, Trophy, Blocks } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BEST_KEY = 'sftetris:best';
const LINE_SCORES = [0, 100, 300, 500, 800];

const SHAPES = [
  { name: 'I', color: '#22d3ee', matrix: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  { name: 'O', color: '#facc15', matrix: [[1, 1], [1, 1]] },
  { name: 'T', color: '#c084fc', matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  { name: 'S', color: '#4ade80', matrix: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  { name: 'Z', color: '#f87171', matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  { name: 'J', color: '#60a5fa', matrix: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  { name: 'L', color: '#fb923c', matrix: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
];

// clockwise rotation: transpose + reverse each row
function rotate(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]).reverse());
}

function randomShape() {
  const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { name: s.name, color: s.color, matrix: s.matrix.map((r) => [...r]) };
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// collision: out of bounds (sides/bottom) or overlapping a locked cell
function valid(board, matrix, px, py) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const x = px + c;
      const y = py + r;
      if (x < 0 || x >= COLS || y >= ROWS) return false;
      if (y >= 0 && board[y][x]) return false;
    }
  }
  return true;
}

function loadBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

export default function TetrisGame() {
  const game = useRef(null); // mutable game state
  const phaseRef = useRef('ready');

  const [phase, setPhase] = useState('ready'); // ready | playing | paused | over
  const [boardView, setBoardView] = useState(emptyBoard);
  const [curView, setCurView] = useState(null);
  const [nextView, setNextView] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(loadBest);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const sync = () => {
    const g = game.current;
    if (!g) return;
    setBoardView(g.board.map((r) => [...r]));
    setCurView({ ...g.current, matrix: g.current.matrix.map((r) => [...r]) });
    setNextView({ ...g.next, matrix: g.next.matrix.map((r) => [...r]) });
  };

  const spawn = (g) => {
    const s = g.next;
    const cur = {
      name: s.name,
      color: s.color,
      matrix: s.matrix.map((r) => [...r]),
      x: Math.floor((COLS - s.matrix[0].length) / 2),
      y: 0,
    };
    g.next = randomShape();
    g.current = cur;
    return valid(g.board, cur.matrix, cur.x, cur.y);
  };

  const endGame = () => {
    const g = game.current;
    if (!g || phaseRef.current === 'over') return;
    const finalScore = g.score;
    setBest((prevBest) => {
      if (finalScore > prevBest) {
        try {
          localStorage.setItem(BEST_KEY, String(finalScore));
        } catch {
          // ignore
        }
        toast.success(`New best score! ${finalScore} 🔥`);
        return finalScore;
      }
      return prevBest;
    });
    setPhase('over');
  };

  const lockPiece = () => {
    const g = game.current;
    if (!g) return;
    const cur = g.current;
    const board = g.board.map((r) => [...r]);
    cur.matrix.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        const y = cur.y + r;
        const x = cur.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = cur.color;
      });
    });

    // remove full rows
    let cleared = 0;
    const kept = [];
    for (const row of board) {
      if (row.every((cell) => cell)) cleared += 1;
      else kept.push(row);
    }
    while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0));
    g.board = kept;

    if (cleared > 0) {
      g.lines += cleared;
      g.score += LINE_SCORES[cleared] * g.level;
      g.level = Math.floor(g.lines / 10) + 1;
      if (cleared === 4) toast.success('TETRIS! 🔥');
    }
    setScore(g.score);
    setLines(g.lines);
    setLevel(g.level);

    if (!spawn(g)) {
      sync();
      endGame();
      return;
    }
    sync();
  };

  const tick = () => {
    const g = game.current;
    if (!g || phaseRef.current !== 'playing') return;
    const cur = g.current;
    if (valid(g.board, cur.matrix, cur.x, cur.y + 1)) {
      cur.y += 1;
      sync();
    } else {
      lockPiece();
    }
  };

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const move = (dx) => {
    const g = game.current;
    if (!g || phaseRef.current !== 'playing') return;
    const cur = g.current;
    if (valid(g.board, cur.matrix, cur.x + dx, cur.y)) {
      cur.x += dx;
      sync();
    }
  };

  const rotateCur = () => {
    const g = game.current;
    if (!g || phaseRef.current !== 'playing') return;
    const cur = g.current;
    const rotated = rotate(cur.matrix);
    // simple wall kicks: try same x, then ±1, ±2
    for (const kick of [0, -1, 1, -2, 2]) {
      if (valid(g.board, rotated, cur.x + kick, cur.y)) {
        cur.matrix = rotated;
        cur.x += kick;
        sync();
        return;
      }
    }
  };

  const softDrop = () => {
    const g = game.current;
    if (!g || phaseRef.current !== 'playing') return;
    const cur = g.current;
    if (valid(g.board, cur.matrix, cur.x, cur.y + 1)) {
      cur.y += 1;
      g.score += 1;
      setScore(g.score);
      sync();
    } else {
      lockPiece();
    }
  };

  const hardDrop = () => {
    const g = game.current;
    if (!g || phaseRef.current !== 'playing') return;
    const cur = g.current;
    let d = 0;
    while (valid(g.board, cur.matrix, cur.x, cur.y + 1)) {
      cur.y += 1;
      d += 1;
    }
    g.score += d * 2;
    setScore(g.score);
    lockPiece();
  };

  const newGame = () => {
    const g = {
      board: emptyBoard(),
      current: null,
      next: randomShape(),
      score: 0,
      lines: 0,
      level: 1,
    };
    game.current = g;
    spawn(g);
    setScore(0);
    setLines(0);
    setLevel(1);
    sync();
  };

  const startGame = () => {
    newGame();
    setPhase('playing');
  };

  const togglePause = () => {
    if (phaseRef.current === 'playing') setPhase('paused');
    else if (phaseRef.current === 'paused') setPhase('playing');
  };

  // ---------- refs for listeners ----------
  const newGameRef = useRef(newGame);
  newGameRef.current = newGame;
  const startGameRef = useRef(startGame);
  startGameRef.current = startGame;
  const moveRef = useRef(move);
  moveRef.current = move;
  const rotateRef = useRef(rotateCur);
  rotateRef.current = rotateCur;
  const softDropRef = useRef(softDrop);
  softDropRef.current = softDrop;
  const hardDropRef = useRef(hardDrop);
  hardDropRef.current = hardDrop;
  const togglePauseRef = useRef(togglePause);
  togglePauseRef.current = togglePause;

  // initial static board behind the start overlay
  useEffect(() => {
    newGameRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- gravity loop ----------
  const delay = Math.max(80, 800 - (level - 1) * 70);
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => tickRef.current(), delay);
    return () => clearInterval(id);
  }, [phase, delay]);

  // ---------- keyboard + blur ----------
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      const gameKey = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'x', 'X', 'p', 'P'].includes(k);
      if (phaseRef.current === 'ready' && (gameKey || k === 'Enter')) {
        e.preventDefault();
        startGameRef.current();
        return;
      }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        e.preventDefault();
        moveRef.current(-1);
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        e.preventDefault();
        moveRef.current(1);
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        e.preventDefault();
        softDropRef.current();
      } else if (k === 'ArrowUp' || k === 'x' || k === 'X') {
        e.preventDefault();
        rotateRef.current();
      } else if (k === ' ') {
        e.preventDefault();
        hardDropRef.current();
      } else if (k === 'p' || k === 'P') {
        togglePauseRef.current();
      }
    };
    const onBlur = () => {
      if (phaseRef.current === 'playing') setPhase('paused');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // ---------- merged display grid (locked cells + falling piece) ----------
  const display = boardView.map((r) => [...r]);
  if (curView && (phase === 'playing' || phase === 'paused')) {
    curView.matrix.forEach((row, r) => {
      row.forEach((v, c) => {
        if (!v) return;
        const y = curView.y + r;
        const x = curView.x + c;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) display[y][x] = curView.color;
      });
    });
  }

  const touchBtn =
    'h-14 min-w-14 px-3 rounded-xl border border-white/10 bg-white/5 text-lg text-orange-300 font-bold active:bg-orange-500/30 active:scale-95 transition touch-none select-none';

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* top bar */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center gap-1 text-xl font-bold text-yellow-300 tabular-nums">
          <Trophy className="w-4 h-4" />
          {best}
        </div>
        {(phase === 'playing' || phase === 'paused') && (
          <button
            onClick={togglePause}
            aria-label={phase === 'playing' ? 'Pause' : 'Resume'}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition"
          >
            {phase === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="flex gap-4 justify-center items-start">
        {/* board */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(255,106,0,0.12)] max-w-[300px] w-full shrink-0">
          <div className="grid grid-cols-10 gap-[2px] bg-black/40 p-2 select-none touch-none">
            {display.flat().map((cell, i) => (
              <div
                key={i}
                className={'aspect-square rounded-[3px] ' + (cell ? '' : 'bg-white/5')}
                style={cell ? { backgroundColor: cell, boxShadow: `0 0 6px ${cell}99` } : undefined}
              />
            ))}
          </div>

          {phase === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
              <Blocks className="w-12 h-12 text-orange-400" />
              <h2 className="text-2xl font-black text-white">Se Fire Tetris</h2>
              <p className="text-sm text-slate-400 max-w-[240px] text-center">
                Stack the falling blocks, clear lines, and chase that Tetris.
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
              >
                <Play className="w-5 h-5" /> Tap Start
              </button>
              <p className="text-xs text-slate-500">Arrows / WASD · Up or X rotates · Space drops</p>
            </div>
          )}

          {phase === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
              <Pause className="w-10 h-10 text-orange-400" />
              <h2 className="text-2xl font-black text-white">Paused</h2>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition active:scale-95"
              >
                <Play className="w-5 h-5" /> Resume
              </button>
            </div>
          )}

          {phase === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-sm">
              <div className="text-5xl">🧱</div>
              <h2 className="text-2xl font-black text-white">Game Over</h2>
              <div className="flex items-center gap-5 text-center">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Score</div>
                  <div className="text-3xl font-black text-orange-400 tabular-nums">{score}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Lines</div>
                  <div className="text-3xl font-black text-amber-300 tabular-nums">{lines}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Best</div>
                  <div className="text-3xl font-black text-yellow-300 tabular-nums">{best}</div>
                </div>
              </div>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
              >
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* side panel */}
        <aside className="w-28 shrink-0 space-y-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Score</div>
            <div className="text-2xl font-black text-orange-400 tabular-nums">{score}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Level</div>
            <div className="text-2xl font-black text-amber-300 tabular-nums">{level}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Lines</div>
            <div className="text-2xl font-black text-slate-200 tabular-nums">{lines}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Next</div>
            {nextView && (
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${nextView.matrix[0].length}, minmax(0,1fr))` }}
              >
                {nextView.matrix.flat().map((v, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[2px]"
                    style={v ? { backgroundColor: nextView.color, boxShadow: `0 0 4px ${nextView.color}99` } : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* touch controls */}
      <div className="grid grid-cols-5 gap-2 mt-4 select-none">
        <button
          className={touchBtn}
          aria-label="Move left"
          onPointerDown={(e) => { e.preventDefault(); moveRef.current(-1); }}
        >
          ◀
        </button>
        <button
          className={touchBtn}
          aria-label="Move right"
          onPointerDown={(e) => { e.preventDefault(); moveRef.current(1); }}
        >
          ▶
        </button>
        <button
          className={touchBtn}
          aria-label="Soft drop"
          onPointerDown={(e) => { e.preventDefault(); softDropRef.current(); }}
        >
          ▼
        </button>
        <button
          className={touchBtn}
          aria-label="Rotate"
          onPointerDown={(e) => { e.preventDefault(); rotateRef.current(); }}
        >
          ⟳
        </button>
        <button
          className={touchBtn + ' text-amber-300'}
          aria-label="Hard drop"
          onPointerDown={(e) => { e.preventDefault(); hardDropRef.current(); }}
        >
          DROP
        </button>
      </div>
    </div>
  );
}

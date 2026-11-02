// Se Fire Number Merge — sliding number puzzle. 4x4 grid, merge to reach the target.
import { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RotateCcw, Crown } from 'lucide-react';

const SIZE = 4;
const BEST_KEY = 'sf2048:best';
const TARGET = 2048;

// ---- pure helpers (outside component) ----

function emptyGrid() {
  return Array(SIZE * SIZE).fill(0);
}

function randomTileValue() {
  return Math.random() < 0.9 ? 2 : 4;
}

// Place one random tile on a random empty cell. Mutates a copy, returns it.
function addRandom(grid) {
  const next = grid.slice();
  const empties = [];
  for (let i = 0; i < next.length; i++) if (next[i] === 0) empties.push(i);
  if (empties.length === 0) return next;
  const cell = empties[Math.floor(Math.random() * empties.length)];
  next[cell] = randomTileValue();
  return next;
}

// Line indices in traversal order for each direction.
function lineIndices(dir) {
  const lines = [];
  for (let r = 0; r < SIZE; r++) {
    const line = [];
    for (let c = 0; c < SIZE; c++) {
      let idx;
      if (dir === 'left') idx = r * SIZE + c;
      else if (dir === 'right') idx = r * SIZE + (SIZE - 1 - c);
      else if (dir === 'up') idx = c * SIZE + r;
      else idx = (SIZE - 1 - c) * SIZE + r; // down
      line.push(idx);
    }
    lines.push(line);
  }
  return lines;
}

// Slide + merge the board. Returns { grid, moved, gained }.
function moveGrid(grid, dir) {
  const next = grid.slice();
  let moved = false;
  let gained = 0;

  for (const line of lineIndices(dir)) {
    const values = line.map((i) => next[i]).filter((v) => v !== 0);
    const merged = [];
    let i = 0;
    while (i < values.length) {
      if (i + 1 < values.length && values[i] === values[i + 1]) {
        const m = values[i] * 2;
        merged.push(m);
        gained += m;
        i += 2;
      } else {
        merged.push(values[i]);
        i += 1;
      }
    }
    while (merged.length < SIZE) merged.push(0);
    line.forEach((cell, k) => {
      if (next[cell] !== merged[k]) moved = true;
      next[cell] = merged[k];
    });
  }

  return { grid: next, moved, gained };
}

function hasWon(grid) {
  return grid.some((v) => v >= TARGET);
}

function hasLost(grid) {
  if (grid.some((v) => v === 0)) return false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r * SIZE + c];
      if (c + 1 < SIZE && grid[r * SIZE + c + 1] === v) return false;
      if (r + 1 < SIZE && grid[(r + 1) * SIZE + c] === v) return false;
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

function saveBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    // ignore
  }
}

// ---- tile styling ----

function tileStyle(v) {
  if (v === 0) return 'bg-white/5';
  const base = 'font-black flex items-center justify-center rounded-lg aspect-square transition-all duration-150 ';
  const textSize = v >= 10000 ? 'text-xl sm:text-2xl' : v >= 1000 ? 'text-2xl sm:text-3xl' : v >= 100 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl';
  const color =
    v === 2 ? 'bg-[#3a3a44] text-slate-200' :
    v === 4 ? 'bg-[#4a4a55] text-slate-100' :
    v === 8 ? 'bg-[#f97316] text-white' :
    v === 16 ? 'bg-[#fb923c] text-white' :
    v === 32 ? 'bg-[#ef4444] text-white' :
    v === 64 ? 'bg-[#dc2626] text-white' :
    v === 128 ? 'bg-[#facc15] text-black' :
    v === 256 ? 'bg-[#fbbf24] text-black' :
    v === 512 ? 'bg-[#f59e0b] text-black' :
    v === 1024 ? 'bg-[#f97316] text-white shadow-[0_0_24px_rgba(249,115,22,0.55)]' :
    v === 2048 ? 'bg-[#fbbf24] text-black shadow-[0_0_32px_rgba(251,191,36,0.8)]' :
    'bg-[#a855f7] text-white shadow-[0_0_28px_rgba(168,85,247,0.6)]';
  return base + textSize + ' ' + color;
}

// ---- component ----

export default function NumberMergeGame() {
  const [grid, setGrid] = useState(() => addRandom(addRandom(emptyGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [over, setOver] = useState(false);
  const touchStart = useRef(null);
  // refs mirror the latest state so rapid moves always compute from fresh data
  const gridRef = useRef(grid);
  const scoreRef = useRef(score);
  const flagsRef = useRef({ over, won, keepPlaying });
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { flagsRef.current = { over, won, keepPlaying }; }, [over, won, keepPlaying]);

  const newGame = useCallback(() => {
    const g = addRandom(addRandom(emptyGrid()));
    gridRef.current = g;
    scoreRef.current = 0;
    setGrid(g);
    setScore(0);
    setWon(false);
    setKeepPlaying(false);
    setOver(false);
  }, []);

  const doMove = useCallback((dir) => {
    const f = flagsRef.current;
    if (f.over) return;
    if (f.won && !f.keepPlaying) return;
    const { grid: next, moved, gained } = moveGrid(gridRef.current, dir);
    if (!moved) return;
    const withTile = addRandom(next);
    gridRef.current = withTile;
    setGrid(withTile);
    const ns = scoreRef.current + gained;
    scoreRef.current = ns;
    setScore(ns);
    setBest((b) => {
      if (ns > b) {
        saveBest(ns);
        return ns;
      }
      return b;
    });
    if (!f.won && hasWon(withTile)) setWon(true);
    if (hasLost(withTile)) setOver(true);
  }, []);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        if (e.key.startsWith('Arrow')) e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  // touch controls
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
  };

  const showWin = won && !keepPlaying && !over;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      {/* header row */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex gap-2">
          <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-center min-w-[88px]">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Score</div>
            <div className="text-xl font-black text-orange-300">{score.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-center min-w-[88px]">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" /> Best
            </div>
            <div className="text-xl font-black text-yellow-300">{best.toLocaleString()}</div>
          </div>
        </div>
        <button
          onClick={newGame}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25 transition active:scale-95 text-sm"
        >
          <RotateCcw className="w-4 h-4" /> New Game
        </button>
      </div>

      {/* board */}
      <div className="relative">
        <div
          className="grid grid-cols-4 gap-2 max-w-[420px] mx-auto select-none"
          style={{ touchAction: 'none' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {grid.map((v, i) => (
            <div key={i} className={tileStyle(v)}>
              {v > 0 ? v.toLocaleString() : ''}
            </div>
          ))}
        </div>

        {/* win overlay */}
        {showWin && (
          <div className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center px-6">
            <Crown className="w-10 h-10 text-yellow-300" />
            <div className="text-3xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              You reached the target!
            </div>
            <p className="text-slate-400 text-sm">Legend status achieved. Keep merging for the ultimate score.</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setKeepPlaying(true)}
                className="px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition active:scale-95 text-sm"
              >
                Keep Going
              </button>
              <button
                onClick={newGame}
                className="px-6 py-2.5 rounded-full font-bold text-slate-200 border border-white/20 hover:border-white/40 transition active:scale-95 text-sm"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {/* game over overlay */}
        {over && (
          <div className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="text-3xl font-black text-slate-100">No moves left</div>
            <p className="text-slate-400 text-sm">
              Final score: <span className="text-orange-300 font-bold">{score.toLocaleString()}</span>
            </p>
            <button
              onClick={newGame}
              className="mt-1 px-6 py-2.5 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition active:scale-95 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-500 mt-5">
        Arrow keys / WASD on desktop — swipe on mobile. Combine matching tiles to double them.
      </p>
    </div>
  );
}

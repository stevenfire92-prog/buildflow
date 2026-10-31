// Se Fire Snake — modern canvas snake with obstacles, levels, golden orbs.
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Pause, Play, RotateCcw, Trophy } from 'lucide-react';

const GRID = 20;
const CELL = 20;
const SIZE = GRID * CELL;
const BEST_KEY = 'sfsnake:best';
const START_SPEED = 130;
const MIN_SPEED = 70;

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function loadBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

function randomFreeCell(snake, obstacles, food) {
  for (let tries = 0; tries < 400; tries++) {
    const c = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (snake.some((s) => s.x === c.x && s.y === c.y)) continue;
    if (obstacles.some((o) => o.x === c.x && o.y === c.y)) continue;
    if (food && food.x === c.x && food.y === c.y) continue;
    return c;
  }
  return null;
}

function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const game = useRef(null); // mutable game state
  const statusRef = useRef('idle');

  const [status, setStatus] = useState('idle'); // idle | playing | paused | over
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(loadBest);
  const [speedMs, setSpeedMs] = useState(START_SPEED);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ---------- drawing ----------
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !game.current) return;
    const ctx = canvas.getContext('2d');
    const g = game.current;
    const now = Date.now();

    // background
    ctx.fillStyle = '#0d0d15';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(SIZE, i * CELL);
      ctx.stroke();
    }

    // obstacles — dark stone blocks
    for (const o of g.obstacles) {
      const x = o.x * CELL + 2, y = o.y * CELL + 2, s = CELL - 4;
      ctx.fillStyle = '#2b2f3a';
      roundRectPath(ctx, x, y, s, s, 4);
      ctx.fill();
      ctx.strokeStyle = '#4b5265';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#1d2029';
      roundRectPath(ctx, x + 3, y + 3, s - 6, s - 6, 2.5);
      ctx.fill();
    }

    // food
    if (g.food) {
      const fx = g.food.x * CELL + CELL / 2;
      const fy = g.food.y * CELL + CELL / 2;
      const r = CELL / 2 - 3;
      const golden = g.food.type === 'golden';
      const grad = ctx.createRadialGradient(fx - r / 3, fy - r / 3, r / 6, fx, fy, r);
      if (golden) {
        grad.addColorStop(0, '#fff3c4');
        grad.addColorStop(0.5, '#ffd34d');
        grad.addColorStop(1, '#ff9800');
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
      } else {
        grad.addColorStop(0, '#ffb25e');
        grad.addColorStop(0.5, '#ff6a00');
        grad.addColorStop(1, '#cc2e00');
        ctx.shadowColor = '#ff6a00';
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // sparkles on the golden orb
      if (golden) {
        ctx.strokeStyle = 'rgba(255,235,150,0.95)';
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) {
          const ang = (now / 600) * Math.PI * 2 + (i * Math.PI) / 2;
          const sr = r + 5;
          const sx = fx + Math.cos(ang) * sr;
          const sy = fy + Math.sin(ang) * sr;
          ctx.beginPath();
          ctx.moveTo(sx - 3, sy);
          ctx.lineTo(sx + 3, sy);
          ctx.moveTo(sx, sy - 3);
          ctx.lineTo(sx, sy + 3);
          ctx.stroke();
        }
      }
    }

    // snake — orange gradient, rounded segments
    const n = g.snake.length;
    for (let i = n - 1; i >= 0; i--) {
      const seg = g.snake[i];
      const t = n <= 1 ? 0 : i / (n - 1); // 0 = head, 1 = tail
      const red = Math.round(255 - t * 80);
      const green = Math.round(123 - t * 70);
      const blue = Math.round(28 - t * 18);
      ctx.fillStyle = `rgb(${red},${green},${blue})`;
      const pad = i === 0 ? 1 : 2;
      const x = seg.x * CELL + pad, y = seg.y * CELL + pad, s = CELL - pad * 2;
      roundRectPath(ctx, x, y, s, s, i === 0 ? 7 : 5);
      ctx.fill();
      if (i === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        roundRectPath(ctx, x + 2, y + 2, s - 4, s / 2.4, 4);
        ctx.fill();
      }
    }

    // eyes on the head
    const head = g.snake[0];
    if (head) {
      const hx = head.x * CELL + CELL / 2;
      const hy = head.y * CELL + CELL / 2;
      const d = g.dir;
      const perpX = -d.y, perpY = d.x;
      const off = 4.5, fwd = 4;
      for (const sign of [-1, 1]) {
        const ex = hx + d.x * fwd + perpX * off * sign;
        const ey = hy + d.y * fwd + perpY * off * sign;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex, ey, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(ex + d.x * 1.4, ey + d.y * 1.4, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // ---------- game logic ----------
  const syncStats = (g) => {
    const lvl = Math.floor(g.score / 5) + 1;
    const spd = Math.max(MIN_SPEED, START_SPEED - 4 * Math.floor(g.foods / 3));
    setScore(g.score);
    setLevel(lvl);
    setSpeedMs(spd);
    // obstacles: 1 per 5 points, max 12
    const target = Math.min(12, Math.floor(g.score / 5));
    while (g.obstacles.length < target) {
      const c = randomFreeCell(g.snake, g.obstacles, g.food);
      if (!c) break;
      g.obstacles.push(c);
    }
  };

  const placeFood = (g) => {
    const golden = Math.random() < 0.12; // ~1 in 8
    const c = randomFreeCell(g.snake, g.obstacles, null);
    g.food = c ? { x: c.x, y: c.y, type: golden ? 'golden' : 'normal' } : null;
  };

  const endGame = () => {
    const g = game.current;
    if (!g || statusRef.current === 'over') return;
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
    setStatus('over');
  };

  const tick = () => {
    const g = game.current;
    if (!g || statusRef.current !== 'playing') return;

    // apply queued direction (skip 180° reversals)
    while (g.queue.length) {
      const d = g.queue.shift();
      if (d.x !== -g.dir.x || d.y !== -g.dir.y) {
        g.dir = d;
        break;
      }
    }

    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

    // wall / obstacle / self collisions
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
      endGame();
      return;
    }
    if (g.obstacles.some((o) => o.x === head.x && o.y === head.y)) {
      endGame();
      return;
    }
    if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    g.snake.unshift(head);

    // eat food
    if (g.food && head.x === g.food.x && head.y === g.food.y) {
      const golden = g.food.type === 'golden';
      g.score += golden ? 5 : 1;
      g.foods += 1;
      g.grow += golden ? 2 : 1;
      placeFood(g);
      syncStats(g);
    }

    if (g.grow > 0) {
      g.grow -= 1;
    } else {
      g.snake.pop();
    }

    draw();
  };

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const enqueue = (dir) => {
    const g = game.current;
    if (!g || statusRef.current !== 'playing') return;
    const last = g.queue[g.queue.length - 1] || g.dir;
    if ((dir.x !== -last.x || dir.y !== -last.y) && (dir.x !== last.x || dir.y !== last.y)) {
      if (g.queue.length < 3) g.queue.push(dir);
    }
  };

  const newGame = () => {
    const snake = [
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ];
    const g = {
      snake,
      dir: DIRS.right,
      queue: [],
      obstacles: [],
      food: null,
      foods: 0,
      grow: 0,
      score: 0,
    };
    placeFood(g);
    game.current = g;
    setScore(0);
    setLevel(1);
    setSpeedMs(START_SPEED);
    draw();
  };

  const startGame = () => {
    newGame();
    setStatus('playing');
  };

  const togglePause = () => {
    if (statusRef.current === 'playing') setStatus('paused');
    else if (statusRef.current === 'paused') setStatus('playing');
  };

  // ---------- tick loop ----------
  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => tickRef.current(), speedMs);
    return () => clearInterval(id);
  }, [status, speedMs]);

  // ---------- keyboard + blur listeners ----------
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      let dir = null;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') dir = DIRS.up;
      else if (k === 'ArrowDown' || k === 's' || k === 'S') dir = DIRS.down;
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') dir = DIRS.left;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') dir = DIRS.right;
      else if (k === ' ') {
        e.preventDefault();
        if (statusRef.current === 'playing') setStatus('paused');
        else if (statusRef.current === 'paused') setStatus('playing');
        return;
      } else {
        return;
      }
      e.preventDefault();
      if (statusRef.current === 'idle') {
        // first move starts the game
        newGameRef.current();
        setStatus('playing');
        enqueueRef.current(dir);
      } else {
        enqueue(dir);
      }
    };
    const onBlur = () => {
      if (statusRef.current === 'playing') setStatus('paused');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // refs for use inside listeners
  const newGameRef = useRef(newGame);
  newGameRef.current = newGame;
  const enqueueRef = useRef(enqueue);
  enqueueRef.current = enqueue;

  // initial static board behind the start overlay
  useEffect(() => {
    newGameRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dpad = [
    { label: '', dir: null },
    { label: '▲', dir: DIRS.up },
    { label: '', dir: null },
    { label: '◀', dir: DIRS.left },
    { label: '▼', dir: DIRS.down },
    { label: '▶', dir: DIRS.right },
  ];

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* score bar */}
      <div className="flex items-center justify-between gap-2 mb-3 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Score</div>
            <div className="text-2xl font-black text-orange-400 tabular-nums">{score}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Level</div>
            <div className="text-2xl font-black text-amber-300 tabular-nums">{level}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Best</div>
            <div className="flex items-center gap-1 text-xl font-bold text-yellow-300 tabular-nums">
              <Trophy className="w-4 h-4" />
              {best}
            </div>
          </div>
        </div>
        {(status === 'playing' || status === 'paused') && (
          <button
            onClick={togglePause}
            aria-label={status === 'playing' ? 'Pause' : 'Resume'}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition"
          >
            {status === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* board */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(255,106,0,0.12)]">
        <canvas ref={canvasRef} width={SIZE} height={SIZE} className="w-full block select-none touch-none" />

        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
            <div className="text-5xl">🐍</div>
            <h2 className="text-2xl font-black text-white">Se Fire Snake</h2>
            <p className="text-sm text-slate-400 max-w-[260px] text-center">
              Eat fire orbs, dodge the stone, grab golden orbs for bonus points.
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Start Game
            </button>
            <p className="text-xs text-slate-500">Arrows / WASD · or use the d-pad below</p>
          </div>
        )}

        {status === 'paused' && (
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

        {status === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-sm">
            <div className="text-5xl">💀</div>
            <h2 className="text-2xl font-black text-white">Game Over</h2>
            <div className="flex items-center gap-5 text-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Score</div>
                <div className="text-3xl font-black text-orange-400 tabular-nums">{score}</div>
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

      {/* touch d-pad */}
      <div className="grid grid-cols-3 gap-2 w-44 mx-auto mt-4 select-none">
        {dpad.map((b, i) =>
          b.dir ? (
            <button
              key={i}
              onPointerDown={(e) => {
                e.preventDefault();
                if (statusRef.current === 'idle') {
                  newGameRef.current();
                  setStatus('playing');
                }
                enqueueRef.current(b.dir);
              }}
              className="h-14 rounded-xl border border-white/10 bg-white/5 text-xl text-orange-300 font-bold active:bg-orange-500/30 active:scale-95 transition touch-none"
              aria-label={`Move ${b.label}`}
            >
              {b.label}
            </button>
          ) : (
            <div key={i} className="h-14" />
          )
        )}
      </div>
    </div>
  );
}

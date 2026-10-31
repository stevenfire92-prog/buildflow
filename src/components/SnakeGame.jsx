import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SIZE = 400;
const CELL = 20;
const CELLS = SIZE / CELL;
const TICK_MS = 120;
const BEST_KEY = 'sfgames:snake:best';

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

function getBest() {
  try {
    const v = parseInt(localStorage.getItem(BEST_KEY), 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}

function randomFood(snake) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`));
  let p;
  do {
    p = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) };
  } while (taken.has(`${p.x},${p.y}`));
  return p;
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(getBest);
  const [gameOver, setGameOver] = useState(false);
  const bestRef = useRef(getBest());
  const stateRef = useRef(null);

  const initState = useCallback(() => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    stateRef.current = {
      snake,
      dir: 'right',
      queuedDir: 'right',
      food: randomFood(snake),
      score: 0,
      dead: false,
    };
  }, []);

  const step = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    s.dir = s.queuedDir;
    const d = DIRS[s.dir];
    const head = { x: s.snake[0].x + d.x, y: s.snake[0].y + d.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS;
    const hitSelf = s.snake.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y);
    if (hitWall || hitSelf) {
      s.dead = true;
      setRunning(false);
      setGameOver(true);
      const finalScore = s.score;
      if (finalScore > bestRef.current) {
        bestRef.current = finalScore;
        try {
          localStorage.setItem(BEST_KEY, String(finalScore));
        } catch { /* storage unavailable */ }
        setBest(finalScore);
        toast.success(`🏆 New high score: ${finalScore}!`);
      } else {
        toast.error(`Game over — score: ${finalScore}`);
      }
      draw();
      return;
    }

    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 1;
      setScore(s.score);
      s.food = randomFood(s.snake);
    } else {
      s.snake.pop();
    }
    draw();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0c0c0c';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CELLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    // food
    const fg = ctx.createRadialGradient(
      s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, 2,
      s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL
    );
    fg.addColorStop(0, '#ffedd5');
    fg.addColorStop(0.5, '#fb923c');
    fg.addColorStop(1, '#dc2626');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // snake
    s.snake.forEach((seg, i) => {
      const grad = ctx.createLinearGradient(seg.x * CELL, seg.y * CELL, seg.x * CELL + CELL, seg.y * CELL + CELL);
      if (i === 0) {
        grad.addColorStop(0, '#fed7aa');
        grad.addColorStop(1, '#f97316');
      } else {
        grad.addColorStop(0, '#fb923c');
        grad.addColorStop(1, '#c2410c');
      }
      ctx.fillStyle = grad;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 5);
      ctx.fill();
      if (i === 0) {
        ctx.fillStyle = '#0c0c0c';
        const d = DIRS[s.dir];
        const cx = seg.x * CELL + CELL / 2;
        const cy = seg.y * CELL + CELL / 2;
        const ex = d.y !== 0 ? 4 : 6;
        const ey = d.x !== 0 ? 4 : 6;
        const ox = d.x * 3;
        const oy = d.y * 3;
        ctx.beginPath();
        ctx.arc(cx - ex + ox, cy - ey + oy, 2.2, 0, Math.PI * 2);
        ctx.arc(cx + ex + ox, cy + ey + oy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  // game loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(step, TICK_MS);
    return () => clearInterval(id);
  }, [running, step]);

  // initial draw
  useEffect(() => {
    if (!stateRef.current) initState();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeDir = useCallback((dir) => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (OPPOSITE[dir] !== s.dir && OPPOSITE[dir] !== s.queuedDir) {
      s.queuedDir = dir;
    }
  }, []);

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.toLowerCase();
      const map = {
        arrowup: 'up', w: 'up',
        arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left',
        arrowright: 'right', d: 'right',
      };
      const dir = map[key];
      if (dir) {
        e.preventDefault();
        changeDir(dir);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [changeDir]);

  const start = () => {
    initState();
    setScore(0);
    setGameOver(false);
    setRunning(true);
    draw();
  };

  const dpadBtn =
    'w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 active:bg-orange-600/30 touch-none select-none';

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4">
          <div className="text-white/80 font-semibold">Score: <span className="text-orange-400">{score}</span></div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Best: {best}</span>
          </div>
        </div>
        <button
          onClick={start}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors"
        >
          {gameOver || score > 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {gameOver ? 'Play Again' : score > 0 ? 'Restart' : 'Start'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="relative rounded-xl overflow-hidden border border-orange-500/20" style={{ maxWidth: '100%' }}>
          <canvas ref={canvasRef} width={SIZE} height={SIZE} className="w-full max-w-[400px] h-auto block" />
          {!running && !gameOver && score === 0 && (
            <button
              onClick={start}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white cursor-pointer"
            >
              <Play className="w-12 h-12 text-orange-400" />
              <span className="font-semibold">Tap to start</span>
              <span className="text-xs text-white/60">Arrow keys / WASD or d-pad</span>
            </button>
          )}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
              <div className="text-2xl font-bold text-red-400">Game Over</div>
              <div className="text-white/70">Score: <span className="text-orange-400 font-bold">{score}</span></div>
              <button
                onClick={start}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* d-pad */}
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button className={dpadBtn} onPointerDown={() => changeDir('up')} aria-label="move up">
            <ChevronUp className="w-7 h-7" />
          </button>
          <div />
          <button className={dpadBtn} onPointerDown={() => changeDir('left')} aria-label="move left">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button className={dpadBtn} onPointerDown={() => changeDir('down')} aria-label="move down">
            <ChevronDown className="w-7 h-7" />
          </button>
          <button className={dpadBtn} onPointerDown={() => changeDir('right')} aria-label="move right">
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

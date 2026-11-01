// Se Fire Stack — timing-based tower stacker. Tap to drop each sliding block.
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Trophy } from 'lucide-react';

const W = 400;
const H = 600;
const BLOCK_H = 26;
const BASE_W = 220;
const BASE_Y = H - 70; // y of base block top
const BEST_KEY = 'sfstack:best';
const PERFECT_TOLERANCE = 6;

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

function blockColor(i) {
  return `hsl(${16 + ((i * 5) % 40)}, 88%, ${58 - ((i % 6) * 2)}%)`;
}

function blockEdge(i) {
  return `hsl(${16 + ((i * 5) % 40)}, 88%, ${Math.max(24, 44 - ((i % 6) * 2))}%)`;
}

export default function StackGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  // mutable game state
  const towerRef = useRef([]); // [{x, w}]
  const moverRef = useRef({ x: 0, w: BASE_W, dir: 1 });
  const camYRef = useRef(0);
  const streakRef = useRef(0);
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const phaseRef = useRef('ready');

  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [streak, setStreak] = useState(0);

  const scoreRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---------- drawing ----------
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tower = towerRef.current;
    const mover = moverRef.current;
    const camY = camYRef.current;

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0d0d15');
    bg.addColorStop(1, '#141019');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // subtle vertical guides
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // tower blocks
    for (let i = 0; i < tower.length; i++) {
      const b = tower[i];
      const y = BASE_Y - i * BLOCK_H + camY;
      if (y < -BLOCK_H || y > H + BLOCK_H) continue;
      ctx.fillStyle = blockColor(i);
      roundRectPath(ctx, b.x, y, b.w, BLOCK_H - 3, 6);
      ctx.fill();
      // darker top edge highlight for depth
      ctx.fillStyle = blockEdge(i);
      roundRectPath(ctx, b.x, y + BLOCK_H - 8, b.w, 5, 2);
      ctx.fill();
      // perfect-drop glint on top of tower
      if (i === tower.length - 1 && streakRef.current > 0) {
        ctx.fillStyle = 'rgba(255, 220, 130, 0.85)';
        ctx.fillRect(b.x + 4, y + 2, Math.max(0, b.w - 8), 2);
      }
    }

    // moving block (glow)
    if (phaseRef.current !== 'over') {
      const my = BASE_Y - tower.length * BLOCK_H + camY;
      const mi = tower.length;
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = blockColor(mi);
      ctx.fillStyle = blockColor(mi);
      roundRectPath(ctx, mover.x, my, mover.w, BLOCK_H - 3, 6);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = blockEdge(mi);
      roundRectPath(ctx, mover.x, my + BLOCK_H - 8, mover.w, 5, 2);
      ctx.fill();
    }

    // canvas HUD
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${scoreRef.current}`, 12, 24);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 200, 90, 0.95)';
    ctx.fillText(`Streak ×${streakRef.current}`, W - 12, 24);
    ctx.textAlign = 'left';

    // overlays
    if (phaseRef.current === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '900 30px system-ui, sans-serif';
      ctx.fillText('🏗️', W / 2, H / 2 - 56);
      ctx.fillText('TAP TO START', W / 2, H / 2 - 16);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '500 15px system-ui, sans-serif';
      ctx.fillText('Tap, click, or press Space', W / 2, H / 2 + 14);
      ctx.fillText('to drop the sliding block', W / 2, H / 2 + 36);
      ctx.textAlign = 'left';
    } else if (phaseRef.current === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '900 30px system-ui, sans-serif';
      ctx.fillText('TOWER TOPPLED', W / 2, H / 2 - 24);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '500 16px system-ui, sans-serif';
      ctx.fillText(`Score ${scoreRef.current}`, W / 2, H / 2 + 8);
      const b = loadBest();
      ctx.fillStyle = '#ffd257';
      ctx.fillText(`Best ${b}`, W / 2, H / 2 + 32);
      ctx.textAlign = 'left';
    }
  };

  // ---------- game logic ----------
  const spawnMover = (w) => {
    const fromLeft = Math.random() < 0.5;
    moverRef.current = fromLeft
      ? { x: 0, w, dir: 1 }
      : { x: W - w, w, dir: -1 };
  };

  const resetGame = () => {
    towerRef.current = [{ x: (W - BASE_W) / 2, w: BASE_W }];
    spawnMover(BASE_W);
    camYRef.current = 0;
    streakRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setPhase('ready');
    draw();
  };

  const startLoop = () => {
    lastTRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const deltaMs = Math.min(50, now - lastTRef.current);
      lastTRef.current = now;
      const dt = deltaMs / 16.667; // frames

      if (phaseRef.current === 'playing' || phaseRef.current === 'ready') {
        const tower = towerRef.current;
        const mover = moverRef.current;
        const speed = Math.min(7, 2.2 + tower.length * 0.22);
        mover.x += mover.dir * speed * dt;
        if (mover.x <= 0) {
          mover.x = 0;
          mover.dir = 1;
        } else if (mover.x >= W - mover.w) {
          mover.x = W - mover.w;
          mover.dir = -1;
        }

        // camera: keep the top of the tower visible
        const target = Math.max(0, tower.length * BLOCK_H - H * 0.52);
        camYRef.current += (target - camYRef.current) * Math.min(1, dt * 0.08);
        if (Math.abs(target - camYRef.current) < 0.5) camYRef.current = target;

        draw();
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const drop = () => {
    if (phaseRef.current === 'ready') {
      setPhase('playing');
      startLoop();
      return;
    }
    if (phaseRef.current !== 'playing') return;

    const tower = towerRef.current;
    const mover = moverRef.current;
    const prev = tower[tower.length - 1];

    const newX = Math.max(mover.x, prev.x);
    const newW = Math.min(mover.x + mover.w, prev.x + prev.w) - newX;

    if (newW <= 0) {
      // game over
      setPhase('over');
      cancelAnimationFrame(rafRef.current);
      const finalScore = scoreRef.current;
      const prevBest = loadBest();
      if (finalScore > prevBest) {
        saveBest(finalScore);
        setBest(finalScore);
        toast.success(`🔥 New best: ${finalScore}!`);
      } else {
        setBest(prevBest);
      }
      draw();
      return;
    }

    if (Math.abs(mover.x - prev.x) < PERFECT_TOLERANCE) {
      // perfect drop — keep full width
      tower.push({ x: prev.x, w: prev.w });
      streakRef.current += 1;
      scoreRef.current += 1 + 2;
      setStreak(streakRef.current);
      if (streakRef.current >= 3) toast(`🔥 Perfect ×${streakRef.current}!`);
      spawnMover(prev.w);
    } else {
      tower.push({ x: newX, w: newW });
      streakRef.current = 0;
      scoreRef.current += 1;
      setStreak(0);
      spawnMover(newW);
    }
    setScore(scoreRef.current);
  };

  const dropRef = useRef(drop);
  dropRef.current = drop;

  // Space key
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        dropRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // init
  useEffect(() => {
    resetGame();
    startLoop();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bestPill = best > 0;

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-bold">
          Score <span className="text-white tabular-nums">{score}</span>
        </div>
        {bestPill && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-semibold">
            <Trophy className="w-4 h-4" />
            Best: {best}
          </div>
        )}
      </div>

      {/* game area — tap to drop */}
      <div
        ref={wrapRef}
        onPointerDown={() => dropRef.current()}
        className="relative rounded-2xl overflow-hidden border border-white/10 select-none cursor-pointer"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full h-auto"
          style={{ aspectRatio: '400 / 600' }}
        />

        {/* HTML restart button for touch */}
        {phase === 'over' && (
          <div className="absolute bottom-8 inset-x-0 flex justify-center">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-slate-500 text-xs mt-3">
        Tap anywhere on the game, click, or press <span className="text-slate-300 font-semibold">Space</span> to drop the block.
      </p>
    </div>
  );
}

// Se Fire Breaker — canvas brick breaker game.
// Paddle: mouse move, touch drag, ArrowLeft/ArrowRight (A/D).
// Power-ups: W (wide paddle), M (multi-ball), S (slow ball), + (extra life).
import { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const W = 480;
const H = 600;
const BEST_KEY = 'sfbreaker:best';
const COLS = 8;
const ROW_COLORS = ['#fb923c', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#ea580c', '#f59e0b', '#fbbf24'];
const POWER_COLORS = { W: '#22d3ee', M: '#a78bfa', S: '#34d399', '+': '#fbbf24' };

function loadBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function makeBricks(level) {
  const rows = Math.min(4 + (level - 1), 8);
  const gap = 6;
  const sidePad = 14;
  const bw = (W - sidePad * 2 - gap * (COLS - 1)) / COLS;
  const bh = 24;
  const top = 78;
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      // ~25% of bricks are 2-hit (more in deeper rows)
      const tough = (r + c * 2) % 4 === 0 || (r >= rows - 2 && (r * 7 + c * 3) % 5 === 0);
      bricks.push({
        x: sidePad + c * (bw + gap),
        y: top + r * (bh + gap),
        w: bw,
        h: bh,
        hp: tough ? 2 : 1,
        maxHp: tough ? 2 : 1,
        color: ROW_COLORS[r % ROW_COLORS.length],
      });
    }
  }
  return bricks;
}

function serveBall(g) {
  g.balls = [
    { x: g.paddleX, y: H - 52, vx: 0, vy: 0, held: true, trail: [] },
  ];
}

export default function BreakerGame() {
  const canvasRef = useRef(null);
  const g = useRef(null);
  const [hud, setHud] = useState({ status: 'ready', score: 0, lives: 3, level: 1, best: loadBest() });
  const [newBest, setNewBest] = useState(false);
  const hudRef = useRef(hud);
  hudRef.current = hud;

  // ---- init game state once ----
  if (!g.current) {
    g.current = {
      paddleX: W / 2,
      paddleW: 90,
      basePaddleW: 90,
      wideUntil: 0,
      slowUntil: 0,
      balls: [],
      bricks: makeBricks(1),
      powerups: [],
      keys: { left: false, right: false },
      status: 'ready',
      score: 0,
      lives: 3,
      level: 1,
      newBestToasted: false,
    };
    serveBall(g.current);
  }

  const syncHud = useCallback(() => {
    const st = g.current;
    setHud((prev) => {
      const next = { status: st.status, score: st.score, lives: st.lives, level: st.level, best: prev.best };
      if (next.status === prev.status && next.score === prev.score && next.lives === prev.lives && next.level === prev.level) return prev;
      return next;
    });
  }, []);

  const ballSpeed = (st) => {
    const base = 5 + (st.level - 1) * 0.7;
    return performance.now() < st.slowUntil ? base * 0.65 : base;
  };

  const launch = useCallback(() => {
    const st = g.current;
    if (st.status !== 'playing') return;
    const held = st.balls.find((b) => b.held);
    if (!held) return;
    const speed = ballSpeed(st);
    const ang = (Math.random() * 50 - 25) * (Math.PI / 180); // slight random angle
    held.vx = speed * Math.sin(ang);
    held.vy = -speed * Math.cos(ang);
    held.held = false;
  }, []);

  const startGame = useCallback(() => {
    const st = g.current;
    if (st.status === 'ready') {
      st.status = 'playing';
      syncHud();
    } else if (st.status === 'playing' && st.balls.some((b) => b.held)) {
      launch();
    } else if (st.status === 'paused') {
      st.status = 'playing';
      syncHud();
    }
  }, [launch, syncHud]);

  const resetRun = useCallback(() => {
    const st = g.current;
    st.level = 1;
    st.score = 0;
    st.lives = 3;
    st.bricks = makeBricks(1);
    st.powerups = [];
    st.wideUntil = 0;
    st.slowUntil = 0;
    st.paddleW = st.basePaddleW;
    st.paddleX = W / 2;
    st.status = 'playing';
    st.newBestToasted = false;
    setNewBest(false);
    serveBall(st);
    syncHud();
  }, [syncHud]);

  const gameOver = useCallback(() => {
    const st = g.current;
    st.status = 'over';
    const prevBest = loadBest();
    if (st.score > prevBest) {
      try { localStorage.setItem(BEST_KEY, String(st.score)); } catch { /* ignore */ }
      setHud((p) => ({ ...p, best: st.score }));
      setNewBest(true);
      if (!st.newBestToasted) {
        st.newBestToasted = true;
        toast.success(`New best score: ${st.score.toLocaleString()}!`);
      }
    }
    syncHud();
  }, [syncHud]);

  const nextLevel = useCallback(() => {
    const st = g.current;
    st.level += 1;
    st.bricks = makeBricks(st.level);
    st.powerups = [];
    st.wideUntil = 0;
    st.slowUntil = 0;
    st.paddleW = st.basePaddleW;
    serveBall(st);
    toast.success(`Level ${st.level} — +1 row, faster ball!`);
    syncHud();
  }, [syncHud]);

  const applyPowerup = useCallback((kind) => {
    const st = g.current;
    const now = performance.now();
    if (kind === 'W') {
      st.paddleW = st.basePaddleW * 1.55;
      st.wideUntil = now + 12000;
      toast.info('Wide paddle!');
    } else if (kind === 'M') {
      const src = st.balls.filter((b) => !b.held);
      const origin = src[0] || st.balls[0];
      if (origin) {
        const speed = ballSpeed(st);
        st.balls = [origin];
        for (const deg of [-30, 30]) {
          const ang = Math.atan2(origin.vy || -1, origin.vx || 0) + (deg * Math.PI) / 180;
          st.balls.push({
            x: origin.x, y: origin.y,
            vx: speed * Math.cos(ang),
            vy: speed * Math.sin(ang),
            held: false, trail: [],
          });
        }
        toast.info('Multi-ball!');
      }
    } else if (kind === 'S') {
      st.slowUntil = now + 10000;
      toast.info('Slow ball!');
    } else if (kind === '+') {
      st.lives += 1;
      toast.success('Extra life!');
    }
    syncHud();
  }, [syncHud]);

  // ---- physics update ----
  const update = useCallback(() => {
    const st = g.current;
    const now = performance.now();
    if (now > st.wideUntil && st.paddleW !== st.basePaddleW) st.paddleW = st.basePaddleW;

    // paddle keyboard movement
    const kspeed = 8;
    if (st.keys.left) st.paddleX -= kspeed;
    if (st.keys.right) st.paddleX += kspeed;
    st.paddleX = Math.max(st.paddleW / 2 + 4, Math.min(W - st.paddleW / 2 - 4, st.paddleX));

    const paddleY = H - 34;
    const paddleH = 14;

    // power-ups fall
    for (const p of st.powerups) {
      p.y += p.vy;
      p.rot += 0.06;
      if (
        p.y + 12 >= paddleY && p.y - 12 <= paddleY + paddleH &&
        p.x >= st.paddleX - st.paddleW / 2 - 8 && p.x <= st.paddleX + st.paddleW / 2 + 8
      ) {
        p.caught = true;
        applyPowerup(p.kind);
      }
    }
    st.powerups = st.powerups.filter((p) => !p.caught && p.y < H + 30);

    // balls
    const speed = ballSpeed(st);
    const nextBalls = [];
    for (const b of st.balls) {
      if (b.held) {
        b.x = st.paddleX;
        b.y = paddleY - 12;
        nextBalls.push(b);
        continue;
      }
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 12) b.trail.shift();

      b.x += b.vx;
      b.y += b.vy;

      // walls
      if (b.x < 8) { b.x = 8; b.vx = Math.abs(b.vx); }
      if (b.x > W - 8) { b.x = W - 8; b.vx = -Math.abs(b.vx); }
      if (b.y < 8) { b.y = 8; b.vy = Math.abs(b.vy); }

      // paddle — angle depends on hit position
      if (
        b.vy > 0 &&
        b.y + 7 >= paddleY && b.y + 7 <= paddleY + paddleH + 6 &&
        b.x >= st.paddleX - st.paddleW / 2 - 7 && b.x <= st.paddleX + st.paddleW / 2 + 7
      ) {
        const rel = Math.max(-1, Math.min(1, (b.x - st.paddleX) / (st.paddleW / 2)));
        const ang = rel * (65 * Math.PI / 180);
        b.vx = speed * Math.sin(ang);
        b.vy = -Math.abs(speed * Math.cos(ang));
        b.y = paddleY - 8;
      }

      // bricks
      for (let i = 0; i < st.bricks.length; i++) {
        const br = st.bricks[i];
        if (b.x + 7 < br.x || b.x - 7 > br.x + br.w || b.y + 7 < br.y || b.y - 7 > br.y + br.h) continue;
        // resolve by minimum penetration axis
        const dxL = b.x + 7 - br.x;
        const dxR = br.x + br.w - (b.x - 7);
        const dyT = b.y + 7 - br.y;
        const dyB = br.y + br.h - (b.y - 7);
        const minX = Math.min(dxL, dxR);
        const minY = Math.min(dyT, dyB);
        if (minX < minY) {
          b.vx = dxL < dxR ? -Math.abs(b.vx) : Math.abs(b.vx);
        } else {
          b.vy = dyT < dyB ? -Math.abs(b.vy) : Math.abs(b.vy);
        }
        br.hp -= 1;
        st.score += 10;
        if (br.hp <= 0) {
          st.bricks.splice(i, 1);
          st.score += 40;
          // 22% chance to drop a power-up
          if (Math.random() < 0.22) {
            const kinds = ['W', 'M', 'S', '+'];
            st.powerups.push({
              x: br.x + br.w / 2,
              y: br.y + br.h / 2,
              vy: 2.4,
              rot: 0,
              kind: kinds[Math.floor(Math.random() * kinds.length)],
              caught: false,
            });
          }
        }
        break;
      }

      if (b.y > H + 20) continue; // lost below paddle
      nextBalls.push(b);
    }
    st.balls = nextBalls;

    // normalize free-ball speed (keeps level speedups consistent)
    for (const b of st.balls) {
      if (b.held) continue;
      const mag = Math.hypot(b.vx, b.vy) || 1;
      b.vx = (b.vx / mag) * speed;
      b.vy = (b.vy / mag) * speed;
      if (Math.abs(b.vy) < speed * 0.25) b.vy = (b.vy < 0 ? -1 : 1) * speed * 0.25; // avoid flat loops
    }

    if (st.balls.length === 0) {
      st.lives -= 1;
      if (st.lives <= 0) {
        gameOver();
      } else {
        serveBall(st);
        toast.error('Ball lost — one life down.');
      }
    } else if (st.bricks.length === 0) {
      nextLevel();
    }
    syncHud();
  }, [applyPowerup, gameOver, nextLevel, syncHud]);

  // ---- render ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const st = g.current;

    // background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
    // subtle starfield
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137) % W;
      const sy = (i * 89) % H;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // HUD strip
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, W, 54);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL ${st.level}`, 16, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`SCORE ${st.score.toLocaleString()}`, 16, 44);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f87171';
    ctx.fillText('♥'.repeat(Math.max(0, st.lives)), W - 16, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`BEST ${hudRef.current.best.toLocaleString()}`, W - 16, 44);

    // bricks — neon glow
    for (const br of st.bricks) {
      ctx.save();
      ctx.shadowColor = br.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = br.color;
      const r = 5;
      ctx.beginPath();
      ctx.roundRect(br.x, br.y, br.w, br.h, r);
      ctx.fill();
      ctx.restore();
      if (br.maxHp === 2) {
        // darker for 2-hit bricks + crack marks when damaged
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.roundRect(br.x, br.y, br.w, br.h, r);
        ctx.fill();
        if (br.hp < br.maxHp) {
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(br.x + br.w * 0.3, br.y + 3);
          ctx.lineTo(br.x + br.w * 0.45, br.y + br.h * 0.5);
          ctx.lineTo(br.x + br.w * 0.35, br.y + br.h - 3);
          ctx.moveTo(br.x + br.w * 0.65, br.y + 4);
          ctx.lineTo(br.x + br.w * 0.6, br.y + br.h * 0.6);
          ctx.stroke();
        }
      }
    }

    // power-up capsules
    for (const p of st.powerups) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(p.rot) * 0.15);
      ctx.shadowColor = POWER_COLORS[p.kind];
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#111118';
      ctx.strokeStyle = POWER_COLORS[p.kind];
      ctx.lineWidth = 2;
      const w = 34, h = 20;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 10);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = POWER_COLORS[p.kind];
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.kind, 0, 1);
      ctx.restore();
    }

    // paddle — orange gradient, glow
    const paddleY = H - 34;
    ctx.save();
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 16;
    const grad = ctx.createLinearGradient(st.paddleX - st.paddleW / 2, 0, st.paddleX + st.paddleW / 2, 0);
    grad.addColorStop(0, '#fb923c');
    grad.addColorStop(0.5, '#f97316');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(st.paddleX - st.paddleW / 2, paddleY, st.paddleW, 14, 7);
    ctx.fill();
    ctx.restore();

    // balls — glowing with trail
    for (const b of st.balls) {
      for (let i = 0; i < b.trail.length; i++) {
        const t = b.trail[i];
        const alpha = (i / b.trail.length) * 0.35;
        ctx.fillStyle = `rgba(251,146,60,${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5 * (i / b.trail.length), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // walls frame
    ctx.strokeStyle = 'rgba(249,115,22,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 58, W - 8, H - 62);
  }, []);

  // ---- main loop + listeners ----
  useEffect(() => {
    const st = g.current;
    let raf = 0;
    const loop = () => {
      if (st.status === 'playing') update();
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const canvas = canvasRef.current;
    const movePaddleTo = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      st.paddleX = Math.max(st.paddleW / 2 + 4, Math.min(W - st.paddleW / 2 - 4, x));
    };

    const onMouseMove = (e) => movePaddleTo(e.clientX);
    const onTouchStart = (e) => { if (e.touches[0]) movePaddleTo(e.touches[0].clientX); };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches[0]) movePaddleTo(e.touches[0].clientX);
    };
    const onCanvasTap = () => startGame();

    const onKeyDown = (e) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === ' ') {
        e.preventDefault();
      }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') st.keys.left = true;
      if (k === 'ArrowRight' || k === 'd' || k === 'D') st.keys.right = true;
      if (k === ' ') {
        if (st.status === 'ready' || st.status === 'paused') startGame();
        else if (st.status === 'playing') launch();
      }
      if (k === 'p' || k === 'P') {
        if (st.status === 'playing') { st.status = 'paused'; syncHud(); }
        else if (st.status === 'paused') { st.status = 'playing'; syncHud(); }
      }
    };
    const onKeyUp = (e) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') st.keys.left = false;
      if (k === 'ArrowRight' || k === 'd' || k === 'D') st.keys.right = false;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('click', onCanvasTap);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onCanvasTap);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [update, draw, startGame, launch, syncHud]);

  const togglePause = () => {
    const st = g.current;
    if (st.status === 'playing') { st.status = 'paused'; syncHud(); }
    else if (st.status === 'paused') { st.status = 'playing'; syncHud(); }
  };

  const { status, score, lives, level, best } = hud;

  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      {/* HUD bar */}
      <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-amber-400">Lv {level}</span>
          <span className="text-slate-200">{score.toLocaleString()} pts</span>
          <span className="text-rose-400">{'♥'.repeat(Math.max(0, lives))}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Trophy className="h-3.5 w-3.5 text-amber-400" /> {best.toLocaleString()}
          </span>
          {(status === 'playing' || status === 'paused') && (
            <button
              onClick={togglePause}
              aria-label={status === 'paused' ? 'Resume' : 'Pause'}
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
            >
              {status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 shadow-[0_0_60px_-15px_rgba(249,115,22,0.4)]">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-auto w-full cursor-pointer touch-none select-none"
        />

        {/* start overlay */}
        {status === 'ready' && (
          <button
            onClick={startGame}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
          >
            <span className="text-5xl">🧱</span>
            <span className="text-2xl font-black text-white">Tap to start</span>
            <span className="max-w-[300px] text-center text-sm text-slate-400">
              Mouse, touch, or ← → / A D to move the paddle. Space launches the ball.
            </span>
          </button>
        )}

        {/* pause overlay */}
        {status === 'paused' && (
          <button
            onClick={togglePause}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm"
          >
            <Play className="h-12 w-12 text-orange-400" />
            <span className="text-xl font-black text-white">Paused — tap to resume</span>
          </button>
        )}

        {/* game over overlay */}
        {status === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center backdrop-blur-sm">
            <span className="text-4xl font-black text-white">Game Over</span>
            <div className="text-slate-300">
              Score <span className="font-black text-amber-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Trophy className="h-4 w-4 text-amber-400" />
              Best <span className="font-bold text-slate-200">{best.toLocaleString()}</span>
              {newBest && <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">NEW!</span>}
            </div>
            <button
              onClick={resetRun}
              className="mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-black text-white shadow-lg shadow-orange-500/30 transition hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-slate-500">
        Catch falling capsules: <span className="font-bold text-cyan-300">W</span> wide ·{' '}
        <span className="font-bold text-violet-300">M</span> multi-ball ·{' '}
        <span className="font-bold text-emerald-300">S</span> slow ·{' '}
        <span className="font-bold text-amber-300">+</span> life
      </p>
    </div>
  );
}

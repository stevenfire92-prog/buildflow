// Se Fire Neon Dash — high-speed neon obstacle dodger.
// Canvas game: steer the glowing orb left/right, dodge falling neon hazards.
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Pause, Zap, Trophy, Flame } from 'lucide-react';

const W = 480;
const H = 720;
const BEST_KEY = 'sfneondash:best';

const NEON = ['#22d3ee', '#f0f', '#a3e635', '#fb7185', '#c084fc', '#fbbf24'];

function loadBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* ignore */
  }
}

export default function NeonDashGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const stateRef = useRef({
    phase: 'ready', // ready | playing | paused | over
    playerX: W / 2,
    targetX: W / 2,
    obstacles: [],
    spawnT: 0,
    elapsed: 0,
    speed: 260,
    score: 0,
    best: loadBest(),
    particles: [],
    flash: 0,
    newBest: false,
  });
  const [, force] = useState(0);

  const rerender = useCallback(() => force((n) => n + 1), []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.phase = 'playing';
    s.playerX = W / 2;
    s.targetX = W / 2;
    s.obstacles = [];
    s.spawnT = 0;
    s.elapsed = 0;
    s.speed = 260;
    s.score = 0;
    s.particles = [];
    s.flash = 0;
    s.newBest = false;
    rerender();
  }, [rerender]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === 'playing') {
      s.phase = 'paused';
      rerender();
    } else if (s.phase === 'paused') {
      s.phase = 'playing';
      rerender();
    }
  }, [rerender]);

  // ---- input: keyboard ----
  useEffect(() => {
    const keys = new Set();
    const STEP = 26;
    const onDown = (e) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.add('L');
        s.targetX = Math.max(30, s.targetX - STEP);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.add('R');
        s.targetX = Math.min(W - 30, s.targetX + STEP);
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (s.phase === 'ready' || s.phase === 'over') startGame();
        e.preventDefault();
      } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };
    const onUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.delete('L');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.delete('R');
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [startGame, togglePause]);

  // ---- input: touch / mouse drag on canvas ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const toGameX = (clientX) => {
      const r = canvas.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * W;
    };
    let dragging = false;
    const move = (clientX) => {
      const s = stateRef.current;
      if (s.phase !== 'playing') return;
      s.targetX = Math.max(30, Math.min(W - 30, toGameX(clientX)));
    };
    const onTouchStart = (e) => {
      dragging = true;
      const s = stateRef.current;
      if (s.phase === 'ready' || s.phase === 'over') startGame();
      else move(e.touches[0].clientX);
    };
    const onTouchMove = (e) => {
      if (dragging) {
        move(e.touches[0].clientX);
        e.preventDefault();
      }
    };
    const onTouchEnd = () => {
      dragging = false;
    };
    const onMouseDown = (e) => {
      dragging = true;
      const s = stateRef.current;
      if (s.phase === 'ready' || s.phase === 'over') startGame();
      else move(e.clientX);
    };
    const onMouseMove = (e) => {
      if (dragging) move(e.clientX);
    };
    const onMouseUp = () => {
      dragging = false;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [startGame]);

  // ---- game loop ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = performance.now();
    let tGlobal = 0;

    const spawnObstacle = (s) => {
      const kind = Math.random() < 0.55 ? 'rect' : 'circle';
      const color = NEON[Math.floor(Math.random() * NEON.length)];
      const size = 22 + Math.random() * 34;
      const x = 30 + Math.random() * (W - 60);
      // Avoid spawning directly on top of the player with no gap early on
      s.obstacles.push({ kind, color, size, x, y: -size - 10, rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 3 });
    };

    const explode = (s) => {
      for (let i = 0; i < 40; i++) {
        s.particles.push({
          x: s.playerX,
          y: H - 90,
          vx: (Math.random() - 0.5) * 420,
          vy: (Math.random() - 0.5) * 420,
          life: 0.9,
          color: NEON[Math.floor(Math.random() * NEON.length)],
        });
      }
      s.flash = 1;
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tGlobal += dt;
      const s = stateRef.current;

      // --- update ---
      if (s.phase === 'playing') {
        s.elapsed += dt;
        s.score = Math.floor(s.elapsed);
        // speed ramps up over time
        s.speed = 260 + s.elapsed * 14;
        // ease player toward target
        const dx = s.targetX - s.playerX;
        s.playerX += dx * Math.min(1, dt * 14);

        // spawn
        s.spawnT -= dt;
        const interval = Math.max(0.22, 0.75 - s.elapsed * 0.008);
        if (s.spawnT <= 0) {
          spawnObstacle(s);
          // occasionally a second one at higher difficulty
          if (s.elapsed > 20 && Math.random() < 0.45) spawnObstacle(s);
          s.spawnT = interval;
        }

        // move obstacles
        for (const o of s.obstacles) {
          o.y += s.speed * dt;
          o.rot += o.spin * dt;
        }
        s.obstacles = s.obstacles.filter((o) => o.y < H + 80);

        // collisions
        const pr = 16;
        const px = s.playerX;
        const py = H - 90;
        for (const o of s.obstacles) {
          let hit = false;
          if (o.kind === 'circle') {
            const d = Math.hypot(o.x - px, o.y - py);
            hit = d < o.size / 2 + pr - 4;
          } else {
            // treat rect as circle-ish with slightly smaller radius for fairness
            const d = Math.hypot(o.x - px, o.y - py);
            hit = d < o.size * 0.42 + pr - 4;
          }
          if (hit) {
            explode(s);
            s.phase = 'over';
            if (s.score > s.best) {
              s.best = s.score;
              s.newBest = true;
              saveBest(s.score);
            }
            rerender();
            break;
          }
        }
      }

      // particles always update
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= dt;
      }
      s.particles = s.particles.filter((p) => p.life > 0);
      s.flash = Math.max(0, s.flash - dt * 2.5);

      // --- draw ---
      ctx.clearRect(0, 0, W, H);

      // background grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      const gridOff = (tGlobal * 60) % 40;
      for (let gx = 0; gx <= W; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = -40; gy <= H; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy + gridOff);
        ctx.lineTo(W, gy + gridOff);
        ctx.stroke();
      }
      ctx.restore();

      // speed lines
      if (s.phase === 'playing') {
        ctx.save();
        ctx.strokeStyle = 'rgba(251,113,133,0.10)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const x = ((i * 173 + tGlobal * 900) % (W + 100)) - 50;
          const y = ((i * 271 + tGlobal * 1400) % (H + 200)) - 100;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 60 + s.elapsed * 0.4);
          ctx.stroke();
        }
        ctx.restore();
      }

      // obstacles
      for (const o of s.obstacles) {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.rot);
        ctx.shadowColor = o.color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = o.color;
        ctx.fillStyle = o.color + '22';
        ctx.lineWidth = 3;
        if (o.kind === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, o.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // inner ring
          ctx.beginPath();
          ctx.arc(0, 0, o.size / 4, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const h = o.size;
          ctx.beginPath();
          ctx.rect(-h / 2, -h / 2, h, h);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-h / 2, -h / 2);
          ctx.lineTo(h / 2, h / 2);
          ctx.moveTo(h / 2, -h / 2);
          ctx.lineTo(-h / 2, h / 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // player orb
      const py = H - 90;
      ctx.save();
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 28;
      const g = ctx.createRadialGradient(s.playerX, py, 2, s.playerX, py, 22);
      g.addColorStop(0, '#fff7ed');
      g.addColorStop(0.45, '#fb923c');
      g.addColorStop(1, '#ef4444');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.playerX, py, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // orb ring
      ctx.save();
      ctx.strokeStyle = 'rgba(251,146,60,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.playerX, py, 22 + Math.sin(tGlobal * 6) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // particles
      for (const p of s.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.restore();
      }

      // red flash on hit
      if (s.flash > 0) {
        ctx.save();
        ctx.globalAlpha = s.flash * 0.35;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // HUD
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '900 30px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${s.score}s`, 18, 42);
      ctx.fillStyle = 'rgba(251,191,36,0.9)';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`BEST ${s.best}s`, W - 18, 38);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [rerender]);

  // auto-pause when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && stateRef.current.phase === 'playing') {
        stateRef.current.phase = 'paused';
        rerender();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [rerender]);

  const s = stateRef.current;

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[480px] select-none">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-[0_0_60px_rgba(239,68,68,0.15)]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', aspectRatio: `${W}/${H}`, touchAction: 'none', cursor: 'pointer' }}
          aria-label="Se Fire Neon Dash game"
        />

        {/* start overlay */}
        {s.phase === 'ready' && (
          <button
            onClick={startGame}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-[2px]"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_40px_rgba(249,115,22,0.6)]">
              <Play className="h-9 w-9 text-white" fill="currentColor" />
            </span>
            <span className="text-2xl font-black">Tap to dash</span>
            <span className="max-w-[260px] text-sm text-slate-400">
              Steer the orb with ← → keys or drag your finger. Dodge the neon hazards. Survive.
            </span>
          </button>
        )}

        {/* paused overlay */}
        {s.phase === 'paused' && (
          <button
            onClick={togglePause}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-[2px]"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10">
              <Play className="h-9 w-9 text-white" fill="currentColor" />
            </span>
            <span className="text-2xl font-black">Paused</span>
            <span className="text-sm text-slate-400">Tap to resume</span>
          </button>
        )}

        {/* game over overlay */}
        {s.phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center backdrop-blur-[2px]">
            <Flame className="h-10 w-10 text-orange-400" />
            <div className="text-3xl font-black">Wrecked!</div>
            <div className="text-slate-300">
              You survived <span className="font-black text-white">{s.score}s</span>
            </div>
            {s.newBest && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-300">
                <Trophy className="h-4 w-4" /> New best!
              </div>
            )}
            {!s.newBest && (
              <div className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Trophy className="h-4 w-4 text-amber-400" /> Best: {s.best}s
              </div>
            )}
            <button
              onClick={startGame}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.5)] transition hover:brightness-110 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" /> Dash again
            </button>
          </div>
        )}

        {/* pause button */}
        {(s.phase === 'playing' || s.phase === 'paused') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            className="absolute left-3 top-12 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur"
            aria-label="Pause"
          >
            {s.phase === 'playing' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Zap className="h-3.5 w-3.5 text-orange-400" />
        Arrow keys / A D / drag to move · P to pause
      </div>
    </div>
  );
}

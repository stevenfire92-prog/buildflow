// Se Fire Crystal Cascade — falling-crystal match arcade game.
// Canvas-based. 5 columns, catcher at the bottom, match 3+ in the tray to clear.
// Missed crystals feed the danger stacks — fill any column to the danger line and it's over.
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, Gem, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const W = 480;
const H = 720;
const COLS = 5;
const COL_W = W / COLS;
const MAX_STACK = 10;
const TRAY_MAX = 10;
const DANGER_Y = H - 400; // red line — stacks reaching this = game over
const CATCHER_Y = H - 150;
const BEST_KEY = 'sfcascade:best';

const COLORS = [
  { name: 'ruby', main: '#ff4d6d', glow: 'rgba(255,77,109,0.55)', dark: '#a3122e' },
  { name: 'sapphire', main: '#4da6ff', glow: 'rgba(77,166,255,0.55)', dark: '#123fa3' },
  { name: 'emerald', main: '#3ddc84', glow: 'rgba(61,220,132,0.55)', dark: '#0d7a3f' },
  { name: 'amber', main: '#ffc94d', glow: 'rgba(255,201,77,0.55)', dark: '#a36a12' },
  { name: 'violet', main: '#b46bff', glow: 'rgba(180,107,255,0.55)', dark: '#5b1fa3' },
];

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

function randInt(n) {
  return Math.floor(Math.random() * n);
}

// Draw a diamond (rotated square) crystal at x,y with given size and rotation.
function drawCrystal(ctx, x, y, size, colorIdx, rot, alpha = 1) {
  const c = COLORS[colorIdx];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  // glow
  ctx.shadowColor = c.glow;
  ctx.shadowBlur = 18;
  // body
  const s = size / 2;
  const grad = ctx.createLinearGradient(-s, -s, s, s);
  grad.addColorStop(0, c.main);
  grad.addColorStop(1, c.dark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.8, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.8, 0);
  ctx.closePath();
  ctx.fill();
  // facet highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.35, -s * 0.1);
  ctx.lineTo(0, s * 0.25);
  ctx.lineTo(-s * 0.35, -s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function CrystalCascadeGame() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('ready'); // ready | playing | paused | over
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [finalScore, setFinalScore] = useState(0);
  // Hot loop state lives in refs so the rAF loop never re-subscribes mid-game.
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const phaseRef = useRef('ready');

  // Mutable game world — lives in a ref so the rAF loop never goes stale.
  const world = useRef(null);

  const newWorld = () => ({
    crystals: [],      // falling: { id, x, y, col, color, vy, rot, rotV, size }
    particles: [],     // { x, y, vx, vy, life, maxLife, color, size }
    tray: [],          // caught crystal colors (array of colorIdx)
    stacks: new Array(COLS).fill(0),
    catcherX: W / 2,
    catcherTarget: W / 2,
    keys: { left: false, right: false },
    spawnT: 0,
    nextId: 1,
    time: 0,
    lastTrayToast: 0,
  });

  const levelFor = (s) => 1 + Math.floor(s / 400);
  const level = levelFor(score); // derived for the HUD
  const fallSpeed = (lvl) => 150 + (lvl - 1) * 32;
  const spawnInterval = (lvl) => Math.max(320, 880 - (lvl - 1) * 55);

  const burst = (w, x, y, colorIdx, n = 14, power = 160) => {
    const c = COLORS[colorIdx];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = power * (0.4 + Math.random() * 0.8);
      w.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        color: c.main,
        size: 2 + Math.random() * 3,
      });
    }
  };

  // Scan tray for runs of 3+ adjacent same-color. Remove them all, return count cleared.
  const clearMatches = (w) => {
    let cleared = 0;
    let changed = true;
    while (changed) {
      changed = false;
      let runStart = 0;
      for (let i = 1; i <= w.tray.length; i++) {
        if (i === w.tray.length || w.tray[i] !== w.tray[runStart]) {
          const runLen = i - runStart;
          if (runLen >= 3) {
            cleared += runLen;
            w.tray.splice(runStart, runLen);
            changed = true;
            break;
          }
          runStart = i;
        }
      }
    }
    return cleared;
  };

  const endGame = useCallback((w, s) => {
    setFinalScore(s);
    setPhase('over');
    setBest((b) => {
      if (s > b) {
        saveBest(s);
        toast.success(`New best score: ${s.toLocaleString()}! 🏆`);
        return s;
      }
      return b;
    });
  }, []);

  const startGame = useCallback(() => {
    world.current = newWorld();
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setPhase('playing');
  }, []);

  const togglePause = useCallback(() => {
    setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
  }, []);

  // ---- main loop -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // HiDPI crispness
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = performance.now();
    const syncPhase = () => { phaseRef.current = phase; };
    syncPhase();

    const onKeyDown = (e) => {
      const w = world.current;
      if (!w) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { w.keys.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { w.keys.right = true; e.preventDefault(); }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
      if (e.key === ' ' || e.key === 'Enter') {
        if (phaseRef.current === 'ready' || phaseRef.current === 'over') startGame();
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      const w = world.current;
      if (!w) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') w.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') w.keys.right = false;
    };

    const pointerToX = (clientX) => {
      const r = canvas.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * W;
    };
    const onPointerMove = (e) => {
      const w = world.current;
      if (!w) return;
      w.catcherTarget = Math.max(COL_W * 0.7, Math.min(W - COL_W * 0.7, pointerToX(e.clientX)));
    };
    const onPointerDown = (e) => {
      onPointerMove(e);
      if (phaseRef.current === 'ready' || phaseRef.current === 'over') startGame();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);

    const step = (now) => {
      raf = requestAnimationFrame(step);
      syncPhase();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = world.current;

      // ---- update ----
      if (w && phaseRef.current === 'playing') {
        w.time += dt;
        const lvl = levelFor(scoreRef.current);

        // catcher movement: keys nudge the target, pointer sets it directly
        const keySpeed = 420;
        if (w.keys.left) w.catcherTarget -= keySpeed * dt;
        if (w.keys.right) w.catcherTarget += keySpeed * dt;
        w.catcherTarget = Math.max(COL_W * 0.7, Math.min(W - COL_W * 0.7, w.catcherTarget));
        w.catcherX += (w.catcherTarget - w.catcherX) * Math.min(1, dt * 14);

        // spawn
        w.spawnT -= dt * 1000;
        if (w.spawnT <= 0) {
          w.spawnT = spawnInterval(lvl) * (0.75 + Math.random() * 0.5);
          const col = randInt(COLS);
          const color = randInt(COLORS.length);
          w.crystals.push({
            id: w.nextId++,
            col,
            x: col * COL_W + COL_W / 2 + (Math.random() - 0.5) * 20,
            y: -30,
            color,
            vy: fallSpeed(lvl) * (0.9 + Math.random() * 0.25),
            rot: Math.random() * Math.PI,
            rotV: (Math.random() - 0.5) * 3,
            size: 30 + Math.random() * 8,
          });
        }

        const catcherW = COL_W * 1.5;
        const catcherH = 26;
        let newScore = scoreRef.current;
        let newCombo = comboRef.current;

        // move crystals, catch / miss
        for (let i = w.crystals.length - 1; i >= 0; i--) {
          const c = w.crystals[i];
          c.y += c.vy * dt;
          c.rot += c.rotV * dt;

          const inCatchBand = c.y + c.size / 2 >= CATCHER_Y - catcherH / 2 && c.y < CATCHER_Y + catcherH / 2;
          const overlapsCatcher = Math.abs(c.x - w.catcherX) < catcherW / 2 + c.size / 2;

          if (inCatchBand && overlapsCatcher) {
            // CAUGHT
            w.crystals.splice(i, 1);
            burst(w, c.x, CATCHER_Y - 20, c.color, 8, 110);
            if (w.tray.length < TRAY_MAX) {
              w.tray.push(c.color);
              const cleared = clearMatches(w);
              if (cleared > 0) {
                newCombo += 1;
                const pts = cleared * 10 * newCombo;
                newScore += pts;
                burst(w, w.catcherX, CATCHER_Y - 40, c.color, 22, 220);
                // shatter the tallest danger stack by one block
                let tallest = 0;
                for (let s = 1; s < COLS; s++) if (w.stacks[s] > w.stacks[tallest]) tallest = s;
                if (w.stacks[tallest] > 0) w.stacks[tallest] -= 1;
                if (cleared >= 5) toast.success(`${cleared} crystals! Combo x${newCombo} 🔥`);
              }
            } else if (w.time - w.lastTrayToast > 3) {
              w.lastTrayToast = w.time;
              toast.info('Tray full — match crystals to clear space!');
            }
          } else if (c.y - c.size / 2 > H - 60) {
            // MISSED — feeds the danger stack
            w.crystals.splice(i, 1);
            w.stacks[c.col] += 1;
            newCombo = 0;
            burst(w, c.x, H - 80, c.color, 6, 80);
            if (w.stacks[c.col] >= MAX_STACK) {
              scoreRef.current = newScore;
              comboRef.current = 0;
              setScore(newScore);
              setCombo(0);
              endGame(w, newScore);
              return;
            }
          }
        }
        if (newScore !== scoreRef.current) {
          scoreRef.current = newScore;
          setScore(newScore);
        }
        if (newCombo !== comboRef.current) {
          comboRef.current = newCombo;
          setCombo(newCombo);
        }

        // particles
        for (let i = w.particles.length - 1; i >= 0; i--) {
          const p = w.particles[i];
          p.life += dt;
          if (p.life >= p.maxLife) { w.particles.splice(i, 1); continue; }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 320 * dt;
        }
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H);

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0a0a0f');
      bg.addColorStop(0.6, '#120a1a');
      bg.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // faint column guides
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * COL_W, 0);
        ctx.lineTo(i * COL_W, H);
        ctx.stroke();
      }

      // danger line
      ctx.save();
      ctx.strokeStyle = 'rgba(255,60,60,0.65)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(W, DANGER_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,60,60,0.8)';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('⚠ DANGER', 8, DANGER_Y - 8);
      ctx.restore();

      if (w) {
        // danger stacks (behind catcher/tray)
        const blockH = (H - 60 - DANGER_Y) / MAX_STACK;
        for (let col = 0; col < COLS; col++) {
          const n = w.stacks[col];
          for (let b = 0; b < n; b++) {
            const bx = col * COL_W + COL_W / 2;
            const by = H - 60 - b * blockH - blockH / 2;
            const danger = n >= MAX_STACK - 2;
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = danger ? '#ff3b3b' : '#5b4a6b';
            ctx.shadowColor = danger ? 'rgba(255,60,60,0.7)' : 'transparent';
            ctx.shadowBlur = danger ? 10 : 0;
            const s = Math.min(COL_W * 0.36, blockH * 0.42);
            ctx.beginPath();
            ctx.moveTo(bx, by - s);
            ctx.lineTo(bx + s * 0.8, by);
            ctx.lineTo(bx, by + s);
            ctx.lineTo(bx - s * 0.8, by);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }

        // falling crystals
        for (const c of w.crystals) drawCrystal(ctx, c.x, c.y, c.size, c.color, c.rot);

        // particles
        for (const p of w.particles) {
          const t = 1 - p.life / p.maxLife;
          ctx.save();
          ctx.globalAlpha = t;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // catcher
        const cw = COL_W * 1.5;
        const ch = 26;
        ctx.save();
        ctx.shadowColor = 'rgba(255,140,40,0.8)';
        ctx.shadowBlur = 22;
        const cg = ctx.createLinearGradient(w.catcherX - cw / 2, 0, w.catcherX + cw / 2, 0);
        cg.addColorStop(0, '#ff7a1a');
        cg.addColorStop(0.5, '#ffb03a');
        cg.addColorStop(1, '#ff3d5a');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.roundRect(w.catcherX - cw / 2, CATCHER_Y - ch / 2, cw, ch, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        // inner gem slot shimmer
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.roundRect(w.catcherX - cw / 2 + 6, CATCHER_Y - ch / 2 + 6, cw - 12, ch - 12, 8);
        ctx.fill();
        ctx.restore();

        // tray
        const trayY = H - 34;
        const slotGap = Math.min(40, (W - 40) / TRAY_MAX);
        const trayW = slotGap * TRAY_MAX;
        const trayX0 = (W - trayW) / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(trayX0 - 8, trayY - 18, trayW + 16, 36, 10);
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < TRAY_MAX; i++) {
          const sx = trayX0 + i * slotGap + slotGap / 2;
          if (i < w.tray.length) {
            drawCrystal(ctx, sx, trayY, 22, w.tray[i], w.time * 0.8 + i * 0.3);
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.07)';
            ctx.beginPath();
            ctx.arc(sx, trayY, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // dim when paused / over (ready has its own overlay)
      if (w && phaseRef.current !== 'playing' && phaseRef.current !== 'ready') {
        ctx.fillStyle = 'rgba(4,4,8,0.45)';
        ctx.fillRect(0, 0, W, H);
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
    // The hot loop reads everything mutable from refs, so it only re-subscribes
    // when the phase changes (pause/resume/start) — never mid-game on score ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startGame, togglePause, endGame]);

  const maxStack = world.current ? Math.max(...world.current.stacks) : 0;
  const dangerPct = Math.round((maxStack / MAX_STACK) * 100);

  return (
    <div className="w-full">
      {/* HUD */}
      <div className="mb-3 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score</div>
          <div className="text-xl font-black text-white">{score.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Level</div>
          <div className="text-xl font-black text-orange-400">{level}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Combo</div>
          <div className="text-xl font-black text-amber-300">x{Math.max(combo, 0)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Danger</div>
          <div className={`text-xl font-black ${dangerPct >= 70 ? 'text-red-400' : dangerPct >= 40 ? 'text-amber-300' : 'text-emerald-300'}`}>
            {dangerPct}%
          </div>
        </div>
      </div>

      {/* canvas + overlays */}
      <div className="relative mx-auto w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]">
        <canvas
          ref={canvasRef}
          className="game-canvas block h-auto w-full"
          style={{ aspectRatio: `${W}/${H}` }}
        />

        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 text-center backdrop-blur-sm">
            <Gem className="mb-4 h-14 w-14 text-orange-400" />
            <h2 className="text-3xl font-black">
              Crystal{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Cascade
              </span>
            </h2>
            <p className="mt-3 max-w-xs text-sm text-slate-300">
              Move the catcher. Grab falling crystals. Match <span className="font-bold text-white">3+ of a color</span> in
              your tray to shatter them for points — and smash back the danger stacks.
            </p>
            <p className="mt-2 max-w-xs text-xs text-slate-500">
              Missed crystals pile up. If any pile crosses the red line, the cascade wins.
            </p>
            <button
              onClick={startGame}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-black text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
            >
              <Play className="h-5 w-5" /> Start Game
            </button>
            <p className="mt-4 text-xs text-slate-500">← → / A D · mouse · touch to move · P to pause</p>
          </div>
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center backdrop-blur-sm">
            <Pause className="mb-3 h-12 w-12 text-amber-300" />
            <h2 className="text-2xl font-black">Paused</h2>
            <button
              onClick={togglePause}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 font-black transition hover:brightness-110"
            >
              <Play className="h-5 w-5" /> Resume
            </button>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-6 text-center backdrop-blur-sm">
            <AlertTriangle className="mb-3 h-12 w-12 text-red-400" />
            <h2 className="text-3xl font-black">Cascade Over</h2>
            <p className="mt-2 text-slate-400">The danger stack breached the line.</p>
            <div className="mt-5 flex items-center gap-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score</div>
                <div className="text-3xl font-black text-white">{finalScore.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Best</div>
                <div className="flex items-center gap-1 text-3xl font-black text-amber-300">
                  <Trophy className="h-6 w-6" /> {best.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-black text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
            >
              <RotateCcw className="h-5 w-5" /> Play Again
            </button>
            <p className="mt-3 text-xs text-slate-500">or press Space / Enter</p>
          </div>
        )}
      </div>

      {/* pause button row */}
      {(phase === 'playing' || phase === 'paused') && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={togglePause}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-slate-300 transition hover:border-orange-400/40 hover:text-white"
          >
            {phase === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {phase === 'playing' ? 'Pause (P)' : 'Resume'}
          </button>
        </div>
      )}
    </div>
  );
}

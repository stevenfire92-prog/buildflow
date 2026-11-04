// Se Fire Gravity Flip — gravity-switching runner.
// Tap / click / Space flips gravity between floor and ceiling. Dodge the spikes.
import { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, Trophy, RotateCcw, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const W = 480;
const H = 640;
const BEST_KEY = 'sfgravityflip:best';
const FLOOR_Y = H - 56; // surface line of the floor
const CEIL_Y = 56; // surface line of the ceiling
const PX = 110; // player fixed x
const PW = 34;
const PH = 46;
const GRAV = 3000;
const MAX_FALL = 1250;
const FLIP_KICK = 240;
const START_SPEED = 330;
const MAX_SPEED = 920;
const SPEED_RAMP = 9; // px/s gained per second alive

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

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function newGameState() {
  return {
    status: 'ready', // ready | playing | paused | dead
    y: FLOOR_Y - PH,
    vy: 0,
    gravDir: 1, // 1 = pulled down (floor), -1 = pulled up (ceiling)
    grounded: true,
    groundSide: 'floor',
    speed: START_SPEED,
    distance: 0,
    spikes: [],
    particles: [],
    nextHazardAt: 500,
    elapsed: 0,
    deadAt: 0,
    flipFlash: 0,
  };
}

function spawnHazards(g) {
  // Spawn a pattern of spikes just off the right edge.
  const roll = Math.random();
  const mk = (side, dx, w, h) => ({ x: W + 60 + dx, side, w, h });
  if (roll < 0.42) {
    const side = Math.random() < 0.5 ? 'floor' : 'ceil';
    g.spikes.push(mk(side, 0, rand(34, 46), rand(40, 58)));
  } else if (roll < 0.62) {
    const side = Math.random() < 0.5 ? 'floor' : 'ceil';
    g.spikes.push(mk(side, 0, rand(34, 44), rand(40, 54)));
    g.spikes.push(mk(side, rand(64, 84), rand(34, 44), rand(40, 54)));
  } else if (roll < 0.82) {
    // staggered: floor then ceiling — forces a flip
    const first = Math.random() < 0.5 ? 'floor' : 'ceil';
    const second = first === 'floor' ? 'ceil' : 'floor';
    g.spikes.push(mk(first, 0, rand(34, 44), rand(40, 56)));
    g.spikes.push(mk(second, rand(120, 160), rand(34, 44), rand(40, 56)));
  } else {
    const side = Math.random() < 0.5 ? 'floor' : 'ceil';
    g.spikes.push(mk(side, 0, rand(40, 50), rand(64, 78))); // tall spike
  }
  // gap scales slightly tighter as speed rises, but never unfair
  const t = Math.min(1, (g.speed - START_SPEED) / (MAX_SPEED - START_SPEED));
  g.nextHazardAt = g.distance + rand(340, 620) - t * 90;
}

function burst(g, x, y, n, color) {
  for (let i = 0; i < n; i++) {
    g.particles.push({
      x,
      y,
      vx: rand(-220, 60),
      vy: rand(-260, 260),
      life: rand(0.25, 0.6),
      maxLife: 0.6,
      r: rand(2, 4.5),
      color,
    });
  }
}

function hitTest(g) {
  // shrunk robot box
  const rx0 = PX + 7;
  const rx1 = PX + PW - 7;
  const ry0 = g.y + 5;
  const ry1 = g.y + PH - 4;
  for (const s of g.spikes) {
    let sx0, sx1, sy0, sy1;
    if (s.side === 'floor') {
      sx0 = s.x + s.w * 0.2;
      sx1 = s.x + s.w * 0.8;
      sy1 = FLOOR_Y;
      sy0 = FLOOR_Y - s.h * 0.78;
    } else {
      sx0 = s.x + s.w * 0.2;
      sx1 = s.x + s.w * 0.8;
      sy0 = CEIL_Y;
      sy1 = CEIL_Y + s.h * 0.78;
    }
    if (rx0 < sx1 && rx1 > sx0 && ry0 < sy1 && ry1 > sy0) return true;
  }
  return false;
}

function drawRobot(ctx, g) {
  const upsideDown = g.gravDir === -1;
  ctx.save();
  ctx.translate(PX + PW / 2, g.y + PH / 2);
  if (upsideDown) ctx.scale(1, -1);
  // tilt with vertical velocity
  const tilt = Math.max(-0.28, Math.min(0.28, (g.vy / MAX_FALL) * 0.3)) * g.gravDir;
  ctx.rotate(tilt);

  const x0 = -PW / 2;
  const y0 = -PH / 2;

  // glow
  ctx.shadowColor = 'rgba(249,115,22,0.85)';
  ctx.shadowBlur = 18;

  // body
  const body = ctx.createLinearGradient(0, y0, 0, y0 + PH);
  body.addColorStop(0, '#fdba74');
  body.addColorStop(0.45, '#f97316');
  body.addColorStop(1, '#c2410c');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x0, y0, PW, PH, 9);
  ctx.fill();
  ctx.shadowBlur = 0;

  // chest plate
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.roundRect(x0 + 7, y0 + 24, PW - 14, 12, 4);
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(x0 + PW / 2 - 2, y0 + 26, 4, 8);

  // visor
  ctx.fillStyle = '#111318';
  ctx.beginPath();
  ctx.roundRect(x0 + 5, y0 + 6, PW - 10, 13, 6);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x0 + 12, y0 + 12.5, 2.6, 0, Math.PI * 2);
  ctx.arc(x0 + PW - 12, y0 + 12.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // antenna
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, y0);
  ctx.lineTo(0, y0 - 9);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, y0 - 11, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSpike(ctx, s) {
  const grad = ctx.createLinearGradient(0, 0, 0, s.h);
  if (s.side === 'floor') {
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#991b1b');
  } else {
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#fca5a5');
  }
  ctx.save();
  ctx.shadowColor = 'rgba(239,68,68,0.7)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (s.side === 'floor') {
    ctx.moveTo(s.x, FLOOR_Y);
    ctx.lineTo(s.x + s.w / 2, FLOOR_Y - s.h);
    ctx.lineTo(s.x + s.w, FLOOR_Y);
  } else {
    ctx.moveTo(s.x, CEIL_Y);
    ctx.lineTo(s.x + s.w / 2, CEIL_Y + s.h);
    ctx.lineTo(s.x + s.w, CEIL_Y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function GravityFlipGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const g = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [status, setStatus] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [newBest, setNewBest] = useState(false);
  const statusRef = useRef(status);
  statusRef.current = status;
  const scoreRef = useRef(0);

  if (!g.current) g.current = newGameState();

  const setGameStatus = useCallback((s) => {
    g.current.status = s;
    setStatus(s);
  }, []);

  const startRun = useCallback(() => {
    const keepBest = g.current;
    g.current = newGameState();
    g.current.status = 'playing';
    g.current.nextHazardAt = 420;
    void keepBest;
    setNewBest(false);
    scoreRef.current = 0;
    setScore(0);
    setStatus('playing');
    lastRef.current = performance.now();
  }, []);

  const flip = useCallback(() => {
    const st = g.current;
    if (st.status !== 'playing') return;
    st.gravDir *= -1;
    st.vy = -st.gravDir * FLIP_KICK;
    st.grounded = false;
    st.flipFlash = 0.18;
    burst(st, PX + PW / 2, st.y + PH / 2, 8, '#fdba74');
  }, []);

  const togglePause = useCallback(() => {
    const st = g.current;
    if (st.status === 'playing') {
      setGameStatus('paused');
    } else if (st.status === 'paused') {
      setGameStatus('playing');
      lastRef.current = performance.now();
    }
  }, [setGameStatus]);

  const primaryAction = useCallback(() => {
    const st = g.current;
    if (st.status === 'ready' || st.status === 'dead') startRun();
    else if (st.status === 'playing') flip();
    else if (st.status === 'paused') togglePause();
  }, [startRun, flip, togglePause]);

  // ---- main loop ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // parallax dots
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      s: Math.random() * 0.5 + 0.15,
    }));

    const step = (now) => {
      rafRef.current = requestAnimationFrame(step);
      const dt = Math.min(0.033, (now - lastRef.current) / 1000 || 0.016);
      lastRef.current = now;
      const st = g.current;

      if (st.status === 'playing') {
        st.elapsed += dt;
        st.speed = Math.min(MAX_SPEED, START_SPEED + st.elapsed * SPEED_RAMP);
        st.distance += st.speed * dt;
        if (st.flipFlash > 0) st.flipFlash -= dt;

        // vertical physics
        st.vy += st.gravDir * GRAV * dt;
        if (st.vy > MAX_FALL) st.vy = MAX_FALL;
        if (st.vy < -MAX_FALL) st.vy = -MAX_FALL;
        st.y += st.vy * dt;

        const floorRest = FLOOR_Y - PH;
        const ceilRest = CEIL_Y;
        if (st.gravDir === 1 && st.y >= floorRest) {
          if (!st.grounded || st.groundSide !== 'floor') burst(st, PX + PW / 2, FLOOR_Y, 6, '#fb923c');
          st.y = floorRest;
          st.vy = 0;
          st.grounded = true;
          st.groundSide = 'floor';
        } else if (st.gravDir === -1 && st.y <= ceilRest) {
          if (!st.grounded || st.groundSide !== 'ceil') burst(st, PX + PW / 2, CEIL_Y, 6, '#fb923c');
          st.y = ceilRest;
          st.vy = 0;
          st.grounded = true;
          st.groundSide = 'ceil';
        } else {
          st.grounded = false;
        }

        // spawn + move spikes
        if (st.distance >= st.nextHazardAt) spawnHazards(st);
        for (const s of st.spikes) s.x -= st.speed * dt;
        st.spikes = st.spikes.filter((s) => s.x + s.w > -20);

        // particles
        for (const p of st.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 900 * dt;
          p.life -= dt;
        }
        st.particles = st.particles.filter((p) => p.life > 0);

        // collision
        if (hitTest(st)) {
          st.status = 'dead';
          st.deadAt = now;
          setStatus('dead');
          burst(st, PX + PW / 2, st.y + PH / 2, 26, '#ef4444');
          const m = Math.floor(st.distance / 50);
          const b = loadBest();
          if (m > b) {
            saveBest(m);
            setBest(m);
            setNewBest(true);
            toast.success(`New best: ${m.toLocaleString()}m!`);
          }
        }

        const m = Math.floor(st.distance / 50);
        if (m !== scoreRef.current) {
          scoreRef.current = m;
          setScore(m);
        }
      }

      // ---------- draw ----------
      // bg
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0a0a0f');
      bg.addColorStop(0.5, '#12101a');
      bg.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // parallax dots drift left with world when playing
      const drift = st.status === 'playing' ? st.speed * dt : 0;
      ctx.fillStyle = 'rgba(148,163,184,0.35)';
      for (const d of dots) {
        d.x -= drift * d.s;
        if (d.x < -4) {
          d.x = W + 4;
          d.y = Math.random() * H;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // flip flash
      if (st.flipFlash > 0) {
        ctx.fillStyle = `rgba(249,115,22,${(st.flipFlash / 0.18) * 0.14})`;
        ctx.fillRect(0, 0, W, H);
      }

      // floor + ceiling glow lines
      const pulse = 0.55 + Math.sin(now / 420) * 0.15;
      ctx.save();
      ctx.shadowColor = 'rgba(249,115,22,0.9)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(251,146,60,${pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(W, FLOOR_Y);
      ctx.moveTo(0, CEIL_Y);
      ctx.lineTo(W, CEIL_Y);
      ctx.stroke();
      ctx.restore();
      // surface shading
      ctx.fillStyle = 'rgba(249,115,22,0.05)';
      ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
      ctx.fillRect(0, 0, W, CEIL_Y);

      // spikes
      for (const s of st.spikes) drawSpike(ctx, s);

      // particles
      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // robot (hide briefly right at death for impact feel, then show)
      if (!(st.status === 'dead' && now - st.deadAt < 120)) drawRobot(ctx, st);

      // speed lines at high speed
      if (st.status === 'playing' && st.speed > 560) {
        ctx.strokeStyle = 'rgba(251,146,60,0.25)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const ly = ((now / 14 + i * 137) % (H + 80)) - 40;
          const lx = ((now / 6 + i * 211) % (W + 160)) - 80;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 46, ly);
          ctx.stroke();
        }
      }
    };

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);

    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.code;
      if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') {
        e.preventDefault();
        const st = g.current;
        if (st.status === 'ready' || st.status === 'dead') startRun();
        else if (st.status === 'playing') flip();
        else if (st.status === 'paused') togglePause();
      } else if (k === 'KeyP' || k === 'Escape') {
        togglePause();
      } else if (k === 'Enter') {
        const st = g.current;
        if (st.status === 'ready' || st.status === 'dead') startRun();
      }
    };
    const onVis = () => {
      if (document.hidden && g.current.status === 'playing') setGameStatus('paused');
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [startRun, flip, togglePause, setGameStatus]);

  return (
    <div className="w-full">
      {/* HUD */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
          <ArrowUpDown className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-black tabular-nums">{score.toLocaleString()}m</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="font-black tabular-nums text-amber-300">{best.toLocaleString()}m</span>
          </div>
          {(status === 'playing' || status === 'paused') && (
            <button
              onClick={togglePause}
              aria-label={status === 'playing' ? 'Pause' : 'Resume'}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-orange-400/40 hover:text-white"
            >
              {status === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* game area */}
      <div
        ref={wrapRef}
        onPointerDown={(e) => {
          e.preventDefault();
          primaryAction();
        }}
        className="relative mx-auto w-full max-w-[480px] cursor-pointer touch-none select-none overflow-hidden rounded-2xl border border-white/10"
        style={{ aspectRatio: '480 / 640' }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" style={{ width: '100%', height: '100%' }} />

        {status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 p-6 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
              <ArrowUpDown className="h-4 w-4" /> Gravity Flip
            </span>
            <h2 className="text-3xl font-black">
              Flip gravity.{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
                Dodge spikes.
              </span>
            </h2>
            <p className="mt-3 max-w-xs text-sm text-slate-300">
              Your robot runs on its own. <span className="font-bold text-white">Tap, click, or press Space</span> to
              flip between the floor and the ceiling. One spike ends the run.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRun();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-black transition hover:brightness-110"
            >
              <Play className="h-5 w-5" /> Start run
            </button>
          </div>
        )}

        {status === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
            <h2 className="text-3xl font-black">Paused</h2>
            <p className="mt-2 text-sm text-slate-400">Tap anywhere or press P to resume</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-black transition hover:brightness-110"
            >
              <Play className="h-5 w-5" /> Resume
            </button>
          </div>
        )}

        {status === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 p-6 text-center">
            <h2 className="text-4xl font-black text-red-400">Wiped out!</h2>
            {newBest && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-4 py-1.5 text-sm font-black text-amber-300">
                <Trophy className="h-4 w-4" /> New best!
              </span>
            )}
            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Distance</div>
                <div className="text-3xl font-black tabular-nums">{score.toLocaleString()}m</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Best</div>
                <div className="text-3xl font-black tabular-nums text-amber-300">{best.toLocaleString()}m</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRun();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 font-black transition hover:brightness-110"
            >
              <RotateCcw className="h-5 w-5" /> Run again
            </button>
            <p className="mt-3 text-xs text-slate-500">or tap anywhere / press Space</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Tap / click / Space to flip gravity · P to pause · spikes on floor and ceiling
      </p>
    </div>
  );
}

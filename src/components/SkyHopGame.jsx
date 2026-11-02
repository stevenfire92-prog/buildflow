// Se Fire Sky Hop — canvas flying game. Tap/click/Space to flap.
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const W = 400;
const H = 600;
const GROUND_H = 60;
const BIRD_X = 80;
const BIRD_R = 14;
const GRAVITY = 0.5;
const FLAP = -8;
const PIPE_W = 72;
const GAP = 148;
const SPAWN_EVERY = 95; // frames
const MAX_SPEED = 5;
const BEST_KEY = 'sfflappy:best';

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

function makeStars() {
  const stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * (H - GROUND_H),
      r: Math.random() * 1.6 + 0.4,
      tw: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

export default function SkyHopGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const g = useRef(null); // mutable game state
  const [phase, setPhase] = useState('ready'); // ready | playing | dead
  const [best, setBest] = useState(loadBest);
  const phaseRef = useRef('ready');
  const bestRef = useRef(0);

  useEffect(() => {
    bestRef.current = loadBest();
  }, []);

  const setPhaseBoth = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ---------- state ----------
  const reset = useCallback(() => {
    g.current = {
      birdY: H / 2,
      birdV: 0,
      pipes: [], // {x, gapY, scored}
      frame: 0,
      score: 0,
      deadAt: 0,
      stars: makeStars(),
    };
    setPhaseBoth('ready');
  }, []);

  const start = useCallback(() => {
    const s = g.current;
    s.birdY = H / 2;
    s.birdV = FLAP;
    s.pipes = [];
    s.frame = 0;
    s.score = 0;
    setPhaseBoth('playing');
  }, []);

  const die = useCallback(() => {
    const s = g.current;
    s.deadAt = Date.now();
    setPhaseBoth('dead');
    if (s.score > bestRef.current) {
      bestRef.current = s.score;
      setBest(s.score);
      saveBest(s.score);
    }
  }, []);

  const flap = useCallback(() => {
    if (!g.current) return;
    const p = phaseRef.current;
    if (p === 'ready') {
      start();
    } else if (p === 'playing') {
      g.current.birdV = FLAP;
    } else if (p === 'dead') {
      if (Date.now() - g.current.deadAt > 600) reset();
    }
  }, [start, reset]);

  // ---------- keyboard ----------
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  // ---------- drawing ----------
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !g.current) return;
    const ctx = canvas.getContext('2d');
    const s = g.current;
    const now = Date.now();
    const ph = phaseRef.current;

    // background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0a16');
    bgGrad.addColorStop(1, '#101020');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const st of s.stars) {
      const a = 0.35 + 0.3 * Math.sin(st.tw + now / 600);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // pipes
    for (const p of s.pipes) {
      const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      pipeGrad.addColorStop(0, '#c2410c');
      pipeGrad.addColorStop(0.5, '#fb923c');
      pipeGrad.addColorStop(1, '#c2410c');
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      // top pipe
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(p.x, 0, PIPE_W, topH);
      ctx.fillRect(p.x, botY, PIPE_W, H - GROUND_H - botY);
      // dark outline
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x + 1.5, -3, PIPE_W - 3, topH + 3);
      ctx.strokeRect(p.x + 1.5, botY, PIPE_W - 3, H - GROUND_H - botY);
      // pipe caps
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(p.x - 3, topH - 18, PIPE_W + 6, 18);
      ctx.fillRect(p.x - 3, botY, PIPE_W + 6, 18);
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x - 1.5, topH - 18, PIPE_W + 3, 18);
      ctx.strokeRect(p.x - 1.5, botY, PIPE_W + 3, 18);
    }

    // ground strip
    const groundY = H - GROUND_H;
    ctx.fillStyle = '#1a1a26';
    ctx.fillRect(0, groundY, W, GROUND_H);
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // bird
    const bx = BIRD_X;
    const by = s.birdY;
    const bodyGrad = ctx.createRadialGradient(bx - 4, by - 5, 2, bx, by, BIRD_R + 2);
    bodyGrad.addColorStop(0, '#fdba74');
    bodyGrad.addColorStop(0.6, '#f97316');
    bodyGrad.addColorStop(1, '#c2410c');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(bx, by, BIRD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // wing (flap wiggle)
    const wiggle = ph === 'playing' ? Math.sin(now / 90) * 3 : 0;
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(bx - 7, by + 2 + wiggle, 8, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bx + 4, by - 4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(bx + 5.5, by - 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // beak
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(bx + BIRD_R - 2, by - 1);
    ctx.lineTo(bx + BIRD_R + 8, by + 3);
    ctx.lineTo(bx + BIRD_R - 2, by + 6);
    ctx.closePath();
    ctx.fill();

    // score at top
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(249,115,22,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(String(s.score), W / 2, 64);
    ctx.shadowBlur = 0;

    // overlays
    if (ph === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fdba74';
      ctx.font = '900 30px system-ui, sans-serif';
      ctx.fillText('Tap. Fly. Survive.', W / 2, H / 2 - 46);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '600 17px system-ui, sans-serif';
      ctx.fillText('Tap, click or press Space to flap', W / 2, H / 2 - 8);
      if (bestRef.current > 0) {
        ctx.fillStyle = '#fcd34d';
        ctx.font = '700 15px system-ui, sans-serif';
        ctx.fillText(`Best: ${bestRef.current}`, W / 2, H / 2 + 24);
      }
    } else if (ph === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f87171';
      ctx.font = '900 34px system-ui, sans-serif';
      ctx.fillText('Game Over', W / 2, H / 2 - 40);
      ctx.fillStyle = '#fff';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText(String(s.score), W / 2, H / 2 + 10);
      const isBest = s.score >= bestRef.current && s.score > 0;
      ctx.fillStyle = '#fcd34d';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.fillText(isBest ? 'New best! 🏆' : `Best: ${bestRef.current}`, W / 2, H / 2 + 40);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '600 15px system-ui, sans-serif';
      ctx.fillText('Tap to fly again', W / 2, H / 2 + 68);
    }
  };

  // ---------- main loop ----------
  useEffect(() => {
    reset();
    let raf = 0;
    const loop = () => {
      const s = g.current;
      const ph = phaseRef.current;
      if (ph === 'playing') {
        s.frame += 1;
        // bird physics
        s.birdV += GRAVITY;
        s.birdY += s.birdV;
        // ceiling clamps (no death)
        if (s.birdY < BIRD_R) {
          s.birdY = BIRD_R;
          s.birdV = 0;
        }
        // speed ramps with score
        const speed = Math.min(MAX_SPEED, 2.6 + s.score * 0.03);
        // spawn pipes
        if (s.frame % SPAWN_EVERY === 0) {
          const margin = 90;
          const gapY = margin + GAP / 2 + Math.random() * (H - GROUND_H - 2 * margin - GAP);
          s.pipes.push({ x: W, gapY, scored: false });
        }
        // move pipes, score when passed
        for (const p of s.pipes) {
          p.x -= speed;
          if (!p.scored && p.x + PIPE_W < BIRD_X - BIRD_R) {
            p.scored = true;
            s.score += 1;
          }
        }
        // drop off-screen pipes
        while (s.pipes.length && s.pipes[0].x + PIPE_W < -10) s.pipes.shift();
        // collision: circle vs pipe rects
        const topH = (p) => p.gapY - GAP / 2;
        const botY = (p) => p.gapY + GAP / 2;
        const hitsPipe = s.pipes.some((p) => {
          if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
            if (s.birdY - BIRD_R < topH(p) || s.birdY + BIRD_R > botY(p)) return true;
          }
          return false;
        });
        const hitsGround = s.birdY + BIRD_R >= H - GROUND_H;
        if (hitsPipe || hitsGround) {
          die();
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      {/* header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Best: {best}
        </div>
        <div className="flex items-center gap-2">
          {phase !== 'playing' && phase !== 'ready' ? (
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          ) : (
            <button
              onClick={() => (phase === 'ready' ? start() : flap())}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25 transition active:scale-95"
            >
              <Play className="w-4 h-4" /> {phase === 'ready' ? 'Start' : 'Flap'}
            </button>
          )}
        </div>
      </div>

      {/* game canvas */}
      <div
        ref={wrapRef}
        onPointerDown={(e) => {
          e.preventDefault();
          flap();
        }}
        className="relative mx-auto select-none"
        style={{ width: '100%', maxWidth: 400, aspectRatio: '400 / 600', touchAction: 'none', cursor: 'pointer' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full rounded-xl border border-white/10"
        />
      </div>

      <p className="text-center text-xs text-slate-500 mt-3">
        Tap the game area, click, or press Space / ↑ to flap. Avoid the pipes and the ground.
      </p>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

// Lane geometry
const LANE_COUNT = 3;
const LANE_WIDTH = 400 / 3; // ~133.33
const CANVAS_W = 400;
const CANVAS_H = 600;
const PLAYER_W = 44;
const PLAYER_H = 60;
const PLAYER_BASE_Y = CANVAS_H - 150; // resting player center-y

const BEST_KEY = 'sfrunner:best';

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function RunnerGame() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('ready'); // 'ready' | 'running' | 'over'
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      const v = localStorage.getItem(BEST_KEY);
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [newBest, setNewBest] = useState(false);
  const stateRef = useRef(null);

  // Reset / start a fresh run
  const startGame = useCallback(() => {
    stateRef.current = {
      lane: 1, // 0,1,2
      jumpT: 0, // seconds into jump (0 = not jumping)
      slideT: 0, // seconds into slide
      obstacles: [], // { id, lane, y, type: 'low'|'high'|'block' }
      coins: [], // { id, lane, y }
      distance: 0,
      coinCount: 0,
      speed: 240, // px/sec world scroll
      spawnTimer: 0,
      nextGap: 1.6,
      running: true,
      elapsed: 0,
    };
    setScore(0);
    setNewBest(false);
    setPhase('running');
  }, []);

  // Lane change helper
  const moveLane = useCallback((dir) => {
    const s = stateRef.current;
    if (!s || !s.running) return;
    s.lane = Math.min(LANE_COUNT - 1, Math.max(0, s.lane + dir));
  }, []);

  const doJump = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running) return;
    if (s.jumpT <= 0) s.jumpT = 0.0001;
  }, []);

  const doSlide = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running) return;
    if (s.slideT <= 0) s.slideT = 0.0001;
  }, []);

  const handleKey = useCallback(
    (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
      if (keys.includes(e.code)) e.preventDefault();
      if (phase === 'ready') {
        if (e.code === 'Space' || e.code === 'Enter') startGame();
        return;
      }
      if (phase !== 'running') {
        if ((e.code === 'Space' || e.code === 'Enter') && phase === 'over') startGame();
        return;
      }
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          moveLane(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveLane(1);
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          doJump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          doSlide();
          break;
        default:
          break;
      }
    },
    [phase, startGame, moveLane, doJump, doSlide]
  );

  // Touch swipe handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };
    const onTouchEnd = (e) => {
      if (phase === 'ready') {
        startGame();
        return;
      }
      if (phase !== 'running') return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < 24) return; // tap: ignore (buttons handle taps)
      if (ax > ay) {
        moveLane(dx > 0 ? 1 : -1);
      } else {
        if (dy < 0) doJump();
        else doSlide();
      }
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [phase, startGame, moveLane, doJump, doSlide]);

  // Keyboard
  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId = 0;
    let lastT = performance.now();
    let uiTick = 0;

    const laneX = (lane) => lane * LANE_WIDTH + LANE_WIDTH / 2;

    const spawnObstacle = (s) => {
      const roll = Math.random();
      let type;
      if (roll < 0.36) type = 'low';
      else if (roll < 0.72) type = 'high';
      else type = 'block';

      // Decide lanes: 1 or 2 occupied
      const laneA = Math.floor(Math.random() * LANE_COUNT);
      let laneB = -1;
      if (Math.random() < 0.4) {
        const others = [0, 1, 2].filter((l) => l !== laneA);
        laneB = others[Math.floor(Math.random() * others.length)];
      }
      const lanes = laneB >= 0 ? [laneA, laneB] : [laneA];
      for (const lane of lanes) {
        s.obstacles.push({ id: makeId(), lane, y: -80, type });
      }

      // Scatter coins, possibly in a free lane
      const freeLanes = [0, 1, 2].filter((l) => !lanes.includes(l));
      const coinLane =
        freeLanes.length > 0 && Math.random() < 0.6
          ? freeLanes[Math.floor(Math.random() * freeLanes.length)]
          : Math.floor(Math.random() * LANE_COUNT);
      for (let i = 0; i < 3; i++) {
        s.coins.push({ id: makeId(), lane: coinLane, y: -80 - i * 52 });
      }
    };

    const endGame = (s, finalScore) => {
      s.running = false;
      setScore(finalScore);
      setBest((prev) => {
        if (finalScore > prev) {
          try {
            localStorage.setItem(BEST_KEY, String(finalScore));
          } catch {
            /* ignore */
          }
          setNewBest(true);
          toast.success(`New best score: ${finalScore}!`, { id: 'sfr-best' });
          return finalScore;
        }
        return prev;
      });
      setPhase('over');
    };

    const draw = (s, running) => {
      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bg.addColorStop(0, '#0a0a0f');
      bg.addColorStop(1, '#15151f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Lane dividers
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 12]);
      for (let i = 1; i < LANE_COUNT; i++) {
        const x = i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const px = laneX(s.lane);
      const jumping = s.jumpT > 0;
      const sliding = s.slideT > 0;
      const jumpOffset = jumping ? Math.sin(Math.min(s.jumpT / 0.6, 1) * Math.PI) * 120 : 0;
      const py = PLAYER_BASE_Y - jumpOffset;

      // Coins
      for (const c of s.coins) {
        const cx = laneX(c.lane);
        const cy = c.y;
        const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.55)');
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.fill();
        const g = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 11);
        g.addColorStop(0, '#fff7cc');
        g.addColorStop(0.6, '#ffd700');
        g.addColorStop(1, '#b8860b');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8b6508';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Obstacles
      for (const o of s.obstacles) {
        const ox = laneX(o.lane) - 42;
        const oy = o.y;
        if (o.type === 'low') {
          // Low barrier: jump over it (occupies bottom half)
          const grad = ctx.createLinearGradient(0, oy, 0, oy + 60);
          grad.addColorStop(0, '#dc2626');
          grad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = grad;
          ctx.fillRect(ox, oy + 40, 84, 60);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(ox, oy + 40, 84, 6);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(ox, oy + 40, 84, 60);
        } else if (o.type === 'high') {
          // Overhead barrier: slide under it (occupies top portion, gap at bottom)
          const grad = ctx.createLinearGradient(0, oy, 0, oy + 100);
          grad.addColorStop(0, '#374151');
          grad.addColorStop(1, '#1f2937');
          ctx.fillStyle = grad;
          ctx.fillRect(ox, oy, 84, 74);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ox, oy + 74, 84, 8); // warning stripe
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(ox, oy, 84, 6);
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 2;
          ctx.strokeRect(ox, oy, 84, 74);
        } else {
          // Full block: must change lane
          const grad = ctx.createLinearGradient(0, oy, 0, oy + 100);
          grad.addColorStop(0, '#b91c1c');
          grad.addColorStop(1, '#450a0a');
          ctx.fillStyle = grad;
          ctx.fillRect(ox, oy, 84, 100);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          for (let sx = 0; sx < 84; sx += 16) {
            ctx.beginPath();
            ctx.moveTo(ox + sx, oy + 100);
            ctx.lineTo(ox + sx + 12, oy);
            ctx.lineTo(ox + sx + 20, oy);
            ctx.lineTo(ox + sx + 8, oy + 100);
            ctx.closePath();
            ctx.fill();
          }
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(ox, oy, 84, 100);
        }
      }

      // Player
      const pw = PLAYER_W;
      let ph = PLAYER_H;
      let drawY = py;
      if (sliding) {
        ph = PLAYER_H * 0.5;
        drawY = py + PLAYER_H - ph;
      }
      const pg = ctx.createLinearGradient(0, drawY - ph / 2, 0, drawY + ph / 2);
      pg.addColorStop(0, '#fb923c');
      pg.addColorStop(1, '#dc2626');
      ctx.fillStyle = pg;
      const rx = px - pw / 2;
      const ry = drawY - ph / 2;
      const r = 10;
      ctx.beginPath();
      ctx.roundRect(rx, ry, pw, ph, r);
      ctx.fill();
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.arc(px - 8, ry + 14, 4, 0, Math.PI * 2);
      ctx.arc(px + 8, ry + 14, 4, 0, Math.PI * 2);
      ctx.fill();

      if (!running && phase === 'over') {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }
    };

    const step = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      const s = stateRef.current;

      if (s && s.running) {
        // Difficulty ramp
        s.elapsed += dt;
        s.speed = Math.min(240 + s.elapsed * 6, 640);
        s.nextGap = Math.max(0.55, 1.6 - s.elapsed * 0.012);

        // Jump / slide timers
        if (s.jumpT > 0) {
          s.jumpT += dt;
          if (s.jumpT >= 0.6) s.jumpT = 0;
        }
        if (s.slideT > 0) {
          s.slideT += dt;
          if (s.slideT >= 0.6) s.slideT = 0;
        }

        // Spawn
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          spawnObstacle(s);
          s.spawnTimer = s.nextGap;
        }

        // Move world down (obstacles/coins come toward player)
        const dy = s.speed * dt;
        for (const o of s.obstacles) o.y += dy;
        for (const c of s.coins) c.y += dy;
        s.distance += s.speed * dt * 0.05;

        // Remove off-screen
        s.obstacles = s.obstacles.filter((o) => o.y < CANVAS_H + 120);
        s.coins = s.coins.filter((c) => c.y < CANVAS_H + 60);

        const jumping = s.jumpT > 0;
        const sliding = s.slideT > 0;
        const playerTop = PLAYER_BASE_Y - PLAYER_H / 2;
        const playerBottom = PLAYER_BASE_Y + PLAYER_H / 2;

        // Coins collection
        for (let i = s.coins.length - 1; i >= 0; i--) {
          const c = s.coins[i];
          if (c.lane === s.lane && Math.abs(c.y - PLAYER_BASE_Y) < 44) {
            s.coins.splice(i, 1);
            s.coinCount += 1;
          }
        }

        // Collision detection (obstacle zones at player's y)
        let hit = false;
        for (const o of s.obstacles) {
          if (o.lane !== s.lane) continue;
          const inVerticalBand = o.y + 100 > playerTop + 10 && o.y < playerBottom - 10;
          if (!inVerticalBand) continue;
          if (o.type === 'low') {
            // avoid by jumping
            if (!jumping) hit = true;
          } else if (o.type === 'high') {
            // avoid by sliding
            if (!sliding) hit = true;
          } else {
            hit = true; // full block: unavoidable in this lane
          }
          if (hit) break;
        }

        const total = Math.floor(s.distance) + s.coinCount * 10;
        uiTick += dt;
        if (uiTick > 0.1) {
          uiTick = 0;
          setScore(total);
        }

        if (hit) {
          endGame(s, total);
        }

        draw(s, true);
      } else if (s) {
        draw(s, false);
      } else {
        // Idle: draw empty scene behind start overlay
        draw(
          {
            lane: 1,
            jumpT: 0,
            slideT: 0,
            obstacles: [],
            coins: [],
          },
          false
        );
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-[400px] max-w-full">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-2xl border border-white/10 touch-none select-none cursor-pointer"
          onClick={() => {
            if (phase === 'ready' || phase === 'over') startGame();
          }}
        />

        {/* Score HUD */}
        {(phase === 'running' || phase === 'over') && (
          <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
            <div className="bg-black/60 rounded-lg px-3 py-1.5 text-sm font-bold text-white">
              {score}
            </div>
            <div className="bg-black/60 rounded-lg px-3 py-1.5 text-sm text-amber-300">
              Best: {Math.max(best, score)}
            </div>
          </div>
        )}

        {/* Start overlay */}
        {phase === 'ready' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl cursor-pointer"
            onClick={startGame}
          >
            <p className="text-4xl font-black text-white mb-2">Se Fire Runner</p>
            <p className="text-gray-300 mb-6">Tap to start</p>
            <div className="text-xs text-gray-400 text-center leading-relaxed px-8">
              ← → move · ↑ jump · ↓ slide
              <br />
              or swipe on the track
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-2xl">
            <p className="text-3xl font-black text-red-400 mb-2">Game Over</p>
            {newBest && (
              <p className="text-amber-300 font-bold mb-1 animate-pulse">🏆 New Best!</p>
            )}
            <p className="text-white text-lg mb-1">
              Score: <span className="font-bold">{score}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">Best: {best}</p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 font-bold text-white hover:opacity-90 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-4 gap-3 w-[400px] max-w-full">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            moveLane(-1);
          }}
          onClick={() => moveLane(-1)}
          className="py-3 rounded-xl bg-white/10 text-2xl font-bold text-white active:bg-white/20 select-none"
          aria-label="Move left"
        >
          ←
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            moveLane(1);
          }}
          onClick={() => moveLane(1)}
          className="py-3 rounded-xl bg-white/10 text-2xl font-bold text-white active:bg-white/20 select-none"
          aria-label="Move right"
        >
          →
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            doJump();
          }}
          onClick={doJump}
          className="py-3 rounded-xl bg-white/10 text-2xl font-bold text-white active:bg-white/20 select-none"
          aria-label="Jump"
        >
          ⬆
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            doSlide();
          }}
          onClick={doSlide}
          className="py-3 rounded-xl bg-white/10 text-2xl font-bold text-white active:bg-white/20 select-none"
          aria-label="Slide"
        >
          ⬇
        </button>
      </div>
    </div>
  );
}

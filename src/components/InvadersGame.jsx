import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const W = 480, H = 600;
const BEST_KEY = 'sfinvaders:best';

export default function InvadersGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null); // live game object
  const [state, setState] = useState('start'); // start | playing | paused | gameover
  const stateRef = useRef('start');
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1, best: 0 });

  const setGameState = (s) => { stateRef.current = s; setState(s); };

  // ------- controls wired from buttons (game object lives in the effect below) -------
  const startGame = () => {
    const G = gameRef.current;
    if (!G) return;
    G.resetRun();
    setGameState('playing');
    G.startLoop();
  };
  const togglePause = () => {
    const G = gameRef.current;
    if (!G) return;
    if (stateRef.current === 'playing') {
      setGameState('paused');
    } else if (stateRef.current === 'paused') {
      setGameState('playing');
      G.startLoop();
    }
  };
  const fireOnce = () => {
    const G = gameRef.current;
    if (G && stateRef.current === 'playing') G.firePlayer();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const G = {
      player: { x: W / 2, w: 44, h: 16, speed: 320, cooldown: 0 },
      bullets: [],
      enemyBullets: [],
      aliens: [],
      shields: [],
      stars: [],
      alienDir: 1,
      alienSpeed: 30,
      score: 0,
      lives: 3,
      wave: 1,
      waveTotal: 0,
      best: 0,
      waveBanner: 0,
      fireTimer: 1,
      enemyFireInterval: 0.9,
      nextWavePending: false,
      keys: { left: false, right: false },
      fireHeld: false,
      raf: 0,
      lastTime: 0,
      hudTimer: 0,
      loopRunning: false,
    };
    try { G.best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch {}
    gameRef.current = G;

    for (let i = 0; i < 90; i++) {
      G.stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.4, s: Math.random() * 40 + 10 });
    }

    // ---------- waves ----------
    function spawnWave(wave) {
      const cols = Math.min(6 + Math.floor((wave - 1) / 2), 8);
      const rows = Math.min(4 + Math.floor((wave - 1) / 3), 6);
      const colors = ['#a855f7', '#ef4444', '#fb923c', '#fb923c', '#f43f5e', '#f43f5e'];
      G.aliens = [];
      const gw = cols * 46;
      const ox = (W - gw) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          G.aliens.push({
            x: ox + c * 46, y: 60 + r * 42, w: 34, h: 26,
            color: colors[r % colors.length],
            scoreVal: (rows - r) * 10,
            anim: Math.random() * Math.PI * 2,
          });
        }
      }
      G.waveTotal = G.aliens.length;
      G.alienDir = 1;
      G.alienSpeed = 22 + wave * 9;
      G.waveBanner = 2.2;
      G.enemyFireInterval = Math.max(0.28, 0.95 - wave * 0.09);
      G.fireTimer = 1;
      G.nextWavePending = false;
    }

    // ---------- shields (block-based bunkers) ----------
    const BW = 16;
    function buildShield(cx) {
      const blocks = [];
      const rows = 5, cols = 6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const edge = r === 0 && (c === 0 || c === cols - 1);
          const notch = r === rows - 1 && (c === 2 || c === 3);
          if (!edge && !notch) blocks.push({ x: cx + c * BW, y: H - 175 + r * BW, w: BW, h: BW, alive: true });
        }
      }
      return blocks;
    }
    function resetShields() {
      G.shields = [buildShield(W * 0.2 - 48), buildShield(W * 0.5 - 48), buildShield(W * 0.8 - 48)];
    }

    function resetRun() {
      G.score = 0; G.lives = 3; G.wave = 1;
      G.player.x = W / 2; G.player.cooldown = 0;
      G.bullets = []; G.enemyBullets = [];
      resetShields();
      spawnWave(1);
      syncHud(true);
    }

    function syncHud(force) {
      setHud((p) => {
        if (!force && p.score === G.score && p.lives === G.lives && p.wave === G.wave && p.best === G.best) return p;
        return { score: G.score, lives: G.lives, wave: G.wave, best: G.best };
      });
    }

    function loseLife() {
      G.lives -= 1;
      G.bullets = []; G.enemyBullets = [];
      G.player.x = W / 2;
      if (G.lives <= 0) {
        if (G.score > G.best) {
          G.best = G.score;
          try { localStorage.setItem(BEST_KEY, String(G.best)); } catch {}
          toast.success('New best score!', { description: `${G.score.toLocaleString()} points` });
        }
        syncHud(true);
        setGameState('gameover');
      }
      syncHud(true);
    }

    function firePlayer() {
      if (G.player.cooldown > 0) return;
      G.player.cooldown = 0.25; // ~4/sec
      G.bullets.push({ x: G.player.x - 2, y: H - 66, w: 4, h: 14, vy: -520 });
    }

    function rectHit(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
    function pointHitBlock(b, px, py) {
      return b.alive && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
    }

    // ---------- update ----------
    function update(dt) {
      for (const s of G.stars) { s.y += s.s * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } }

      const p = G.player;
      if (G.keys.left) p.x -= p.speed * dt;
      if (G.keys.right) p.x += p.speed * dt;
      p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));
      p.cooldown = Math.max(0, p.cooldown - dt);
      if (G.fireHeld) firePlayer();
      if (G.waveBanner > 0) G.waveBanner -= dt;

      const aliens = G.aliens;
      if (aliens.length > 0) {
        const speedMul = 1 + (1 - aliens.length / Math.max(1, G.waveTotal)) * 1.6;
        let minX = Infinity, maxX = -Infinity;
        for (const a of aliens) { if (a.x < minX) minX = a.x; if (a.x + a.w > maxX) maxX = a.x + a.w; a.anim += dt * 6; }
        const dx = G.alienDir * G.alienSpeed * speedMul * dt;
        if (minX + dx < 8 || maxX + dx > W - 8) {
          G.alienDir *= -1;
          for (const a of aliens) a.y += 18;
        } else {
          for (const a of aliens) a.x += dx;
        }
        for (const a of aliens) {
          if (a.y + a.h >= H - 50) {
            loseLife();
            resetShields();
            spawnWave(G.wave);
            return;
          }
        }
        G.fireTimer -= dt;
        if (G.fireTimer <= 0) {
          G.fireTimer = G.enemyFireInterval * (0.6 + Math.random() * 0.8);
          const cols = {};
          for (const a of aliens) {
            const key = Math.round(a.x / 46);
            if (!cols[key] || cols[key].y < a.y) cols[key] = a;
          }
          const shooters = Object.values(cols);
          if (shooters.length > 0) {
            const s = shooters[Math.floor(Math.random() * shooters.length)];
            G.enemyBullets.push({ x: s.x + s.w / 2 - 2, y: s.y + s.h, w: 4, h: 14, vy: 240 + G.wave * 18 });
          }
        }
      } else if (!G.nextWavePending) {
        G.nextWavePending = true;
        setTimeout(() => {
          if (stateRef.current !== 'playing') { G.nextWavePending = false; return; }
          G.wave += 1;
          spawnWave(G.wave);
          syncHud(true);
        }, 900);
      }

      // player bullets
      for (let i = G.bullets.length - 1; i >= 0; i--) {
        const b = G.bullets[i];
        b.y += b.vy * dt;
        let dead = b.y < -20;
        if (!dead) {
          for (const blocks of G.shields) {
            for (const blk of blocks) {
              if (pointHitBlock(blk, b.x + b.w / 2, b.y)) { blk.alive = false; dead = true; break; }
            }
            if (dead) break;
          }
        }
        if (!dead) {
          for (let j = aliens.length - 1; j >= 0; j--) {
            const a = aliens[j];
            if (rectHit(b, a)) {
              aliens.splice(j, 1);
              G.score += a.scoreVal;
              dead = true;
              break;
            }
          }
        }
        if (dead) G.bullets.splice(i, 1);
      }

      // enemy bullets
      const pBox = { x: p.x - p.w / 2, y: H - 66, w: p.w, h: p.h };
      for (let i = G.enemyBullets.length - 1; i >= 0; i--) {
        const b = G.enemyBullets[i];
        b.y += b.vy * dt;
        let dead = b.y > H + 20;
        if (!dead) {
          for (const blocks of G.shields) {
            for (const blk of blocks) {
              if (pointHitBlock(blk, b.x + b.w / 2, b.y + b.h)) { blk.alive = false; dead = true; break; }
            }
            if (dead) break;
          }
        }
        if (!dead && rectHit(b, pBox)) { dead = true; loseLife(); return; }
        if (dead) G.enemyBullets.splice(i, 1);
      }

      G.hudTimer -= dt;
      if (G.hudTimer <= 0) { G.hudTimer = 0.25; syncHud(); }
    }

    // ---------- draw ----------
    function drawAlien(a) {
      ctx.save();
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = a.color;
      const wobble = Math.sin(a.anim) * 2;
      ctx.beginPath();
      ctx.roundRect(a.x, a.y, a.w, a.h, 8);
      ctx.fill();
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x + 8, a.y); ctx.lineTo(a.x + 4, a.y - 6);
      ctx.moveTo(a.x + a.w - 8, a.y); ctx.lineTo(a.x + a.w - 4, a.y - 6);
      ctx.stroke();
      ctx.fillRect(a.x + 3, a.y + a.h - 3 + wobble, 6, 5);
      ctx.fillRect(a.x + a.w - 9, a.y + a.h - 3 - wobble, 6, 5);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.arc(a.x + a.w / 2 - 7, a.y + 10, 3.4, 0, Math.PI * 2);
      ctx.arc(a.x + a.w / 2 + 7, a.y + 10, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#060614');
      bg.addColorStop(1, '#0a0a1f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      for (const s of G.stars) { ctx.globalAlpha = 0.4 + (s.r / 2) * 0.4; ctx.fillRect(s.x, s.y, s.r, s.r); }
      ctx.globalAlpha = 1;

      for (const blocks of G.shields) {
        for (const blk of blocks) {
          if (!blk.alive) continue;
          ctx.save();
          ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 6;
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(blk.x + 1, blk.y + 1, blk.w - 2, blk.h - 2);
          ctx.restore();
        }
      }

      for (const a of G.aliens) drawAlien(a);

      const p = G.player;
      ctx.save();
      ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(p.x, H - 66);
      ctx.lineTo(p.x - p.w / 2, H - 50);
      ctx.lineTo(p.x - p.w / 4, H - 58);
      ctx.lineTo(p.x - p.w / 4, H - 44);
      ctx.lineTo(p.x + p.w / 4, H - 44);
      ctx.lineTo(p.x + p.w / 4, H - 58);
      ctx.lineTo(p.x + p.w / 2, H - 50);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(p.x, H - 58, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (const b of G.bullets) {
        ctx.save();
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#fde047';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      }
      for (const b of G.enemyBullets) {
        ctx.save();
        ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      }

      if (G.waveBanner > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, G.waveBanner);
        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 42px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fb923c'; ctx.shadowBlur = 20;
        ctx.fillText(`WAVE ${G.wave}`, W / 2, H / 2);
        ctx.restore();
      }
    }
    // ---------- main loop ----------
    function loop(t) {
      if (stateRef.current !== 'playing') { G.loopRunning = false; return; }
      if (!G.lastTime) G.lastTime = t;
      const dt = Math.min((t - G.lastTime) / 1000, 0.05);
      G.lastTime = t;
      update(dt);
      draw();
      G.raf = requestAnimationFrame(loop);
    }

    G.startLoop = () => {
      if (G.loopRunning) return;
      G.loopRunning = true;
      G.lastTime = 0;
      G.raf = requestAnimationFrame(loop);
    };
    G.resetRun = resetRun;
    G.firePlayer = firePlayer;
    G.setState = setGameState;

    // ---------- input ----------
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') e.preventDefault();
      if (stateRef.current === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        const btn = document.getElementById('sfinv-start-btn');
        if (btn) btn.click();
        return;
      }
      if (stateRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') G.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') G.keys.right = true;
      if (e.key === ' ') { firePlayer(); G.fireHeld = true; }
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') G.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') G.keys.right = false;
      if (e.key === ' ') G.fireHeld = false;
    };

    let dragStartX = null, playerStartX = 0;
    const onTouchStart = (e) => {
      if (stateRef.current !== 'playing') return;
      e.preventDefault();
      dragStartX = e.touches[0].clientX;
      playerStartX = G.player.x;
    };
    const onTouchMove = (e) => {
      if (stateRef.current !== 'playing' || dragStartX === null) return;
      e.preventDefault();
      const scale = W / canvas.getBoundingClientRect().width;
      G.player.x = Math.max(22, Math.min(W - 22, playerStartX + (e.touches[0].clientX - dragStartX) * scale));
    };
    const onTouchEnd = (e) => {
      if (stateRef.current !== 'playing') return;
      e.preventDefault();
      dragStartX = null;
    };

    // tap canvas to shoot (non-touch pointer path)
    let downX = null, downT = 0;
    const onPointerDown = (e) => { if (e.pointerType === 'mouse') { downX = e.clientX; downT = Date.now(); } };
    const onPointerUp = (e) => {
      if (downX !== null && Math.abs(e.clientX - downX) < 10 && Date.now() - downT < 300 && stateRef.current === 'playing') {
        firePlayer();
      }
      downX = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    // idle scene behind the start overlay
    resetRun();
    draw();
    G.aliens = []; // keep idle background clean of aliens until game starts
    G.waveBanner = 0;

    return () => {
      G.loopRunning = false;
      cancelAnimationFrame(G.raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-left">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">Score</div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums">{hud.score.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">Wave</div>
          <div className="text-2xl font-bold text-orange-400 tabular-nums">{hud.wave}</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">Lives</div>
          <div className="text-2xl font-bold text-rose-400 tabular-nums">{hud.lives > 0 ? '♥'.repeat(hud.lives) : '—'}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">Best</div>
          <div className="text-2xl font-bold text-zinc-300 tabular-nums">{hud.best.toLocaleString()}</div>
        </div>
        <button
          onClick={togglePause}
          disabled={state !== 'playing' && state !== 'paused'}
          className="ml-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold disabled:opacity-40"
        >
          {state === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-[0_0_40px_rgba(251,146,60,0.15)]">
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-auto touch-none select-none" />

        {state === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-6">
            <div className="text-5xl mb-4">👾</div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Se Fire Invaders</h2>
            <p className="text-zinc-400 text-sm mb-1">← → / A D to move · Space to shoot</p>
            <p className="text-zinc-400 text-sm mb-6">On mobile: drag to move, tap canvas or FIRE to shoot</p>
            <button
              id="sfinv-start-btn"
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-lg hover:scale-105 transition-transform"
            >
              ▶ Start Game
            </button>
          </div>
        )}

        {state === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <h2 className="text-3xl font-extrabold text-white mb-4">Paused</h2>
            <button
              onClick={togglePause}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold hover:scale-105 transition-transform"
            >
              ▶ Resume
            </button>
          </div>
        )}

        {state === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6">
            <h2 className="text-4xl font-extrabold text-rose-500 mb-2">Game Over</h2>
            <p className="text-zinc-400 text-sm mb-4">Wave {hud.wave} reached</p>
            <div className="text-5xl font-extrabold text-amber-400 mb-1">{hud.score.toLocaleString()}</div>
            <div className="text-zinc-500 text-sm mb-6">Best: {hud.best.toLocaleString()}</div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-lg hover:scale-105 transition-transform"
            >
              ↻ Play Again
            </button>
          </div>
        )}
      </div>

      {/* mobile FIRE button */}
      <button
        onClick={fireOnce}
        className="md:hidden mt-3 w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 text-white font-extrabold text-xl tracking-widest active:scale-95 transition-transform"
      >
        🔥 FIRE
      </button>
      <p className="hidden md:block text-center text-zinc-500 text-xs mt-2">Arrows / A D to move · Space to shoot · tap canvas to shoot</p>
    </div>
  );
}

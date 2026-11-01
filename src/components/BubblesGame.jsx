// Se Fire Bubbles — canvas bubble shooter (hex grid, match 3+ to pop)
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const W = 480;
const H = 640;
const R = 16;
const ROW_H = R * 1.732;
const COLS = 13;
const BEST_KEY = 'sfbubbles:best';
const SHOT_SPEED = 10;
const SHOTS_PER_DROP = 6;
const DANGER_Y = H - 150;
const SHOOTER_Y = H - 44;
const MAX_ROWS = 26;

const COLORS = [
  { name: 'orange', main: '#fb923c', light: '#fdba74', dark: '#c2410c' },
  { name: 'amber', main: '#fbbf24', light: '#fde68a', dark: '#b45309' },
  { name: 'red', main: '#ef4444', light: '#fca5a5', dark: '#b91c1c' },
  { name: 'pink', main: '#ec4899', light: '#f9a8d4', dark: '#be123c' },
  { name: 'violet', main: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9' },
];
const STARTER_COLORS = [0, 1, 2, 3];

function loadBest() {
  try {
    return parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

const cellX = (r, c) => R + c * 2 * R + (r % 2 === 1 ? R : 0);
const cellY = (r) => R + r * ROW_H;

// odd-r offset hex neighbors (odd rows shifted right by R)
function neighborDiffs(r) {
  return r % 2 === 1
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
}

export default function BubblesGame() {
  const canvasRef = useRef(null);
  const g = useRef(null); // mutable game state
  const phaseRef = useRef('ready');
  const bestRef = useRef(loadBest());

  const [phase, setPhase] = useState('ready'); // ready | playing | over | win
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [shots, setShots] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ---------- helpers (all operate on g.current) ----------
  const addScore = (n) => {
    const st = g.current;
    st.score += n;
    setScore(st.score);
    if (st.score > bestRef.current) {
      bestRef.current = st.score;
      setBest(st.score);
      try {
        localStorage.setItem(BEST_KEY, String(st.score));
      } catch {
        /* ignore */
      }
    }
  };

  const colorsOnBoard = () => {
    const st = g.current;
    const set = new Set();
    for (const row of st.grid) for (const v of row) if (v !== -1) set.add(v);
    return [...set];
  };

  const pickNext = () => {
    const present = colorsOnBoard();
    if (!present.length) return 0;
    return present[(Math.random() * present.length) | 0];
  };

  const spawnPop = (r, c, color) => {
    const st = g.current;
    const x = cellX(r, c);
    const y = cellY(r, c);
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 2.5;
      st.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 1, color });
    }
  };

  const snapToCell = (x, y) => {
    const st = g.current;
    let row = Math.round((y - R) / ROW_H);
    row = Math.max(0, Math.min(MAX_ROWS, row));
    const odd = row % 2 === 1;
    let col = Math.round((x - R - (odd ? R : 0)) / (2 * R));
    col = Math.max(0, Math.min(COLS - 1, col));
    while (st.grid.length <= row) st.grid.push(new Array(COLS).fill(-1));
    if (st.grid[row][col] === -1) return { row, col };
    // BFS to nearest empty cell
    const seen = new Set([row + ',' + col]);
    const q = [{ row, col }];
    while (q.length) {
      const cur = q.shift();
      for (const [dr, dc] of neighborDiffs(cur.row)) {
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        if (nr < 0 || nr > MAX_ROWS || nc < 0 || nc >= COLS) continue;
        const key = nr + ',' + nc;
        if (seen.has(key)) continue;
        seen.add(key);
        while (st.grid.length <= nr) st.grid.push(new Array(COLS).fill(-1));
        if (st.grid[nr][nc] === -1) return { row: nr, col: nc };
        q.push({ row: nr, col: nc });
      }
    }
    return null;
  };

  const resolveBoard = (row, col) => {
    const st = g.current;
    const grid = st.grid;
    const color = grid[row][col];

    // 1) flood-fill same color from the placed cell
    const group = [];
    const seen = new Set([row + ',' + col]);
    const stack = [{ row, col }];
    while (stack.length) {
      const cur = stack.pop();
      if (grid[cur.row][cur.col] !== color) continue;
      group.push(cur);
      for (const [dr, dc] of neighborDiffs(cur.row)) {
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        const key = nr + ',' + nc;
        if (nr < 0 || nr >= grid.length || nc < 0 || nc >= COLS || seen.has(key)) continue;
        if (grid[nr][nc] !== color) continue;
        seen.add(key);
        stack.push({ row: nr, col: nc });
      }
    }
    if (group.length >= 3) {
      for (const c of group) {
        spawnPop(c.row, c.col, color);
        grid[c.row][c.col] = -1;
      }
      addScore(group.length * 10);
    }

    // 2) drop floating clusters (BFS anchored from row 0)
    const anchored = new Set();
    const q = [];
    if (grid.length > 0) {
      for (let c = 0; c < COLS; c++) {
        if (grid[0][c] !== -1) {
          anchored.add('0,' + c);
          q.push({ row: 0, col: c });
        }
      }
    }
    while (q.length) {
      const cur = q.shift();
      for (const [dr, dc] of neighborDiffs(cur.row)) {
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        const key = nr + ',' + nc;
        if (nr < 0 || nr >= grid.length || nc < 0 || nc >= COLS || anchored.has(key)) continue;
        if (grid[nr][nc] === -1) continue;
        anchored.add(key);
        q.push({ row: nr, col: nc });
      }
    }
    let dropped = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== -1 && !anchored.has(r + ',' + c)) {
          spawnPop(r, c, grid[r][c]);
          grid[r][c] = -1;
          dropped++;
        }
      }
    }
    if (dropped) addScore(dropped * 5);
  };

  const addRowToTop = () => {
    const st = g.current;
    const row = [];
    for (let c = 0; c < COLS; c++) row.push((Math.random() * COLORS.length) | 0);
    st.grid.unshift(row);
  };

  const checkEnd = () => {
    const st = g.current;
    let any = false;
    let doomed = false;
    for (let r = 0; r < st.grid.length; r++) {
      for (let c = 0; c < COLS; c++) {
        if (st.grid[r][c] !== -1) {
          any = true;
          if (cellY(r) > DANGER_Y) doomed = true;
        }
      }
    }
    if (!any) {
      addScore(500);
      setPhase('win');
      toast.success('Board cleared! +500 bonus');
      return;
    }
    if (doomed) setPhase('over');
  };

  const attachFlying = (f) => {
    const st = g.current;
    if (phaseRef.current !== 'playing') return;
    const cell = snapToCell(f.x, f.y);
    if (!cell) {
      setPhase('over');
      return;
    }
    st.grid[cell.row][cell.col] = f.color;
    resolveBoard(cell.row, cell.col);
    st.shots += 1;
    setShots(st.shots);
    if (st.shots % SHOTS_PER_DROP === 0) addRowToTop();
    st.next = pickNext();
    checkEnd();
  };

  const fire = () => {
    const st = g.current;
    if (!st || phaseRef.current !== 'playing' || st.flying) return;
    const a = st.aim;
    st.flying = {
      x: W / 2,
      y: SHOOTER_Y - R - 2,
      vx: Math.cos(a) * SHOT_SPEED,
      vy: Math.sin(a) * SHOT_SPEED,
      color: st.current,
    };
    st.current = st.next;
    st.next = pickNext();
  };

  const newBoard = () => {
    const grid = [];
    for (let r = 0; r < 5; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) row.push(STARTER_COLORS[(Math.random() * STARTER_COLORS.length) | 0]);
      grid.push(row);
    }
    return grid;
  };

  const resetGame = () => {
    g.current = {
      grid: newBoard(),
      flying: null,
      current: STARTER_COLORS[(Math.random() * STARTER_COLORS.length) | 0],
      next: 0,
      aim: -Math.PI / 2,
      shots: 0,
      particles: [],
      score: 0,
    };
    g.current.next = pickNext();
    setScore(0);
    setShots(0);
  };

  const startGame = () => {
    resetGame();
    setPhase('playing');
  };

  // ---------- game loop ----------
  useEffect(() => {
    resetGame();

    const update = () => {
      const st = g.current;
      if (!st) return;
      const f = st.flying;
      if (f && phaseRef.current === 'playing') {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < R) {
          f.x = R;
          f.vx = -f.vx;
        } else if (f.x > W - R) {
          f.x = W - R;
          f.vx = -f.vx;
        }
        let hit = f.y <= R + 6;
        if (!hit) {
          const rr = (2 * R - 4) * (2 * R - 4);
          outer: for (let r = 0; r < st.grid.length; r++) {
            for (let c = 0; c < COLS; c++) {
              if (st.grid[r][c] === -1) continue;
              const dx = f.x - cellX(r, c);
              const dy = f.y - cellY(r, c);
              if (dx * dx + dy * dy < rr) {
                hit = true;
                break outer;
              }
            }
          }
        }
        if (hit) {
          st.flying = null;
          attachFlying(f);
        }
      }
      // particles
      st.particles = st.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.03;
        return p.life > 0;
      });
    };

    const drawBubble = (ctx, x, y, colorIdx, scale = 1) => {
      const col = COLORS[colorIdx] || COLORS[0];
      const r = R * scale;
      const grad = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 6, x, y, r);
      grad.addColorStop(0, col.light);
      grad.addColorStop(0.55, col.main);
      grad.addColorStop(1, col.dark);
      ctx.beginPath();
      ctx.arc(x, y, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.stroke();
      // highlight
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !g.current) return;
      const ctx = canvas.getContext('2d');
      const st = g.current;

      // background
      ctx.fillStyle = '#0d0d15';
      ctx.fillRect(0, 0, W, H);

      // subtle dot texture
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let yy = 24; yy < H; yy += 48) {
        for (let xx = 24; xx < W; xx += 48) {
          ctx.beginPath();
          ctx.arc(xx, yy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ceiling bar
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(0, 0, W, 10);

      // danger line
      ctx.strokeStyle = 'rgba(239,68,68,0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 7]);
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(W, DANGER_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,68,68,0.55)';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DANGER', 8, DANGER_Y - 6);

      // grid bubbles
      for (let r = 0; r < st.grid.length; r++) {
        for (let c = 0; c < COLS; c++) {
          const v = st.grid[r][c];
          if (v !== -1) drawBubble(ctx, cellX(r, c), cellY(r), v);
        }
      }

      // particles
      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = (COLORS[p.color] || COLORS[0]).main;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const sx = W / 2;

      if (phaseRef.current === 'playing') {
        // aim guide
        const a = st.aim;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(sx, SHOOTER_Y);
        ctx.lineTo(sx + Math.cos(a) * 250, SHOOTER_Y + Math.sin(a) * 250);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // shooter base
      ctx.beginPath();
      ctx.arc(sx, SHOOTER_Y, R + 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251,146,60,0.6)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      drawBubble(ctx, sx, SHOOTER_Y, st.current);

      // next bubble preview
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEXT', sx + 58, SHOOTER_Y - 22);
      drawBubble(ctx, sx + 58, SHOOTER_Y, st.next, 0.62);

      // flying bubble
      if (st.flying) drawBubble(ctx, st.flying.x, st.flying.y, st.flying.color);

      // overlays
      const ph = phaseRef.current;
      if (ph !== 'playing') {
        ctx.fillStyle = 'rgba(5,5,10,0.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        if (ph === 'ready') {
          ctx.fillStyle = '#fdba74';
          ctx.font = '900 34px system-ui, sans-serif';
          ctx.fillText('Aim. Match. Pop.', W / 2, H / 2 - 30);
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.font = '16px system-ui, sans-serif';
          ctx.fillText('Drag to aim — release to fire.', W / 2, H / 2 + 4);
          ctx.fillText('Match 3+ of a color to pop them.', W / 2, H / 2 + 30);
          ctx.fillText('Tap Start below to play!', W / 2, H / 2 + 56);
        } else if (ph === 'over') {
          ctx.fillStyle = '#f87171';
          ctx.font = '900 38px system-ui, sans-serif';
          ctx.fillText('Game Over', W / 2, H / 2 - 24);
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.font = '20px system-ui, sans-serif';
          ctx.fillText('Score: ' + st.score, W / 2, H / 2 + 14);
          ctx.fillText('Best: ' + bestRef.current, W / 2, H / 2 + 44);
        } else if (ph === 'win') {
          ctx.fillStyle = '#fbbf24';
          ctx.font = '900 32px system-ui, sans-serif';
          ctx.fillText('Board Cleared!', W / 2, H / 2 - 24);
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.font = '20px system-ui, sans-serif';
          ctx.fillText('+500 bonus — Score: ' + st.score, W / 2, H / 2 + 14);
          ctx.fillText('Best: ' + bestRef.current, W / 2, H / 2 + 44);
        }
      }
    };

    let raf;
    const tick = () => {
      update();
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- pointer input ----------
  const posFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  };

  const updateAim = (e) => {
    const st = g.current;
    if (!st || phaseRef.current !== 'playing') return;
    const p = posFromEvent(e);
    const dx = p.x - W / 2;
    const dy = p.y - SHOOTER_Y;
    let a = Math.atan2(dy, dx);
    a = Math.max(-Math.PI + 0.12, Math.min(-0.12, a));
    st.aim = a;
  };

  const shotsLeft = SHOTS_PER_DROP - (shots % SHOTS_PER_DROP);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      {/* HUD */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-bold">
            Score: {score}
          </div>
          <div className="px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-bold inline-flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> {best}
          </div>
          {phase === 'playing' && (
            <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm">
              New row in {shotsLeft} {shotsLeft === 1 ? 'shot' : 'shots'}
            </div>
          )}
        </div>
        <button
          onClick={startGame}
          aria-label="Restart game"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Restart
        </button>
      </div>

      {/* canvas */}
      <div className="mx-auto" style={{ maxWidth: 440 }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto block rounded-xl border border-white/10 touch-none select-none cursor-crosshair"
          style={{ aspectRatio: '480/640' }}
          onPointerDown={updateAim}
          onPointerMove={updateAim}
          onPointerUp={(e) => {
            updateAim(e);
            fire();
          }}
        />
      </div>

      {/* controls */}
      <div className="mt-4 flex justify-center">
        {phase === 'ready' && (
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
          >
            <Play className="w-6 h-6" /> Start Game
          </button>
        )}
        {(phase === 'over' || phase === 'win') && (
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
          >
            <RotateCcw className="w-6 h-6" /> Play Again
          </button>
        )}
      </div>
      {phase === 'playing' && (
        <p className="text-center text-slate-500 text-sm mt-3">Drag to aim — release (or tap) to fire</p>
      )}
    </div>
  );
}

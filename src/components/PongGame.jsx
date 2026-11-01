// Se Fire Pong — canvas pong vs AI. No external assets.
import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const W = 600;
const H = 400;
const PADDLE_W = 12;
const PADDLE_H = 84;
const PLAYER_X = 24;
const AI_X = W - 36;
const BALL_R = 8;
const WIN_SCORE = 11;
const SERVE_SPEED = 5;
const MAX_SPEED = 11.5;
const SPEEDUP = 0.35;
const PAUSE_MS = 900;

function loadWins() {
  try {
    return parseInt(localStorage.getItem('sfpong:wins'), 10) || 0;
  } catch {
    return 0;
  }
}

function saveWins(n) {
  try {
    localStorage.setItem('sfpong:wins', String(n));
  } catch {
    // ignore
  }
}

export default function PongGame() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('serve'); // serve | playing | over
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [winner, setWinner] = useState(null); // 'player' | 'ai'
  const [wins, setWins] = useState(loadWins);

  const state = useRef({
    playerY: H / 2 - PADDLE_H / 2,
    targetY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
    serveTimer: 0,
  });

  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const phaseRef = useRef('serve');
  phaseRef.current = phase;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Serve the ball toward a direction: 'player' (left), 'ai' (right), or random
  const serve = useCallback((toward) => {
    const s = state.current;
    const angle = (Math.random() * 70 - 35) * (Math.PI / 180); // ±35°
    const dir = toward === 'player' ? -1 : toward === 'ai' ? 1 : Math.random() < 0.5 ? -1 : 1;
    s.ball.x = W / 2;
    s.ball.y = H / 2;
    s.ball.vx = dir * SERVE_SPEED * Math.cos(angle);
    s.ball.vy = SERVE_SPEED * Math.sin(angle);
    s.playerY = H / 2 - PADDLE_H / 2;
    s.targetY = H / 2 - PADDLE_H / 2;
    s.aiY = H / 2 - PADDLE_H / 2;
  }, []);

  const startGame = useCallback(() => {
    playerScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    serve(Math.random() < 0.5 ? 'player' : 'ai');
    setPhase('playing');
  }, [serve]);

  // Convert a pointer event to logical canvas coords and set paddle target
  const pointToTarget = useCallback((clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const logicalY = ((clientY - rect.top) / rect.height) * H;
    state.current.targetY = clamp(logicalY - PADDLE_H / 2, 0, H - PADDLE_H);
  }, []);

  // ---- drawing ----
  const draw = useCallback((ctx) => {
    // bg
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    const s = state.current;

    // center dashed line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 8);
    ctx.lineTo(W / 2, H - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // big translucent scores
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '900 96px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(playerScoreRef.current), W / 2 - 70, H / 2);
    ctx.fillText(String(aiScoreRef.current), W / 2 + 70, H / 2);

    // paddles — orange gradient
    const paddle = (x, y) => {
      const g = ctx.createLinearGradient(x, y, x, y + PADDLE_H);
      g.addColorStop(0, '#fdba74');
      g.addColorStop(0.5, '#f97316');
      g.addColorStop(1, '#c2410c');
      ctx.fillStyle = g;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      const r = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, PADDLE_W, PADDLE_H, r);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    paddle(PLAYER_X, s.playerY);
    paddle(AI_X, s.aiY);

    // ball — glowing orange
    const b = s.ball;
    if (phaseRef.current === 'playing') {
      const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, BALL_R * 2.2);
      bg.addColorStop(0, '#fff7ed');
      bg.addColorStop(0.45, '#fdba74');
      bg.addColorStop(1, '#f97316');
      ctx.fillStyle = bg;
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // serve prompt
    if (phaseRef.current === 'serve') {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '600 22px system-ui, sans-serif';
      ctx.fillText('Tap to serve', W / 2, H / 2);
    }
  }, []);

  // ---- physics step ----
  const step = useCallback(() => {
    const s = state.current;

    // player paddle eases toward target
    s.playerY += (s.targetY - s.playerY) * 0.22;
    s.playerY = clamp(s.playerY, 0, H - PADDLE_H);

    // AI: chase when ball approaches, drift to center otherwise
    const maxSpeed = Math.min(6.8, 4.3 + playerScoreRef.current * 0.18);
    if (s.ball.vx > 0) {
      const error = Math.sin(Date.now() / 700) * 10; // small human-like error
      const target = clamp(s.ball.y - PADDLE_H / 2 + error, 0, H - PADDLE_H);
      const dy = target - s.aiY;
      s.aiY += clamp(dy, -maxSpeed, maxSpeed);
    } else {
      const target = H / 2 - PADDLE_H / 2;
      const dy = target - s.aiY;
      s.aiY += clamp(dy, -2.2, 2.2);
    }

    // ball
    const b = s.ball;
    b.x += b.vx;
    b.y += b.vy;

    // top/bottom walls
    if (b.y - BALL_R < 0) {
      b.y = BALL_R;
      b.vy = -b.vy;
    } else if (b.y + BALL_R > H) {
      b.y = H - BALL_R;
      b.vy = -b.vy;
    }

    // player paddle collision
    if (
      b.vx < 0 &&
      b.x - BALL_R <= PLAYER_X + PADDLE_W &&
      b.x - BALL_R >= PLAYER_X - 6 &&
      b.y >= s.playerY - BALL_R &&
      b.y <= s.playerY + PADDLE_H + BALL_R
    ) {
      const offset = clamp((b.y - (s.playerY + PADDLE_H / 2)) / (PADDLE_H / 2), -1, 1);
      const speed = Math.min(MAX_SPEED, Math.hypot(b.vx, b.vy) + SPEEDUP);
      b.vx = speed * Math.cos(offset * 0.7);
      b.vy = clamp(offset * 7, -7, 7);
      b.x = PLAYER_X + PADDLE_W + BALL_R;
    }

    // AI paddle collision
    if (
      b.vx > 0 &&
      b.x + BALL_R >= AI_X &&
      b.x + BALL_R <= AI_X + PADDLE_W + 6 &&
      b.y >= s.aiY - BALL_R &&
      b.y <= s.aiY + PADDLE_H + BALL_R
    ) {
      const offset = clamp((b.y - (s.aiY + PADDLE_H / 2)) / (PADDLE_H / 2), -1, 1);
      const speed = Math.min(MAX_SPEED, Math.hypot(b.vx, b.vy));
      b.vx = -speed * Math.cos(offset * 0.7);
      b.vy = clamp(offset * 7, -7, 7);
      b.x = AI_X - BALL_R;
    }

    // scoring
    if (b.x < -20) {
      // AI scores
      b.vx = 0;
      b.vy = 0;
      const next = aiScoreRef.current + 1;
      aiScoreRef.current = next;
      setAiScore(next);
      if (next >= WIN_SCORE) {
        setWinner('ai');
        setPhase('over');
      } else {
        s.serveTimer = Date.now() + PAUSE_MS;
        setTimeout(() => {
          if (phaseRef.current === 'playing') serve('ai');
        }, PAUSE_MS);
      }
    } else if (b.x > W + 20) {
      // player scores
      b.vx = 0;
      b.vy = 0;
      const next = playerScoreRef.current + 1;
      playerScoreRef.current = next;
      setPlayerScore(next);
      if (next >= WIN_SCORE) {
        setWinner('player');
        setWins((w) => {
          const nw = w + 1;
          saveWins(nw);
          return nw;
        });
        setPhase('over');
      } else {
        setTimeout(() => {
          if (phaseRef.current === 'playing') serve('player');
        }, PAUSE_MS);
      }
    }
  }, [serve]);

  // ---- main loop ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const loop = () => {
      if (phaseRef.current === 'playing') step();
      draw(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [step, draw]);

  // pointer + keyboard controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e) => pointToTarget(e.clientY);
    const onPointerDown = (e) => {
      pointToTarget(e.clientY);
      if (phaseRef.current === 'serve') {
        serve(Math.random() < 0.5 ? 'player' : 'ai');
        setPhase('playing');
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        state.current.targetY = clamp(state.current.targetY - 28, 0, H - PADDLE_H);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        state.current.targetY = clamp(state.current.targetY + 28, 0, H - PADDLE_H);
        e.preventDefault();
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [serve, pointToTarget]);

  return (
    <div className="rounded-2xl border border-orange-500/25 bg-black/40 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">
          <span className="text-orange-300">You</span>
          <span className="text-slate-500 mx-2">·</span>
          <span className="text-slate-300">AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black tabular-nums">
            <span className="text-orange-400">{playerScore}</span>
            <span className="text-slate-600 mx-1.5">–</span>
            <span className="text-slate-300">{aiScore}</span>
          </div>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-white/10 hover:bg-white/15 border border-white/15 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full max-w-[620px] mx-auto block rounded-xl border border-white/10 select-none"
          style={{ aspectRatio: '600/400', touchAction: 'none', cursor: 'none' }}
        />

        {phase === 'serve' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => {
                serve(Math.random() < 0.5 ? 'player' : 'ai');
                setPhase('playing');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <Play className="w-5 h-5" /> Tap to serve
            </button>
          </div>
        )}

        {phase === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 rounded-xl">
            {winner === 'player' ? (
              <>
                <Trophy className="w-10 h-10 text-yellow-400" />
                <div className="text-2xl font-black text-orange-300">You win!</div>
                <p className="text-slate-400 text-sm">The rally is yours. Matches won: {wins}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-slate-300">AI wins</div>
                <p className="text-slate-400 text-sm">Rematch? The machine is waiting.</p>
              </>
            )}
            <button
              onClick={startGame}
              className="mt-1 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/30 transition active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-slate-500 text-xs mt-3">
        Move your mouse or drag to move your paddle · W/S or arrow keys work too · First to 11
      </p>
    </div>
  );
}

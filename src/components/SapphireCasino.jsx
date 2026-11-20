// ============================================================================
// SapphireCasino.jsx — Sapphire Spins, a standalone Se Fire fleet app.
// A play-money casino lobby: eight games on ONE shared credit wallet.
//   - Sapphire Reels · Ember 21 · Ember Wheel · Fire Draw Poker
//   - Blaze Banco · Ember Dice · Dice Divide · Signal Cards
// Play credits have no cash value, no transfers and no prizes. No accounts,
// no sign-in, no server calls besides the fleet PayPal endpoints. The wallet,
// daily bonus and stats all persist in localStorage on this device.
// Background music is Steve's own catalogue (Se Fire) — see lib/music.jsx.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Crown, Gift, BarChart3, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PayPalCheckout, { hasProAccess } from './PayPalCheckout.jsx';
import { isFounder } from '../lib/founder.js';
import { utcDayKey } from '../lib/arcade.js';
import { FREE_MAX_BET, controlClass } from './games/ui.jsx';
import { MusicToggle } from '../lib/music.jsx';
import Legal, { LEGAL_IDS } from './Legal.jsx';
import SapphireReels from './games/SapphireReels.jsx';
import Ember21 from './games/Ember21.jsx';
import EmberWheel from './games/EmberWheel.jsx';
import FireDrawPoker from './games/FireDrawPoker.jsx';
import BlazeBanco from './games/BlazeBanco.jsx';
import EmberDice from './games/EmberDice.jsx';
import DiceDivide from './games/DiceDivide.jsx';
import SignalCards from './games/SignalCards.jsx';

const BALANCE_KEY = 'sapphire-spins-balance-v1';
const BONUS_KEY = 'sapphire-spins-bonus-v1';
const STATS_KEY = 'sapphire-spins:stats';
const START_BALANCE = 1000;
const DAILY_BONUS = 1000;
const MIN_STAKE = 5;

const GAME_DEFS = [
  { id: 'reels', name: 'Sapphire Reels', icon: '💎', blurb: 'Three weighted reels. Match three sapphires for 100× — any pair returns your stake.' },
  { id: 'ember21', name: 'Ember 21', icon: '🃏', blurb: 'Beat the dealer to 21. A natural pays 3:2, the dealer stands on every 17.' },
  { id: 'wheel', name: 'Ember Wheel', icon: '🎡', blurb: 'A single-zero numbered wheel. Red, black, even, odd — or one number at 35:1.' },
  { id: 'poker', name: 'Fire Draw Poker', icon: '🔥', blurb: 'Five-card draw, jacks or better. Hold your cards, draw the rest, chase the royal.' },
  { id: 'banco', name: 'Blaze Banco', icon: '♠️', blurb: 'Player, Banker or Tie — closest to 9 wins, with the full third-card rules.' },
  { id: 'emberdice', name: 'Ember Dice', icon: '🎲', blurb: 'Pass-line dice. Set the point, then roll it again before a seven-out.' },
  { id: 'dicedivide', name: 'Dice Divide', icon: '7️⃣', blurb: 'Pick a side of seven and roll two dice. A correct pick doubles your stake.' },
  { id: 'signalcards', name: 'Signal Cards', icon: '↕️', blurb: 'Higher or lower than the current rank? The odds move with every card.' },
];

const GAME_COMPONENTS = {
  reels: SapphireReels,
  ember21: Ember21,
  wheel: EmberWheel,
  poker: FireDrawPoker,
  banco: BlazeBanco,
  emberdice: EmberDice,
  dicedivide: DiceDivide,
  signalcards: SignalCards,
};

const emptyGameStats = () => ({ plays: 0, wagered: 0, returned: 0 });
const emptyStats = () =>
  Object.fromEntries(GAME_DEFS.map((g) => [g.id, emptyGameStats()]));

function readBalance() {
  try {
    const saved = localStorage.getItem(BALANCE_KEY);
    const number = Number(saved);
    if (saved !== null && Number.isSafeInteger(number) && number >= 0) {
      return number;
    }
  } catch {
    // storage unavailable
  }
  return START_BALANCE;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

export default function SapphireCasino() {
  const [balance, setBalanceState] = useState(readBalance);
  const balanceRef = useRef(balance);
  const [view, setView] = useState('lobby'); // 'lobby' or a game id
  const [stats, setStats] = useState(() => readJSON(STATS_KEY, emptyStats()));
  const [bonusDay, setBonusDay] = useState(() => {
    try {
      return localStorage.getItem(BONUS_KEY);
    } catch {
      return null;
    }
  });
  const [pro, setPro] = useState(() => hasProAccess());
  const proRef = useRef(pro);
  proRef.current = pro;
  const founder = isFounder();

  // PayPalCheckout records a purchase in localStorage; pick it up promptly.
  useEffect(() => {
    const t = setInterval(() => setPro(hasProAccess()), 1500);
    return () => clearInterval(t);
  }, []);

  const setBalance = useCallback((next) => {
    const safe = Math.max(0, Math.floor(next));
    balanceRef.current = safe;
    setBalanceState(safe);
    try {
      localStorage.setItem(BALANCE_KEY, String(safe));
    } catch {
      // storage unavailable
    }
  }, []);

  const record = useCallback((gameId, wagered, returned) => {
    setStats((prev) => {
      const g = prev[gameId] || emptyGameStats();
      const next = {
        ...prev,
        [gameId]: {
          plays: g.plays + 1,
          wagered: g.wagered + wagered,
          returned: g.returned + returned,
        },
      };
      save(STATS_KEY, next);
      return next;
    });
  }, []);

  // A bet is valid when it is a positive whole number, covered by the
  // balance, and — for free players — within the free-tier cap.
  const validBet = useCallback(
    (amount) =>
      Number.isInteger(amount) &&
      amount > 0 &&
      amount <= balanceRef.current &&
      (proRef.current || amount <= FREE_MAX_BET),
    []
  );

  // Instant settlement for single-action games (slots, wheel, ports):
  // balance += floor(stake × multiple) − stake. Returns the credits
  // returned, or null when the bet was rejected.
  const settle = useCallback(
    (gameId, stake, multiple) => {
      if (!validBet(stake)) return null;
      const returned = Math.floor(stake * multiple + 1e-9);
      setBalance(balanceRef.current + returned - stake);
      record(gameId, stake, returned);
      return returned;
    },
    [validBet, setBalance, record]
  );

  // Debit / credit for multi-step games (21, poker, banco, dice): the stake
  // leaves the wallet when the hand starts and winnings return at the end,
  // so the balance can never go below zero mid-hand.
  const debit = useCallback(
    (amount) => {
      if (!validBet(amount)) return false;
      setBalance(balanceRef.current - amount);
      return true;
    },
    [validBet, setBalance]
  );

  const credit = useCallback(
    (amount) => {
      if (amount > 0) setBalance(balanceRef.current + amount);
    },
    [setBalance]
  );

  const today = utcDayKey();
  const bonusReady = bonusDay !== today;

  const claimBonus = () => {
    if (!bonusReady) return;
    setBalance(balanceRef.current + DAILY_BONUS);
    try {
      localStorage.setItem(BONUS_KEY, today);
    } catch {
      // storage unavailable
    }
    setBonusDay(today);
    toast.success('Daily bonus claimed — +' + DAILY_BONUS.toLocaleString() + ' credits 💎');
  };

  // Play-money safety net (as in Northline): a broke player can top back up
  // to the starting balance so the floor never dead-ends.
  const claimRefill = () => {
    if (balanceRef.current >= MIN_STAKE) return;
    setBalance(START_BALANCE);
    toast.success('House refill — back to ' + START_BALANCE.toLocaleString() + ' credits');
  };

  const totals = Object.values(stats).reduce(
    (acc, g) => ({
      plays: acc.plays + g.plays,
      wagered: acc.wagered + g.wagered,
      returned: acc.returned + g.returned,
    }),
    { plays: 0, wagered: 0, returned: 0 }
  );

  const isLegal = LEGAL_IDS.includes(view);
  const ActiveGame =
    view !== 'lobby' && !isLegal ? GAME_COMPONENTS[view] : null;
  const activeDef = GAME_DEFS.find((g) => g.id === view);

  return (
    <div
      className="sapphire min-h-screen text-[var(--text)]"
      style={{
        backgroundColor: 'var(--bg)',
        backgroundImage:
          'radial-gradient(ellipse at 85% 0%, #1b3a75, transparent 50%), radial-gradient(ellipse at 0% 100%, #241a4d, transparent 45%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <main className="max-w-[70rem] mx-auto p-[clamp(1rem,5vw,4rem)]">
        {/* Persistent header: brand, music toggle, wallet. */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => setView('lobby')}
              className="text-left cursor-pointer bg-transparent border-0 p-0"
              aria-label="Sapphire Spins — back to the lobby"
            >
              <h1 className="font-[Georgia,serif] text-[clamp(2.4rem,7vw,4.5rem)] leading-none tracking-[-0.03em]">
                Sapphire <span className="text-[var(--gold)]">Spins</span>
              </h1>
            </button>
            <p className="text-[var(--muted)] mt-2">
              Eight games. One wallet of free play credits.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <MusicToggle />
            <div className="border border-[var(--edge)] bg-[var(--panel)] rounded-2xl px-5 py-3 text-[var(--muted)]">
              Play credits
              <strong
                className="block text-[var(--gold)] text-[1.65rem] tabular-nums"
                aria-live="polite"
              >
                {balance.toLocaleString()}
              </strong>
            </div>
            <button
              onClick={claimBonus}
              disabled={!bonusReady}
              className={
                controlClass +
                ' inline-flex items-center gap-2 !rounded-full font-semibold' +
                (bonusReady ? ' !border-[var(--gold-deep)] !bg-[var(--gold)] !text-[#241a02]' : '')
              }
            >
              <Gift className="w-4 h-4" />
              {bonusReady
                ? 'Claim daily bonus +' + DAILY_BONUS.toLocaleString()
                : 'Daily bonus claimed — back tomorrow'}
            </button>
            {balance < MIN_STAKE && (
              <button onClick={claimRefill} className={controlClass + ' !rounded-full'}>
                House refill to {START_BALANCE.toLocaleString()}
              </button>
            )}
          </div>
        </header>

        {view === 'lobby' ? (
          <>
            {/* The floor — game cards grid. */}
            <nav
              aria-label="Choose a game"
              className="grid gap-3 mt-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {GAME_DEFS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setView(g.id)}
                  className="text-left border border-[var(--edge)] rounded-2xl bg-[var(--panel)] p-5 cursor-pointer transition hover:border-[var(--gold)] hover:bg-[var(--panel-2)] min-h-[44px]"
                >
                  <span className="text-4xl block mb-3" aria-hidden="true">
                    {g.icon}
                  </span>
                  <span className="block font-bold text-lg">{g.name}</span>
                  <span className="block text-[var(--muted)] text-sm mt-1">
                    {g.blurb}
                  </span>
                </button>
              ))}
            </nav>

            <p className="text-[var(--muted)] mt-4 inline-flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" />
              {pro
                ? 'Pro is active — uncapped bets and VIP stakes up to 1,000 are unlocked at every table.'
                : 'Free bets cap at ' + FREE_MAX_BET + ' credits. Pro unlocks uncapped bets and VIP stakes.'}
            </p>

            {/* Stats — Pro perk, kept locally on this device. */}
            <section className="mt-12" aria-labelledby="stats-title">
              <h2
                id="stats-title"
                className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
              >
                <BarChart3 className="w-6 h-6 text-[var(--gold)]" /> Your stats
              </h2>
              {pro ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {GAME_DEFS.map((g) => {
                    const s = stats[g.id] || emptyGameStats();
                    return (
                      <article
                        key={g.id}
                        className="border border-[var(--edge)] rounded-2xl p-4 bg-[var(--panel)]"
                      >
                        <h3 className="font-bold mb-2">{g.name}</h3>
                        <p className="text-[var(--muted)] text-[0.9rem]">
                          {s.plays} plays · {s.wagered.toLocaleString()} wagered ·{' '}
                          {s.returned.toLocaleString()} returned · Net{' '}
                          {(s.returned - s.wagered).toLocaleString()}
                        </p>
                      </article>
                    );
                  })}
                  <p className="text-[var(--muted)] text-[0.9rem] sm:col-span-2 lg:col-span-4">
                    All games: {totals.plays} plays ·{' '}
                    {totals.wagered.toLocaleString()} credits wagered ·{' '}
                    {totals.returned.toLocaleString()} returned. Stats live on
                    this device only.
                  </p>
                </div>
              ) : (
                <p className="text-[var(--muted)] inline-flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Full casino stats are a Pro perk.
                </p>
              )}
            </section>

            {/* Membership — fleet PayPal flow ($4.99/mo · $49.99/yr · $99.99 lifetime). */}
            <section className="mt-12" aria-labelledby="membership-title">
              <h2
                id="membership-title"
                className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
              >
                <Crown className="w-6 h-6 text-[var(--gold)]" /> Casino membership
              </h2>
              <p className="text-[var(--muted)] mb-4" role="status">
                {founder
                  ? 'Founder access — every Pro perk is unlocked. 👑'
                  : pro
                    ? 'Pro is active on this device — uncapped bets, VIP stakes and full stats are unlocked.'
                    : 'All eight games are always free, with a daily bonus. Go Pro to unlock uncapped bets, VIP stakes up to 1,000 credits and full casino stats.'}
              </p>
              <PayPalCheckout appName="Sapphire Spins" />
            </section>
          </>
        ) : (
          <>
            <button
              onClick={() => setView('lobby')}
              className={controlClass + ' inline-flex items-center gap-2 mt-8'}
            >
              <ArrowLeft className="w-4 h-4" /> Back to the lobby
            </button>
            {isLegal ? (
              <div className="mt-4">
                <Legal doc={view} />
              </div>
            ) : (
              <section
                className="bg-[var(--panel)] border border-[var(--edge)] rounded-[1.15rem] p-[clamp(1rem,4vw,2.4rem)] mt-4"
                aria-labelledby="game-title"
              >
                <h2 id="game-title" className="text-[clamp(1.5rem,4vw,2.4rem)] mb-1.5">
                  {activeDef.icon} {activeDef.name}
                </h2>
                <p className="text-[var(--muted)] mb-2">{activeDef.blurb}</p>
                <ActiveGame
                  balance={balance}
                  pro={pro}
                  settle={settle}
                  debit={debit}
                  credit={credit}
                  record={record}
                />
              </section>
            )}
          </>
        )}

        <footer className="mt-12 text-[var(--muted)] text-[0.85rem] space-y-1.5">
          <p>
            Sapphire Spins by Se Fire Tech. Play credits are for fun only —
            they have no cash value, cannot be transferred, and win no prizes.
          </p>
          <p>
            🎵 Music by <strong className="text-[var(--text)]">Se Fire</strong> —
            “On Tha Grind”, “West Coast Cruzin”, “Chillin In Tha Studio” and
            “Goin Hard”, from the Se Fire catalogue.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {[
              ['privacy', 'Privacy Policy'],
              ['terms', 'Terms of Use'],
              ['refunds', 'Cancellation & Refunds'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className="underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 text-[var(--muted)] hover:text-[var(--gold)] min-h-[44px]"
              >
                {label}
              </button>
            ))}
          </nav>
        </footer>
      </main>
    </div>
  );
}

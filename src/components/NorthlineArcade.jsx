// ============================================================================
// NorthlineArcade.jsx — Northline Arcade, rebuilt as a standalone Se Fire
// fleet app. Game rules/odds ported faithfully from the original build
// (see src/lib/games.js). The original's account-based perks are local here:
//   - Aurora / Midnight / Copper Lights themes  → Pro perk (was Plus/Pro/pack)
//   - Daily number challenge + stats            → Pro perk, localStorage
//   - Cloud save                                → not needed: the balance and
//                                                 all records persist locally
// No accounts, no sign-in, no server calls besides the fleet PayPal endpoints.
// ============================================================================

import { useEffect, useState } from 'react';
import { Lock, Crown, Palette, Trophy, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import PayPalCheckout, { hasProAccess } from './PayPalCheckout.jsx';
import { isFounder } from '../lib/founder.js';
import {
  GAMES,
  THEMES,
  reelsStart,
  playReels,
  diceStart,
  playDice,
  cardsStart,
  playCards,
  cardsChance,
  cardsMultipleLabel,
  rankLabel,
  roll,
  utcDayKey,
  rollChallenge,
} from '../lib/games.js';

const BALANCE_KEY = 'northline-arcade-balance-v1'; // same key as the original
const THEME_KEY = 'northline:theme';
const STATS_KEY = 'northline:stats';
const CHALLENGE_KEY = 'northline:challenge';
const START_BALANCE = 500;
const STAKES = [5, 10, 25, 50];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

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

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

const emptyGameStats = () => ({ plays: 0, wagered: 0, returned: 0 });
const emptyStats = () => ({
  reels: emptyGameStats(),
  dice: emptyGameStats(),
  cards: emptyGameStats(),
});

const controlClass =
  'border border-[var(--edge)] rounded-[0.65rem] bg-[var(--panel)] px-3.5 py-2.5 min-h-[44px] cursor-pointer transition hover:border-[var(--violet)] disabled:opacity-50 disabled:cursor-default';
const actionClass =
  'border border-[var(--edge)] rounded-[0.65rem] bg-[var(--lime)] text-[#1c2410] font-bold px-3.5 py-2.5 min-h-[44px] cursor-pointer transition hover:border-[var(--violet)] disabled:opacity-50 disabled:cursor-default';

export default function NorthlineArcade() {
  const [balance, setBalance] = useState(readBalance);
  const [game, setGame] = useState('reels');
  const [stake, setStake] = useState(5);
  const [faces, setFaces] = useState(reelsStart);
  const [result, setResult] = useState('');
  // Signal Cards starting rank: session state, exactly like the original
  // (it persisted across plays within a page session, not across reloads).
  const [nextRank, setNextRank] = useState(() => roll(13));
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'original';
    } catch {
      return 'original';
    }
  });
  const [stats, setStats] = useState(() => readJSON(STATS_KEY, emptyStats()));
  const [challenge, setChallenge] = useState(() =>
    readJSON(CHALLENGE_KEY, { day: null, roll: null, plays: 0, hits: 0 })
  );
  const [pro, setPro] = useState(() => hasProAccess());
  const founder = isFounder();

  // PayPalCheckout records a purchase in localStorage; pick it up promptly.
  useEffect(() => {
    const t = setInterval(() => setPro(hasProAccess()), 1500);
    return () => clearInterval(t);
  }, []);

  // Apply the active theme palette (falls back to Original while locked).
  const activeThemeId =
    THEMES[theme] && (!THEMES[theme].pro || pro) ? theme : 'original';
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(THEMES[activeThemeId].palette)) {
      root.style.setProperty('--' + name, value);
    }
  }, [activeThemeId]);

  const current = GAMES[game];
  const today = utcDayKey();
  const playedToday = challenge.day === today && challenge.roll != null;

  const selectGame = (id) => {
    setGame(id);
    setResult('');
    if (id === 'reels') setFaces(reelsStart());
    else if (id === 'dice') setFaces(diceStart());
    else setFaces(cardsStart(nextRank));
  };

  const handlePlay = (choice) => {
    if (stake > balance) return;
    let outcome;
    if (game === 'reels') {
      outcome = playReels();
    } else if (game === 'dice') {
      outcome = playDice(choice);
    } else {
      if (cardsChance(nextRank, choice) === 0) return;
      outcome = playCards(nextRank, choice);
      setNextRank(outcome.nextRank);
    }
    // Settlement, exactly as the original: floor(stake × multiple), then
    // balance += returned − stake.
    const returned = Math.floor(stake * outcome.multiple + 1e-9);
    const newBalance = balance + returned - stake;
    setBalance(newBalance);
    try {
      localStorage.setItem(BALANCE_KEY, String(newBalance));
    } catch {
      // storage unavailable
    }
    setFaces(outcome);
    setResult(
      outcome.detail +
        ' · ' +
        (returned === stake
          ? 'Stake returned'
          : returned
            ? returned + ' credits returned'
            : 'No credits returned') +
        (newBalance < 5 ? ' · Refill to keep playing.' : '')
    );
    setStats((prev) => {
      const next = {
        ...prev,
        [game]: {
          plays: prev[game].plays + 1,
          wagered: prev[game].wagered + stake,
          returned: prev[game].returned + returned,
        },
      };
      save(STATS_KEY, next);
      return next;
    });
  };

  const handleRefill = () => {
    if (balance >= START_BALANCE) return;
    setBalance(START_BALANCE);
    try {
      localStorage.setItem(BALANCE_KEY, String(START_BALANCE));
    } catch {
      // storage unavailable
    }
    setResult('Refilled to 500 credits.');
  };

  const chooseTheme = (id) => {
    const t = THEMES[id];
    if (t.pro && !pro) {
      toast.info('The ' + t.name + ' theme is a Pro perk — Go Pro to unlock it.');
      return;
    }
    setTheme(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      // storage unavailable
    }
  };

  const playChallenge = (pick) => {
    if (playedToday) return;
    const rolled = rollChallenge();
    const next = {
      day: today,
      roll: rolled,
      plays: challenge.plays + 1,
      hits: challenge.hits + (rolled === pick ? 1 : 0),
    };
    setChallenge(next);
    save(CHALLENGE_KEY, next);
  };

  const oddsLine =
    current.odds ??
    'Next starting rank ' +
      rankLabel(nextRank) +
      ' · Multipliers rounded down to whole credits on settlement.';

  const totals = Object.values(stats).reduce(
    (acc, g) => ({
      plays: acc.plays + g.plays,
      wagered: acc.wagered + g.wagered,
      returned: acc.returned + g.returned,
    }),
    { plays: 0, wagered: 0, returned: 0 }
  );

  return (
    <div
      className="northline min-h-screen text-[var(--text)]"
      style={{
        backgroundColor: 'var(--bg)',
        backgroundImage:
          'radial-gradient(ellipse at 85% 0%, #32224b, transparent 48%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <main className="max-w-[70rem] mx-auto p-[clamp(1rem,5vw,4rem)]">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-[Georgia,serif] text-[clamp(2.8rem,8vw,6rem)] leading-none tracking-[-0.055em]">
              Northline Arcade
            </h1>
            <p className="text-[var(--muted)] mt-3">
              Three games. One free-play credit balance.
            </p>
          </div>
          <div className="border border-[var(--edge)] bg-[var(--panel)] rounded-2xl px-5 py-3 text-[var(--muted)]">
            Play credits
            <strong
              className="block text-[var(--lime)] text-[1.65rem] tabular-nums"
              aria-live="polite"
            >
              {balance.toLocaleString()}
            </strong>
          </div>
        </header>

        <nav
          aria-label="Choose a game"
          className="grid grid-cols-3 gap-[0.65rem] mt-8 mb-4"
        >
          {Object.values(GAMES).map((g) => (
            <button
              key={g.id}
              onClick={() => selectGame(g.id)}
              aria-pressed={String(game === g.id)}
              className={
                controlClass +
                (game === g.id
                  ? ' bg-[var(--lime)] text-[#1c2410] font-bold'
                  : '')
              }
            >
              {g.name}
            </button>
          ))}
        </nav>

        <section
          className="bg-[var(--panel)] border border-[var(--edge)] rounded-[1.15rem] p-[clamp(1rem,4vw,2.4rem)]"
          aria-labelledby="game-title"
        >
          <h2
            id="game-title"
            className="text-[clamp(1.5rem,4vw,2.4rem)] mb-1.5"
          >
            {current.name}
          </h2>
          <p className="text-[var(--muted)]">{current.rules}</p>
          <p className="text-[var(--muted)] text-[0.9rem] mt-2">{oddsLine}</p>

          <div
            className="my-6 min-h-[9rem] flex gap-[clamp(0.35rem,2vw,1rem)] items-center justify-center rounded-[0.85rem] p-3.5"
            style={{
              background:
                'radial-gradient(ellipse at center, #3d2c54, #151321)',
            }}
            role="img"
            aria-label={faces.label}
          >
            {faces.faces.map((face, i) => (
              <span
                key={i}
                className="grid place-items-center bg-[#25213a] border border-[#765a9b] text-[#eee3ff] rounded-[0.85rem] w-[clamp(3.8rem,18vw,7rem)] aspect-square font-bold text-[clamp(1.7rem,6vw,3.6rem)] leading-none"
                aria-hidden="true"
              >
                {face}
              </span>
            ))}
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <label className="grid gap-1.5 text-[var(--muted)]" htmlFor="stake">
              Credits to play
              <select
                id="stake"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className={controlClass}
              >
                {STAKES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              {current.choices.map((choice) => {
                const chance =
                  game === 'cards' ? cardsChance(nextRank, choice) : undefined;
                const label = chance
                  ? choice + ' · ' + cardsMultipleLabel(chance)
                  : choice;
                return (
                  <button
                    key={choice}
                    onClick={() => handlePlay(choice)}
                    disabled={balance < stake || chance === 0}
                    className={actionClass}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 min-h-[1.5em] text-[var(--lime)] font-semibold" role="status">
            {result}
          </p>
        </section>

        <div className="flex items-center justify-between gap-3 flex-wrap mt-4 text-[var(--muted)]">
          <p>Play credits have no cash value.</p>
          <button
            onClick={handleRefill}
            disabled={balance >= START_BALANCE}
            className={controlClass}
          >
            Refill to 500 credits
          </button>
        </div>

        {/* Themes — Original free; Aurora, Midnight & Copper Lights are Pro. */}
        <section className="mt-12" aria-labelledby="themes-title">
          <h2
            id="themes-title"
            className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
          >
            <Palette className="w-6 h-6 text-[var(--violet)]" /> Themes
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(THEMES).map((t) => {
              const locked = t.pro && !pro;
              return (
                <button
                  key={t.id}
                  onClick={() => chooseTheme(t.id)}
                  aria-pressed={String(activeThemeId === t.id)}
                  className={
                    controlClass +
                    ' inline-flex items-center gap-2' +
                    (activeThemeId === t.id
                      ? ' bg-[var(--lime)] text-[#1c2410] font-bold'
                      : '')
                  }
                >
                  {locked && <Lock className="w-4 h-4" />}
                  {t.name} theme
                </button>
              );
            })}
          </div>
          {!pro && (
            <p className="text-[var(--muted)] mt-2 text-[0.9rem]">
              Aurora, Midnight and Copper Lights are Pro perks.
            </p>
          )}
        </section>

        {/* Daily number challenge — Pro perk, ported to a local daily roll. */}
        <section className="mt-12" aria-labelledby="challenge-title">
          <h2
            id="challenge-title"
            className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
          >
            <Trophy className="w-6 h-6 text-[var(--violet)]" /> Daily number
            challenge
          </h2>
          {pro ? (
            <>
              <p className="text-[var(--muted)]">
                Pick a number from 1 to 6. A correct guess counts toward your
                stats. A new round opens at midnight UTC.
              </p>
              {!playedToday && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => playChallenge(n)}
                      className={controlClass}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[var(--lime)] font-semibold" role="status">
                {(playedToday
                  ? 'Today’s number was ' + challenge.roll + '. '
                  : '') +
                  'All-time record ' +
                  challenge.hits +
                  ' correct in ' +
                  challenge.plays +
                  ' plays.'}
              </p>
            </>
          ) : (
            <p className="text-[var(--muted)] inline-flex items-center gap-2">
              <Lock className="w-4 h-4" /> The daily number challenge is a Pro
              perk — one guess a day, tracked in your stats.
            </p>
          )}
        </section>

        {/* Stats — Pro perk, kept locally on this device. */}
        <section className="mt-12" aria-labelledby="stats-title">
          <h2
            id="stats-title"
            className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
          >
            <BarChart3 className="w-6 h-6 text-[var(--violet)]" /> Your stats
          </h2>
          {pro ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.values(GAMES).map((g) => {
                const s = stats[g.id];
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
              <p className="text-[var(--muted)] text-[0.9rem] sm:col-span-3">
                All games: {totals.plays} plays ·{' '}
                {totals.wagered.toLocaleString()} credits wagered ·{' '}
                {totals.returned.toLocaleString()} returned. Daily challenge
                record: {challenge.hits} correct in {challenge.plays} plays.
                Stats live on this device only.
              </p>
            </div>
          ) : (
            <p className="text-[var(--muted)] inline-flex items-center gap-2">
              <Lock className="w-4 h-4" /> Full arcade stats are a Pro perk.
            </p>
          )}
        </section>

        {/* Membership — fleet PayPal flow ($4.99/mo · $49.99/yr · $99.99 lifetime). */}
        <section className="mt-12" aria-labelledby="membership-title">
          <h2
            id="membership-title"
            className="text-[clamp(1.5rem,4vw,2.4rem)] mb-2 flex items-center gap-2"
          >
            <Crown className="w-6 h-6 text-[var(--violet)]" /> Arcade membership
          </h2>
          <p className="text-[var(--muted)] mb-4" role="status">
            {founder
              ? 'Founder access — every Pro perk is unlocked. 👑'
              : pro
                ? 'Pro is active on this device — themes, the daily challenge and stats are unlocked.'
                : 'The three games are always free, with unlimited refills. Go Pro to unlock the Aurora, Midnight and Copper Lights themes, the daily number challenge and full stats.'}
          </p>
          <PayPalCheckout appName="Northline Arcade" />
        </section>

        <footer className="mt-12 text-[var(--muted)] text-[0.85rem]">
          <p>
            Northline Arcade by Se Fire Tech. Play credits are for fun only —
            they have no cash value, cannot be transferred, and win no prizes.
          </p>
        </footer>
      </main>
    </div>
  );
}

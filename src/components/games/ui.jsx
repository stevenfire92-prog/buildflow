// ============================================================================
// ui.jsx — shared building blocks for the Sapphire Spins game views.
// ============================================================================

import { SUITS, RED_SUITS, rankLabel } from '../../lib/cards.js';

export const FREE_STAKES = [5, 10, 25, 50, 100];
export const VIP_STAKES = [250, 500, 1000];
export const FREE_MAX_BET = 100;

export const controlClass =
  'border border-[var(--edge)] rounded-[0.65rem] bg-[var(--panel)] px-3.5 py-2.5 min-h-[44px] cursor-pointer transition hover:border-[var(--gold)] disabled:opacity-50 disabled:cursor-default text-[var(--text)]';
export const actionClass =
  'border border-[var(--gold-deep)] rounded-[0.65rem] bg-[var(--gold)] text-[#241a02] font-bold px-4 py-2.5 min-h-[44px] cursor-pointer transition hover:brightness-110 disabled:opacity-50 disabled:cursor-default';
export const chipClass =
  'border rounded-full px-3 py-2 min-h-[44px] min-w-[44px] cursor-pointer transition disabled:opacity-50 disabled:cursor-default font-semibold tabular-nums';

// Stake selector. Free players are capped at FREE_MAX_BET; Pro / founder
// players also get the VIP stakes.
export function StakePicker({ stake, setStake, pro, balance }) {
  const options = pro ? [...FREE_STAKES, ...VIP_STAKES] : FREE_STAKES;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[var(--muted)] text-sm">Bet</span>
      {options.map((s) => (
        <button
          key={s}
          onClick={() => setStake(s)}
          aria-pressed={String(stake === s)}
          disabled={s > balance && stake !== s}
          className={
            chipClass +
            (stake === s
              ? ' bg-[var(--gold)] text-[#241a02] border-[var(--gold-deep)]'
              : ' bg-[var(--panel)] text-[var(--text)] border-[var(--edge)] hover:border-[var(--gold)]')
          }
        >
          {s.toLocaleString()}
        </button>
      ))}
      {!pro && (
        <span className="text-[var(--muted)] text-xs">
          Free bets cap at {FREE_MAX_BET} — Pro unlocks VIP stakes
        </span>
      )}
    </div>
  );
}

// A face-up (or face-down) playing card.
export function PlayingCard({ card, hidden = false, small = false }) {
  const size = small
    ? 'w-[clamp(2.6rem,13vw,4.2rem)] text-[clamp(1rem,4.5vw,1.6rem)]'
    : 'w-[clamp(3.4rem,16vw,5.2rem)] text-[clamp(1.3rem,6vw,2.2rem)]';
  if (hidden || !card) {
    return (
      <div
        className={
          'grid place-items-center aspect-[5/7] rounded-[0.6rem] border border-[#3d5a99] ' +
          size
        }
        style={{
          background:
            'repeating-linear-gradient(45deg, #12234f 0 8px, #0e1a3d 8px 16px)',
        }}
        aria-hidden="true"
      >
        <span className="text-[var(--gold)]">💎</span>
      </div>
    );
  }
  const red = RED_SUITS.has(card.suit);
  return (
    <div
      className={
        'grid place-items-center aspect-[5/7] rounded-[0.6rem] border border-[#c8d4ee] bg-[#f6f8ff] font-bold leading-none sapphire-pop ' +
        size
      }
      style={{ color: red ? '#c22424' : '#16213d' }}
      aria-hidden="true"
    >
      <span>
        {rankLabel(card.rank)}
        {SUITS[card.suit]}
      </span>
    </div>
  );
}

const DICE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DieFace({ value }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 gap-0.5 w-[clamp(3.2rem,15vw,5rem)] aspect-square rounded-[0.7rem] bg-[#f6f8ff] border border-[#c8d4ee] p-2 sapphire-pop"
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            background: DICE_PIPS[value]?.includes(i) ? '#16213d' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}

// Result / status line used under every game.
export function ResultLine({ text }) {
  return (
    <p className="mt-4 min-h-[1.5em] text-[var(--gold)] font-semibold" role="status">
      {text}
    </p>
  );
}

// The felt stage every game renders its pieces on.
export function Stage({ label, children }) {
  return (
    <div
      className="my-6 min-h-[9rem] flex gap-[clamp(0.35rem,2vw,1rem)] items-center justify-center flex-wrap rounded-[0.85rem] p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #17457e, #081426)',
      }}
      role="img"
      aria-label={label}
    >
      {children}
    </div>
  );
}

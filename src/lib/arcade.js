// ============================================================================
// games.js — Northline Arcade game logic, ported faithfully from the original
// ChatGPT-built single-file version (rules and odds unchanged).
//
// All three games play on a free play-credit balance. Play credits have no
// cash value, no transfers and no prizes — same as the original.
// ============================================================================

export const SYMBOLS = ['✦', '◆', '●', '▲'];
export const SYMBOL_NAMES = ['star', 'diamond', 'circle', 'triangle'];

export const roll = (sides) => 1 + Math.floor(Math.random() * sides);

export const rankLabel = (rank) =>
  ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[rank] ?? String(rank);

// --- Starline Reels -----------------------------------------------------------
// Spin three reels. A pair returns your stake. Three matching symbols return
// eight times your stake. (Pair 56.25% · Three of a kind 6.25%.)
export function reelsStart() {
  return { faces: SYMBOLS.slice(0, 3), label: 'Star, diamond, circle' };
}

export function playReels() {
  const picks = Array.from({ length: 3 }, () => roll(4) - 1);
  const unique = new Set(picks).size;
  return {
    faces: picks.map((i) => SYMBOLS[i]),
    label: picks.map((i) => SYMBOL_NAMES[i]).join(', '),
    multiple: unique === 1 ? 8 : unique === 2 ? 1 : 0,
    detail:
      unique === 1
        ? 'Three of a kind'
        : unique === 2
          ? 'One pair'
          : 'Three different symbols',
  };
}

// --- Dice Divide --------------------------------------------------------------
// Pick a side of seven, then roll two dice. A correct pick returns twice your
// stake. Seven returns your stake. (Each side 15 in 36 · Seven 6 in 36.)
export function diceStart() {
  return { faces: ['?', '?'], label: 'Two dice ready' };
}

export function playDice(choice) {
  const first = roll(6);
  const second = roll(6);
  const total = first + second;
  const correct = choice === 'Below 7' ? total < 7 : total > 7;
  return {
    faces: [first, second],
    label: 'Dice show ' + first + ' and ' + second,
    multiple: total === 7 ? 1 : correct ? 2 : 0,
    detail: 'Rolled ' + total,
  };
}

// --- Signal Cards -------------------------------------------------------------
// Guess whether the next rank is lower or higher. Correct picks return the
// displayed multiplier, including your stake. Equal ranks return your stake.
// Ace is low. The starting rank carries over between plays (as in the
// original, where nextRank persisted for the session).
export function cardsStart(nextRank) {
  return {
    faces: [rankLabel(nextRank), '?'],
    label: 'Starting rank ' + rankLabel(nextRank),
  };
}

// Number of ranks that win for a choice: Lower → rank-1, Higher → 13-rank.
// 0 means the choice is impossible and its button is disabled (original rule).
export function cardsChance(rank, choice) {
  return choice === 'Lower' ? rank - 1 : 13 - rank;
}

// Button label multiplier, formatted exactly like the original
// (12/chance, two decimals, trailing zeros stripped).
export function cardsMultipleLabel(chance) {
  return (12 / chance).toFixed(2).replace(/\.?0+$/, '') + '×';
}

export function playCards(rank, choice) {
  const drawn = roll(13);
  const chance = cardsChance(rank, choice);
  const correct = choice === 'Lower' ? drawn < rank : drawn > rank;
  const multiple = drawn === rank ? 1 : correct ? 12 / chance : 0;
  const nextRank = roll(13);
  return {
    faces: [rankLabel(rank), rankLabel(drawn)],
    label:
      'Starting rank ' + rankLabel(rank) + ', drawn rank ' + rankLabel(drawn),
    multiple,
    detail:
      'Drew ' +
      rankLabel(drawn) +
      ' after ' +
      rankLabel(rank) +
      '. Next starting rank ' +
      rankLabel(nextRank),
    nextRank,
  };
}

export const GAMES = {
  reels: {
    id: 'reels',
    name: 'Starline Reels',
    rules:
      'Spin three reels. A pair returns your stake. Three matching symbols return eight times your stake.',
    odds: 'Pair 56.25% · Three of a kind 6.25%.',
    choices: ['Spin'],
  },
  dice: {
    id: 'dice',
    name: 'Dice Divide',
    rules:
      'Pick a side of seven, then roll two dice. A correct pick returns twice your stake. Seven returns your stake.',
    odds: 'Each side 15 in 36 · Seven 6 in 36.',
    choices: ['Below 7', 'Above 7'],
  },
  cards: {
    id: 'cards',
    name: 'Signal Cards',
    rules:
      'Guess whether the next rank is lower or higher. Correct picks return the displayed multiplier, including your stake. Equal ranks return your stake. Ace is low.',
    odds: null, // dynamic: depends on the current starting rank
    choices: ['Lower', 'Higher'],
  },
};

// --- Themes -------------------------------------------------------------------
// Palettes ported verbatim from the original server's /api/theme endpoint.
// The original stylesheet only ever varied these five variables; --text and
// --muted stayed at the base values in every theme.
export const THEMES = {
  original: {
    id: 'original',
    name: 'Original',
    pro: false,
    palette: {
      bg: '#10101b',
      panel: '#1c1b2b',
      edge: '#38344c',
      lime: '#e1fb8e',
      violet: '#c6abff',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    pro: true,
    palette: {
      bg: '#091e21',
      panel: '#123135',
      edge: '#32635d',
      lime: '#a4f9c7',
      violet: '#9cdbff',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    pro: true,
    palette: {
      bg: '#111028',
      panel: '#25214b',
      edge: '#534f81',
      lime: '#c4caff',
      violet: '#ffd3f5',
    },
  },
  copper: {
    id: 'copper',
    name: 'Copper Lights',
    pro: true,
    palette: {
      bg: '#241514',
      panel: '#37221f',
      edge: '#69433a',
      lime: '#ffc991',
      violet: '#f8b3a2',
    },
  },
};

// --- Daily number challenge ---------------------------------------------------
// Original (server): pick a number from 1 to 6, once per UTC day; a correct
// guess counts toward your all-time stats; a new round opens at midnight UTC.
// Ported to a local roll + localStorage record — same rules, no account.
export const utcDayKey = (date = new Date()) => date.toISOString().slice(0, 10);

export function rollChallenge() {
  return roll(6);
}

// ============================================================================
// casino.js — Sapphire Spins game logic for the five new floor games.
// (Dice Divide and Signal Cards live in arcade.js, ported from Northline.)
//
// Everything plays on free play credits: no cash value, no transfers, no
// prizes. Settlement convention across the app: a "multiple" is the TOTAL
// return per credit staked, including the stake itself (2 = stake back plus
// equal winnings). The wallet floors fractional returns to whole credits.
// ============================================================================

import { handValue } from './cards.js';

export const rollDie = () => 1 + Math.floor(Math.random() * 6);

// --- Sapphire Reels ------------------------------------------------------------
// Three independent weighted reels. Three of a kind pays the symbol's prize;
// any pair returns the stake. Theoretical RTP ≈ 96.3% (see scripts/simulate).
export const SLOT_SYMBOLS = [
  { id: 'sapphire', icon: '💎', name: 'Sapphire', weight: 2, pay: 100 },
  { id: 'seven', icon: '7️⃣', name: 'Lucky Seven', weight: 3, pay: 50 },
  { id: 'bell', icon: '🔔', name: 'Bell', weight: 5, pay: 25 },
  { id: 'star', icon: '⭐', name: 'Star', weight: 7, pay: 15 },
  { id: 'lemon', icon: '🍋', name: 'Lemon', weight: 9, pay: 10 },
  { id: 'cherry', icon: '🍒', name: 'Cherry', weight: 11, pay: 5 },
];
const SLOT_TOTAL_WEIGHT = SLOT_SYMBOLS.reduce((s, x) => s + x.weight, 0);

function spinOneReel() {
  let r = Math.random() * SLOT_TOTAL_WEIGHT;
  for (const s of SLOT_SYMBOLS) {
    r -= s.weight;
    if (r < 0) return s;
  }
  return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
}

export function spinReels() {
  const picks = [spinOneReel(), spinOneReel(), spinOneReel()];
  const ids = picks.map((p) => p.id);
  const unique = new Set(ids).size;
  if (unique === 1) {
    return {
      symbols: picks,
      multiple: picks[0].pay,
      detail: 'Three ' + picks[0].name + 's — pays ' + picks[0].pay + '×',
    };
  }
  if (unique === 2) {
    return { symbols: picks, multiple: 1, detail: 'A pair — stake returned' };
  }
  return { symbols: picks, multiple: 0, detail: 'No match' };
}

// --- Ember Wheel ----------------------------------------------------------------
// European-style single-zero wheel, 0–36. One bet per spin.
export const WHEEL_REDS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function wheelColor(n) {
  if (n === 0) return 'green';
  return WHEEL_REDS.has(n) ? 'red' : 'black';
}

export function spinWheel() {
  return Math.floor(Math.random() * 37);
}

// bet: { type: 'red'|'black'|'even'|'odd'|'number', number?: 0..36 }
// Returns the total-return multiple for the spin result.
export function wheelPayout(bet, result) {
  switch (bet.type) {
    case 'red':
      return wheelColor(result) === 'red' ? 2 : 0;
    case 'black':
      return wheelColor(result) === 'black' ? 2 : 0;
    case 'even':
      return result !== 0 && result % 2 === 0 ? 2 : 0;
    case 'odd':
      return result % 2 === 1 ? 2 : 0;
    case 'number':
      return result === bet.number ? 36 : 0;
    default:
      return 0;
  }
}

// --- Blaze Banco ------------------------------------------------------------------
// Baccarat-style: card values are rank % 10 with 10/J/Q/K worth 0, aces 1.
// Full third-card rules. Bets: 'player' pays 1:1, 'banker' pays 1:1 less a 5%
// commission (total return 1.95×), 'tie' pays 8:1. Player/Banker bets push on
// a tie.
export function bancoCardValue(card) {
  return card.rank >= 10 ? 0 : card.rank;
}

export function bancoHandValue(cards) {
  return cards.reduce((sum, c) => sum + bancoCardValue(c), 0) % 10;
}

// Plays a full hand from the front of `deck` (cards are shifted off).
// Returns { playerCards, bankerCards, winner: 'player'|'banker'|'tie' }.
export function playBancoHand(deck) {
  const d = deck.slice();
  const draw = () => d.shift();
  const playerCards = [draw(), draw()];
  const bankerCards = [draw(), draw()];
  let pv = bancoHandValue(playerCards);
  let bv = bancoHandValue(bankerCards);

  const natural = pv >= 8 || bv >= 8;
  if (!natural) {
    let playerThird = null;
    if (pv <= 5) {
      playerThird = draw();
      playerCards.push(playerThird);
      pv = bancoHandValue(playerCards);
    }
    if (playerThird === null) {
      // Player stood on 6–7: banker draws on 0–5, stands on 6–7.
      if (bv <= 5) bankerCards.push(draw());
    } else {
      const t = bancoCardValue(playerThird);
      const bankerDraws =
        bv <= 2 ||
        (bv === 3 && t !== 8) ||
        (bv === 4 && t >= 2 && t <= 7) ||
        (bv === 5 && t >= 4 && t <= 7) ||
        (bv === 6 && (t === 6 || t === 7));
      if (bankerDraws) bankerCards.push(draw());
    }
    bv = bancoHandValue(bankerCards);
  }

  const winner = pv > bv ? 'player' : bv > pv ? 'banker' : 'tie';
  return { playerCards, bankerCards, playerValue: pv, bankerValue: bv, winner };
}

// Total-return multiple for a banco bet given the hand outcome.
export function bancoPayout(betType, winner) {
  if (winner === 'tie') return betType === 'tie' ? 9 : 1; // P/B bets push
  if (betType === winner) return betType === 'banker' ? 1.95 : 2;
  return 0;
}

// --- Ember Dice ---------------------------------------------------------------------
// Pass-line dice, simplified: come-out roll, then point phase until the point
// repeats (win) or a 7 appears (seven-out, lose).
export function comeOutResult(sum) {
  if (sum === 7 || sum === 11) return 'win';
  if (sum === 2 || sum === 3 || sum === 12) return 'lose';
  return 'point';
}

export function rollDicePair() {
  return [rollDie(), rollDie()];
}

// --- Ember 21 settlement --------------------------------------------------------------
// Given the finished hands, the total-return multiple for the player's stake
// (before any double-down extra stake, which the component tracks separately).
export function ember21Outcome(playerCards, dealerCards) {
  const p = handValue(playerCards).total;
  const d = handValue(dealerCards).total;
  const pNatural = playerCards.length === 2 && p === 21;
  const dNatural = dealerCards.length === 2 && d === 21;
  if (pNatural && dNatural) return { key: 'push', multiple: 1, detail: 'Both have a natural 21 — push' };
  if (pNatural) return { key: 'natural', multiple: 2.5, detail: 'Natural 21! Pays 3:2' };
  if (dNatural) return { key: 'lose', multiple: 0, detail: 'Dealer has a natural 21' };
  if (p > 21) return { key: 'bust', multiple: 0, detail: 'Bust — over 21' };
  if (d > 21) return { key: 'win', multiple: 2, detail: 'Dealer busts — you win' };
  if (p > d) return { key: 'win', multiple: 2, detail: 'You win, ' + p + ' over ' + d };
  if (p < d) return { key: 'lose', multiple: 0, detail: 'Dealer wins, ' + d + ' over ' + p };
  return { key: 'push', multiple: 1, detail: 'Push at ' + p + ' — stake returned' };
}

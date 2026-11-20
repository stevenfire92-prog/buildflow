// ============================================================================
// cards.js — shared playing-card helpers for Sapphire Spins.
// A card is { rank: 1..13 (1 = Ace, 11 = J, 12 = Q, 13 = K), suit: 0..3 }.
// ============================================================================

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RED_SUITS = new Set([1, 2]); // hearts, diamonds

export const rankLabel = (rank) =>
  ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[rank] ?? String(rank);

export function createDeck() {
  const deck = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffle(deck) {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function newShoe() {
  return shuffle(createDeck());
}

// --- 21-point hand value (Ember 21) ------------------------------------------
// Aces count 11 unless that busts the hand. `soft` is true when an ace is
// still counted as 11.
export function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 1) {
      aces++;
      total += 11;
    } else {
      total += Math.min(c.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

export function isNatural(cards) {
  return cards.length === 2 && handValue(cards).total === 21;
}

// Dealer draws below 17 and stands on every 17 (soft 17 included).
// Mutates and returns the deck it drew from is NOT done — returns
// { cards, deck } with the remaining deck so callers keep state.
export function playDealerHand(dealerCards, deck) {
  const cards = dealerCards.slice();
  const rest = deck.slice();
  while (handValue(cards).total < 17) {
    cards.push(rest.pop());
  }
  return { cards, deck: rest };
}

// --- Draw poker evaluation (Fire Draw Poker) ----------------------------------
// Returns { key, name, multiple } — multiple is the TOTAL return per credit
// staked (Jacks-or-better pays 1 = stake back), standard jacks-or-better table.
export function evaluateDrawHand(cards) {
  const ranks = cards.map((c) => c.rank);
  const flush = cards.every((c) => c.suit === cards[0].suit);

  // Straight detection, ace high or wheel (A-2-3-4-5).
  const uniq = [...new Set(ranks)].sort((a, b) => a - b);
  let straight = false;
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[4] - uniq[0] === 4) {
      straight = true;
      straightHigh = uniq[4];
    } else if (uniq.join(',') === '1,2,3,4,5') {
      straight = true;
      straightHigh = 5;
    } else if (uniq.join(',') === '1,10,11,12,13') {
      straight = true;
      straightHigh = 14; // broadway, ace high
    }
  }

  const counts = new Map();
  for (const r of ranks) counts.set(r, (counts.get(r) || 0) + 1);
  const groups = [...counts.entries()]
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  if (straight && flush && straightHigh === 14)
    return { key: 'royal', name: 'Royal Flush', multiple: 250 };
  if (straight && flush)
    return { key: 'straightflush', name: 'Straight Flush', multiple: 50 };
  if (groups[0].count === 4)
    return { key: 'quads', name: 'Four of a Kind', multiple: 25 };
  if (groups[0].count === 3 && groups[1] && groups[1].count === 2)
    return { key: 'fullhouse', name: 'Full House', multiple: 9 };
  if (flush) return { key: 'flush', name: 'Flush', multiple: 6 };
  if (straight) return { key: 'straight', name: 'Straight', multiple: 4 };
  if (groups[0].count === 3)
    return { key: 'trips', name: 'Three of a Kind', multiple: 3 };
  if (groups[0].count === 2 && groups[1] && groups[1].count === 2)
    return { key: 'twopair', name: 'Two Pair', multiple: 2 };
  if (groups[0].count === 2) {
    const pairRank = groups[0].rank;
    if (pairRank === 1 || pairRank >= 11)
      return { key: 'jacksorbetter', name: 'Jacks or Better', multiple: 1 };
    return { key: 'lowpair', name: 'Low Pair', multiple: 0 };
  }
  return { key: 'nothing', name: 'No Win', multiple: 0 };
}

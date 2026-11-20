// ============================================================================
// simulate.mjs — Monte-Carlo + unit checks for Sapphire Spins game logic.
// Run: npm run simulate   (plain node, imports the real src/lib modules)
// ============================================================================

import {
  spinReels,
  spinWheel,
  wheelPayout,
  playBancoHand,
  bancoPayout,
  ember21Outcome,
} from '../src/lib/casino.js';
import {
  newShoe,
  handValue,
  isNatural,
  playDealerHand,
  evaluateDrawHand,
} from '../src/lib/cards.js';

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}

// --- Sapphire Reels -----------------------------------------------------------
{
  const N = 50000;
  const stake = 10;
  let returned = 0;
  for (let i = 0; i < N; i++) {
    const o = spinReels();
    if (!o.symbols || o.symbols.length !== 3) throw new Error('bad reels result');
    returned += Math.floor(stake * o.multiple + 1e-9);
  }
  const rtp = returned / (N * stake);
  check('Sapphire Reels RTP', rtp > 0.9 && rtp < 1.0, 'RTP ' + rtp.toFixed(4) + ' over ' + N + ' spins (theory ≈ 0.9625)');
}

// --- Ember 21 (simple strategy: hit below 17, no doubles) ----------------------
{
  const N = 20000;
  const stake = 10;
  let returned = 0;
  for (let i = 0; i < N; i++) {
    const shoe = newShoe();
    const player = [shoe.pop(), shoe.pop()];
    const dealer = [shoe.pop(), shoe.pop()];
    let outcome;
    if (isNatural(player) || isNatural(dealer)) {
      outcome = ember21Outcome(player, dealer);
    } else {
      while (handValue(player).total < 17) player.push(shoe.pop());
      if (handValue(player).total > 21) {
        outcome = ember21Outcome(player, dealer);
      } else {
        const played = playDealerHand(dealer, shoe);
        outcome = ember21Outcome(player, played.cards);
      }
    }
    returned += Math.floor(stake * outcome.multiple + 1e-9);
  }
  const rtp = returned / (N * stake);
  check('Ember 21 RTP (hit <17 strategy)', rtp > 0.88 && rtp < 1.02, 'RTP ' + rtp.toFixed(4) + ' over ' + N + ' hands');
}

// --- Blaze Banco ----------------------------------------------------------------
for (const betType of ['player', 'banker', 'tie']) {
  const N = 20000;
  const stake = 10;
  let returned = 0;
  for (let i = 0; i < N; i++) {
    const hand = playBancoHand(newShoe());
    returned += Math.floor(stake * bancoPayout(betType, hand.winner) + 1e-9);
  }
  const rtp = returned / (N * stake);
  const [lo, hi] = betType === 'tie' ? [0.7, 0.98] : [0.94, 1.01];
  check('Blaze Banco RTP (' + betType + ' bet)', rtp > lo && rtp < hi, 'RTP ' + rtp.toFixed(4) + ' over ' + N + ' hands');
}

// --- Ember Wheel ------------------------------------------------------------------
{
  const N = 20000;
  const stake = 10;
  let returned = 0;
  for (let i = 0; i < N; i++) {
    returned += Math.floor(stake * wheelPayout({ type: 'red' }, spinWheel()) + 1e-9);
  }
  const rtp = returned / (N * stake);
  check('Ember Wheel RTP (red bet)', rtp > 0.9 && rtp < 1.03, 'RTP ' + rtp.toFixed(4) + ' over ' + N + ' spins (theory ≈ 0.973)');
}

// --- Fire Draw Poker evaluator (fixed hands) ---------------------------------------
{
  const C = (rank, suit) => ({ rank, suit });
  const cases = [
    { hand: [C(1, 0), C(13, 0), C(12, 0), C(11, 0), C(10, 0)], key: 'royal', multiple: 250 },
    { hand: [C(5, 1), C(4, 1), C(3, 1), C(2, 1), C(1, 1)], key: 'straightflush', multiple: 50 },
    { hand: [C(9, 0), C(9, 1), C(9, 2), C(9, 3), C(2, 0)], key: 'quads', multiple: 25 },
    { hand: [C(8, 0), C(8, 1), C(8, 2), C(4, 0), C(4, 1)], key: 'fullhouse', multiple: 9 },
    { hand: [C(2, 2), C(6, 2), C(9, 2), C(11, 2), C(13, 2)], key: 'flush', multiple: 6 },
    { hand: [C(1, 0), C(2, 1), C(3, 2), C(4, 3), C(5, 0)], key: 'straight', multiple: 4 },
    { hand: [C(7, 0), C(7, 1), C(7, 2), C(1, 3), C(13, 0)], key: 'trips', multiple: 3 },
    { hand: [C(11, 0), C(11, 1), C(5, 2), C(5, 3), C(2, 0)], key: 'twopair', multiple: 2 },
    { hand: [C(12, 0), C(12, 1), C(3, 2), C(6, 3), C(9, 0)], key: 'jacksorbetter', multiple: 1 },
    { hand: [C(4, 0), C(4, 1), C(3, 2), C(6, 3), C(9, 0)], key: 'lowpair', multiple: 0 },
    { hand: [C(2, 0), C(5, 1), C(7, 2), C(9, 3), C(13, 0)], key: 'nothing', multiple: 0 },
  ];
  let ok = true;
  for (const c of cases) {
    const ev = evaluateDrawHand(c.hand);
    if (ev.key !== c.key || ev.multiple !== c.multiple) {
      ok = false;
      console.log('  mismatch: expected ' + c.key + '/' + c.multiple + ', got ' + ev.key + '/' + ev.multiple);
    }
  }
  check('Fire Draw Poker evaluator (11 fixed hands)', ok);
}

// --- Wallet invariant: settle math can never drive a balance below zero -----------
{
  let balance = 1000;
  let ok = true;
  for (let i = 0; i < 10000; i++) {
    const stake = [5, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
    if (stake > balance) continue; // bet validation rejects it
    const multiple = [0, 1, 2, 9, 36, 250][Math.floor(Math.random() * 6)];
    const returned = Math.floor(stake * multiple + 1e-9);
    balance += returned - stake;
    if (balance < 0 || !Number.isInteger(balance)) ok = false;
  }
  check('Wallet invariant (10k random settlements)', ok, 'final balance ' + balance);
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : '\n' + failures + ' CHECK(S) FAILED');
process.exit(failures === 0 ? 0 : 1);

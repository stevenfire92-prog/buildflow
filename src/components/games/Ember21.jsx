import { useState } from 'react';
import { newShoe, handValue, isNatural, playDealerHand } from '../../lib/cards.js';
import { ember21Outcome } from '../../lib/casino.js';
import { StakePicker, PlayingCard, ResultLine, Stage, actionClass, controlClass } from './ui.jsx';

// Ember 21 — get closer to 21 than the dealer without going over.
// Natural 21 pays 3:2. Dealer stands on every 17. Double down on your
// first two cards. No splits or insurance — one hand, clean rules.
export default function Ember21({ balance, pro, debit, credit, record }) {
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState('bet'); // bet | player | done
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [wagered, setWagered] = useState(0);
  const [result, setResult] = useState('');

  const resolve = (playerCards, dealerCards, totalWagered) => {
    const outcome = ember21Outcome(playerCards, dealerCards);
    const returned = Math.floor(totalWagered * outcome.multiple + 1e-9);
    if (returned > 0) credit(returned);
    record('ember21', totalWagered, returned);
    setResult(
      outcome.detail +
        ' · ' +
        (returned === totalWagered
          ? 'Stake returned'
          : returned
            ? returned.toLocaleString() + ' credits returned'
            : 'No credits returned')
    );
    setPhase('done');
  };

  const finishWithDealer = (playerCards, rest, totalWagered) => {
    const { cards } = playDealerHand(dealer, rest);
    setDealer(cards);
    resolve(playerCards, cards, totalWagered);
  };

  const deal = () => {
    if (!debit(stake)) return;
    const shoe = newShoe();
    const p = [shoe.pop(), shoe.pop()];
    const d = [shoe.pop(), shoe.pop()];
    setPlayer(p);
    setDealer(d);
    setDeck(shoe);
    setWagered(stake);
    setResult('');
    if (isNatural(p) || isNatural(d)) {
      resolve(p, d, stake);
    } else {
      setPhase('player');
    }
  };

  const hit = () => {
    const rest = deck.slice();
    const p = [...player, rest.pop()];
    setPlayer(p);
    setDeck(rest);
    const v = handValue(p).total;
    if (v > 21) {
      resolve(p, dealer, wagered);
    } else if (v === 21) {
      finishWithDealer(p, rest, wagered);
    }
  };

  const stand = () => finishWithDealer(player, deck, wagered);

  const doubleDown = () => {
    if (!debit(stake)) return;
    const totalWagered = wagered + stake;
    setWagered(totalWagered);
    const rest = deck.slice();
    const p = [...player, rest.pop()];
    setPlayer(p);
    setDeck(rest);
    if (handValue(p).total > 21) {
      resolve(p, dealer, totalWagered);
    } else {
      finishWithDealer(p, rest, totalWagered);
    }
  };

  const pv = player.length ? handValue(player) : null;
  const dv = dealer.length ? handValue(dealer) : null;
  const showDealerFull = phase === 'done';

  return (
    <div>
      <Stage
        label={
          player.length
            ? 'Your hand ' + pv.total + (showDealerFull ? ', dealer ' + dv.total : '')
            : 'No hand dealt yet'
        }
      >
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-sm w-16 text-right">Dealer</span>
            {dealer.length === 0 && <span className="text-3xl">🂠</span>}
            {dealer.map((c, i) => (
              <PlayingCard key={i} card={c} hidden={i === 1 && !showDealerFull} small />
            ))}
            {dealer.length > 0 && (
              <span className="text-[var(--gold)] font-bold tabular-nums">
                {showDealerFull ? dv.total : handValue([dealer[0]]).total + ' + ?'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-sm w-16 text-right">You</span>
            {player.length === 0 && <span className="text-3xl">🂠</span>}
            {player.map((c, i) => (
              <PlayingCard key={i} card={c} small />
            ))}
            {player.length > 0 && (
              <span className="text-[var(--gold)] font-bold tabular-nums">
                {pv.total}
                {pv.soft && pv.total !== 21 ? ' soft' : ''}
              </span>
            )}
          </div>
        </div>
      </Stage>

      {phase === 'bet' || phase === 'done' ? (
        <div className="flex items-end gap-3 flex-wrap">
          <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
          <button onClick={deal} disabled={stake > balance} className={actionClass}>
            {phase === 'done' ? 'Deal again' : 'Deal'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={hit} className={actionClass}>Hit</button>
          <button onClick={stand} className={controlClass}>Stand</button>
          {player.length === 2 && (
            <button
              onClick={doubleDown}
              disabled={balance < stake}
              className={controlClass}
            >
              Double down
            </button>
          )}
        </div>
      )}

      <ResultLine text={result} />
    </div>
  );
}

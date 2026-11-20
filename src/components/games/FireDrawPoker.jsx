import { useState } from 'react';
import { newShoe, evaluateDrawHand } from '../../lib/cards.js';
import { StakePicker, PlayingCard, ResultLine, Stage, actionClass, chipClass } from './ui.jsx';

const PAYTABLE = [
  ['Royal Flush', 250],
  ['Straight Flush', 50],
  ['Four of a Kind', 25],
  ['Full House', 9],
  ['Flush', 6],
  ['Straight', 4],
  ['Three of a Kind', 3],
  ['Two Pair', 2],
  ['Jacks or Better', 1],
];

// Fire Draw Poker — five-card draw. Deal, hold the cards you like, draw the
// rest. Pays the jacks-or-better table above (total return per credit bet).
export default function FireDrawPoker({ balance, pro, debit, credit, record }) {
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState('bet'); // bet | hold | done
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [holds, setHolds] = useState([false, false, false, false, false]);
  const [outcome, setOutcome] = useState(null);
  const [result, setResult] = useState('');

  const deal = () => {
    if (!debit(stake)) return;
    const shoe = newShoe();
    setHand([shoe.pop(), shoe.pop(), shoe.pop(), shoe.pop(), shoe.pop()]);
    setDeck(shoe);
    setHolds([false, false, false, false, false]);
    setOutcome(null);
    setResult('');
    setPhase('hold');
  };

  const toggleHold = (i) => {
    if (phase !== 'hold') return;
    setHolds((h) => h.map((v, j) => (j === i ? !v : v)));
  };

  const draw = () => {
    const rest = deck.slice();
    const next = hand.map((c, i) => (holds[i] ? c : rest.pop()));
    setHand(next);
    setDeck(rest);
    const ev = evaluateDrawHand(next);
    setOutcome(ev);
    const returned = Math.floor(stake * ev.multiple + 1e-9);
    if (returned > 0) credit(returned);
    record('poker', stake, returned);
    setResult(
      ev.name +
        ' · ' +
        (returned === stake
          ? 'Stake returned'
          : returned
            ? returned.toLocaleString() + ' credits returned'
            : 'No credits returned')
    );
    setPhase('done');
  };

  return (
    <div>
      <Stage label={hand.length ? 'Your five cards' : 'No hand dealt yet'}>
        {hand.length === 0 && <span className="text-4xl">🂠 🂠 🂠 🂠 🂠</span>}
        {hand.map((c, i) => (
          <button
            key={i}
            onClick={() => toggleHold(i)}
            disabled={phase !== 'hold'}
            aria-pressed={String(holds[i])}
            className="flex flex-col items-center gap-1.5 cursor-pointer disabled:cursor-default bg-transparent border-0 p-0"
          >
            <PlayingCard card={c} />
            <span
              className={
                chipClass +
                ' !min-h-[32px] text-xs ' +
                (holds[i]
                  ? ' bg-[var(--gold)] text-[#241a02] border-[var(--gold-deep)]'
                  : ' bg-[var(--panel)] text-[var(--muted)] border-[var(--edge)]')
              }
            >
              {holds[i] ? 'HELD' : phase === 'hold' ? 'Hold' : '—'}
            </span>
          </button>
        ))}
      </Stage>

      {phase === 'hold' ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={draw} className={actionClass}>Draw</button>
          <span className="text-[var(--muted)] text-sm self-center">
            Tap cards to hold them, then draw.
          </span>
        </div>
      ) : (
        <div className="flex items-end gap-3 flex-wrap">
          <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
          <button onClick={deal} disabled={stake > balance} className={actionClass}>
            {phase === 'done' ? 'Deal again' : 'Deal'}
          </button>
        </div>
      )}

      <ResultLine text={result} />

      <div className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
        {PAYTABLE.map(([name, pays]) => (
          <p
            key={name}
            className={
              outcome && outcome.name === name
                ? 'text-[var(--gold)] font-bold'
                : 'text-[var(--muted)]'
            }
          >
            {name} — pays {pays}×
          </p>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  cardsStart,
  playCards,
  cardsChance,
  cardsMultipleLabel,
  rankLabel,
  roll,
} from '../../lib/arcade.js';
import { StakePicker, ResultLine, Stage, actionClass } from './ui.jsx';

// Signal Cards — ported from Northline Arcade, same rules and odds.
// Guess whether the next rank is lower or higher than the current one.
// Correct picks return the displayed multiplier (stake included); an equal
// rank returns your stake. Ace is low. The starting rank carries over
// between plays for the session, exactly as in Northline.
export default function SignalCards({ balance, pro, settle }) {
  const [stake, setStake] = useState(10);
  const [nextRank, setNextRank] = useState(() => roll(13));
  const [faces, setFaces] = useState(() => cardsStart(nextRank).faces);
  const [result, setResult] = useState('');

  const play = (choice) => {
    if (cardsChance(nextRank, choice) === 0) return;
    const outcome = playCards(nextRank, choice);
    const returned = settle('signalcards', stake, outcome.multiple);
    if (returned === null) return;
    setFaces(outcome.faces);
    setNextRank(outcome.nextRank);
    setResult(
      outcome.detail +
        ' · ' +
        (returned === stake
          ? 'Stake returned'
          : returned > stake
            ? returned.toLocaleString() + ' credits returned'
            : 'No credits returned')
    );
  };

  return (
    <div>
      <Stage label={'Current rank ' + faces[0] + ', drawn ' + faces[1]}>
        {faces.map((f, i) => (
          <span
            key={i}
            className="grid place-items-center bg-[#0e1a3d] border border-[var(--gold-deep)] text-[var(--text)] rounded-[0.85rem] w-[clamp(3.8rem,18vw,7rem)] aspect-square font-bold text-[clamp(1.7rem,6vw,3.6rem)] leading-none"
            aria-hidden="true"
          >
            {f}
          </span>
        ))}
      </Stage>

      <p className="text-[var(--muted)] text-sm mb-3">
        Current rank: <strong className="text-[var(--gold)]">{rankLabel(nextRank)}</strong> —
        will the next card be lower or higher?
      </p>

      <div className="flex items-end gap-3 flex-wrap">
        <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
        <div className="flex flex-wrap gap-2">
          {['Lower', 'Higher'].map((choice) => {
            const chance = cardsChance(nextRank, choice);
            return (
              <button
                key={choice}
                onClick={() => play(choice)}
                disabled={stake > balance || chance === 0}
                className={actionClass}
              >
                {chance ? choice + ' · ' + cardsMultipleLabel(chance) : choice + ' · impossible'}
              </button>
            );
          })}
        </div>
      </div>

      <ResultLine text={result} />
    </div>
  );
}

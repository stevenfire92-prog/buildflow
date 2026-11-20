import { useState } from 'react';
import { diceStart, playDice } from '../../lib/arcade.js';
import { StakePicker, DieFace, ResultLine, Stage, actionClass, chipClass } from './ui.jsx';

// Dice Divide — ported from Northline Arcade, same rules and odds.
// Pick a side of seven, then roll two dice. A correct pick returns twice
// your stake. Seven returns your stake.
export default function DiceDivide({ balance, pro, settle }) {
  const [stake, setStake] = useState(10);
  const [choice, setChoice] = useState('Below 7');
  const [faces, setFaces] = useState(() => diceStart().faces);
  const [result, setResult] = useState('');

  const rollNow = () => {
    const outcome = playDice(choice);
    const returned = settle('dicedivide', stake, outcome.multiple);
    if (returned === null) return;
    setFaces(outcome.faces);
    setResult(
      outcome.detail +
        ' · ' +
        (returned === stake
          ? 'Stake returned'
          : returned
            ? returned.toLocaleString() + ' credits returned'
            : 'No credits returned')
    );
  };

  return (
    <div>
      <Stage label={typeof faces[0] === 'number' ? 'Dice show ' + faces.join(' and ') : 'Two dice ready'}>
        {faces.map((f, i) =>
          typeof f === 'number' ? (
            <DieFace key={i} value={f} />
          ) : (
            <span
              key={i}
              className="grid place-items-center w-[clamp(3.2rem,15vw,5rem)] aspect-square rounded-[0.7rem] bg-[#0e1a3d] border border-[var(--edge)] text-3xl text-[var(--gold)]"
              aria-hidden="true"
            >
              ?
            </span>
          )
        )}
      </Stage>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Pick a side of seven">
        {['Below 7', 'Above 7'].map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            aria-pressed={String(choice === c)}
            className={
              chipClass +
              (choice === c
                ? ' bg-[var(--gold)] text-[#241a02] border-[var(--gold-deep)]'
                : ' bg-[var(--panel)] text-[var(--text)] border-[var(--edge)] hover:border-[var(--gold)]')
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
        <button onClick={rollNow} disabled={stake > balance} className={actionClass}>
          Roll the dice
        </button>
      </div>

      <ResultLine text={result} />
    </div>
  );
}

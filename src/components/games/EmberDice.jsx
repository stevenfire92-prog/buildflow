import { useState } from 'react';
import { rollDicePair, comeOutResult } from '../../lib/casino.js';
import { StakePicker, DieFace, ResultLine, Stage, actionClass } from './ui.jsx';

// Ember Dice — a pass-line dice game. Come-out roll: 7 or 11 wins, 2, 3 or
// 12 loses, anything else sets the point. Roll the point again to win;
// a 7 before it ("seven-out") loses. Wins pay 1:1.
export default function EmberDice({ balance, pro, debit, credit, record }) {
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState('bet'); // bet | point | done
  const [dice, setDice] = useState([6, 6]);
  const [point, setPoint] = useState(null);
  const [result, setResult] = useState('');

  const finish = (won, text) => {
    const returned = won ? stake * 2 : 0;
    if (returned > 0) credit(returned);
    record('emberdice', stake, returned);
    setResult(
      text +
        ' · ' +
        (returned ? returned.toLocaleString() + ' credits returned' : 'No credits returned')
    );
    setPhase('done');
    setPoint(null);
  };

  const roll = () => {
    const pair = rollDicePair();
    setDice(pair);
    const sum = pair[0] + pair[1];
    if (phase === 'bet') {
      if (!debit(stake)) return;
      const r = comeOutResult(sum);
      if (r === 'win') {
        // Stake was just debited; settle immediately.
        const returned = stake * 2;
        credit(returned);
        record('emberdice', stake, returned);
        setResult(
          'Come-out ' + sum + ' — a natural! · ' + returned.toLocaleString() + ' credits returned'
        );
        setPhase('done');
      } else if (r === 'lose') {
        record('emberdice', stake, 0);
        setResult('Come-out ' + sum + ' — no luck this time · No credits returned');
        setPhase('done');
      } else {
        setPoint(sum);
        setPhase('point');
        setResult('Point is ' + sum + '. Roll it again before a 7 to win.');
      }
    } else if (phase === 'point') {
      if (sum === point) {
        finish(true, 'Rolled ' + sum + ' — point made!');
      } else if (sum === 7) {
        finish(false, 'Seven-out — the point was ' + point);
      } else {
        setResult('Rolled ' + sum + '. Point is still ' + point + ' — roll again.');
      }
    }
  };

  const startNew = () => {
    setPhase('bet');
    setResult('');
    setPoint(null);
  };

  return (
    <div>
      <Stage label={'Dice show ' + dice[0] + ' and ' + dice[1]}>
        <DieFace value={dice[0]} />
        <DieFace value={dice[1]} />
        {point !== null && (
          <span className="ml-2 border border-[var(--gold-deep)] bg-[var(--gold)] text-[#241a02] font-bold rounded-full px-3 py-1.5">
            Point: {point}
          </span>
        )}
      </Stage>

      {phase === 'done' ? (
        <div className="flex items-end gap-3 flex-wrap">
          <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
          <button
            onClick={startNew}
            disabled={stake > balance}
            className={actionClass}
          >
            New round
          </button>
        </div>
      ) : phase === 'bet' ? (
        <div className="flex items-end gap-3 flex-wrap">
          <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
          <button onClick={roll} disabled={stake > balance} className={actionClass}>
            Come-out roll
          </button>
        </div>
      ) : (
        <button onClick={roll} className={actionClass}>
          Roll for the point ({point})
        </button>
      )}

      <ResultLine text={result} />
    </div>
  );
}

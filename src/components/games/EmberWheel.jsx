import { useEffect, useRef, useState } from 'react';
import { spinWheel, wheelColor, wheelPayout } from '../../lib/casino.js';
import { StakePicker, ResultLine, Stage, actionClass, chipClass } from './ui.jsx';

const EVEN_MONEY = [
  { type: 'red', label: 'Red', pays: '1:1' },
  { type: 'black', label: 'Black', pays: '1:1' },
  { type: 'even', label: 'Even', pays: '1:1' },
  { type: 'odd', label: 'Odd', pays: '1:1' },
];

const COLOR_STYLE = {
  red: 'background:#b3232a;color:#fff',
  black: 'background:#181c26;color:#fff',
  green: 'background:#1d7a3a;color:#fff',
};

// Ember Wheel — a single-zero numbered wheel. Back red, black, even or odd
// at 1:1, or one straight number at 35:1.
export default function EmberWheel({ balance, pro, settle }) {
  const [stake, setStake] = useState(10);
  const [bet, setBet] = useState({ type: 'red' });
  const [display, setDisplay] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const spin = () => {
    if (spinning) return;
    const final = spinWheel();
    setSpinning(true);
    setResult('');
    timer.current = setInterval(() => setDisplay(spinWheel()), 60);
    setTimeout(() => {
      clearInterval(timer.current);
      setDisplay(final);
      setSpinning(false);
      const multiple = wheelPayout(bet, final);
      const returned = settle('wheel', stake, multiple);
      if (returned === null) return;
      setResult(
        'The wheel stops on ' +
          final +
          ' ' +
          wheelColor(final) +
          ' · ' +
          (returned === stake
            ? 'Stake returned'
            : returned
              ? returned.toLocaleString() + ' credits returned'
              : 'No credits returned')
      );
    }, 750);
  };

  const betLabel =
    bet.type === 'number' ? 'Number ' + bet.number : EVEN_MONEY.find((b) => b.type === bet.type)?.label;

  return (
    <div>
      <Stage label={display === null ? 'Wheel ready' : 'Wheel shows ' + display}>
        <span
          className="grid place-items-center rounded-full w-[clamp(5rem,22vw,8rem)] aspect-square font-black text-[clamp(2rem,8vw,3.4rem)] leading-none border-4 border-[var(--gold-deep)]"
          style={
            display === null
              ? { background: '#0e1a3d', color: 'var(--gold)' }
              : Object.fromEntries(
                  COLOR_STYLE[wheelColor(display)].split(';').map((p) => {
                    const [k, v] = p.split(':');
                    return [k === 'background' ? 'backgroundColor' : k, v];
                  })
                )
          }
          aria-hidden="true"
        >
          {display === null ? '?' : display}
        </span>
      </Stage>

      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Even-money bets">
        {EVEN_MONEY.map((b) => (
          <button
            key={b.type}
            onClick={() => setBet({ type: b.type })}
            aria-pressed={String(bet.type === b.type)}
            className={
              chipClass +
              (bet.type === b.type
                ? ' bg-[var(--gold)] text-[#241a02] border-[var(--gold-deep)]'
                : ' bg-[var(--panel)] text-[var(--text)] border-[var(--edge)] hover:border-[var(--gold)]')
            }
          >
            {b.label} · {b.pays}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 flex-wrap text-[var(--muted)] text-sm mb-4">
        Or one straight number (35:1)
        <select
          value={bet.type === 'number' ? bet.number : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v !== '') setBet({ type: 'number', number: Number(v) });
          }}
          className="border border-[var(--edge)] rounded-[0.65rem] bg-[var(--panel)] px-3 py-2.5 min-h-[44px] text-[var(--text)] cursor-pointer"
        >
          <option value="">Pick a number…</option>
          {Array.from({ length: 37 }, (_, n) => (
            <option key={n} value={n}>
              {n} ({wheelColor(n)})
            </option>
          ))}
        </select>
        {bet.type === 'number' && <span className="text-[var(--gold)]">Betting on {bet.number}</span>}
      </label>

      <div className="flex items-end gap-3 flex-wrap">
        <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
        <button onClick={spin} disabled={spinning || stake > balance} className={actionClass}>
          {spinning ? 'Spinning…' : 'Spin on ' + betLabel}
        </button>
      </div>

      <ResultLine text={result} />
    </div>
  );
}

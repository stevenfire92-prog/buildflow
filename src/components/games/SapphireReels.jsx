import { useState } from 'react';
import { SLOT_SYMBOLS, spinReels } from '../../lib/casino.js';
import { StakePicker, ResultLine, Stage } from './ui.jsx';

export default function SapphireReels({ balance, pro, settle }) {
  const [stake, setStake] = useState(10);
  const [symbols, setSymbols] = useState(() =>
    SLOT_SYMBOLS.slice(1, 4)
  );
  const [result, setResult] = useState('');

  const spin = () => {
    const outcome = spinReels();
    const returned = settle('reels', stake, outcome.multiple);
    if (returned === null) return;
    setSymbols(outcome.symbols);
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
      <Stage label={'Reels show ' + symbols.map((s) => s.name).join(', ')}>
        {symbols.map((s, i) => (
          <span
            key={i}
            className="grid place-items-center bg-[#0e1a3d] border border-[var(--gold-deep)] rounded-[0.85rem] w-[clamp(3.8rem,18vw,7rem)] aspect-square text-[clamp(2rem,7vw,4rem)] leading-none sapphire-pop"
            aria-hidden="true"
          >
            {s.icon}
          </span>
        ))}
      </Stage>

      <div className="flex items-end gap-3 flex-wrap">
        <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
        <button
          onClick={spin}
          disabled={stake > balance}
          className="border border-[var(--gold-deep)] rounded-[0.65rem] bg-[var(--gold)] text-[#241a02] font-bold px-6 py-2.5 min-h-[44px] cursor-pointer transition hover:brightness-110 disabled:opacity-50 disabled:cursor-default"
        >
          Spin
        </button>
      </div>

      <ResultLine text={result} />

      <div className="mt-4 grid gap-1.5 text-sm text-[var(--muted)] sm:grid-cols-2">
        {SLOT_SYMBOLS.map((s) => (
          <p key={s.id}>
            {s.icon} {s.icon} {s.icon} — three {s.name}s pay {s.pay}×
          </p>
        ))}
        <p>Any pair returns your stake.</p>
      </div>
    </div>
  );
}

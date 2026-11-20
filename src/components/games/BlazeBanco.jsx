import { useState } from 'react';
import { newShoe } from '../../lib/cards.js';
import { playBancoHand, bancoPayout } from '../../lib/casino.js';
import { StakePicker, PlayingCard, ResultLine, Stage, actionClass, chipClass } from './ui.jsx';

const BETS = [
  { type: 'player', label: 'Player', pays: '1:1' },
  { type: 'banker', label: 'Banker', pays: '1:1 less 5%' },
  { type: 'tie', label: 'Tie', pays: '8:1' },
];

// Blaze Banco — back Player, Banker or Tie. Two cards each, full third-card
// rules, closest to 9 wins. Banker wins pay a 5% commission, as in the
// classic game.
export default function BlazeBanco({ balance, pro, debit, credit, record }) {
  const [stake, setStake] = useState(10);
  const [betType, setBetType] = useState('player');
  const [hand, setHand] = useState(null);
  const [result, setResult] = useState('');

  const deal = () => {
    if (!debit(stake)) return;
    const played = playBancoHand(newShoe());
    setHand(played);
    const multiple = bancoPayout(betType, played.winner);
    const returned = Math.floor(stake * multiple + 1e-9);
    if (returned > 0) credit(returned);
    record('banco', stake, returned);
    const winnerLabel =
      played.winner === 'tie'
        ? 'Tie at ' + played.playerValue
        : (played.winner === 'player' ? 'Player' : 'Banker') +
          ' wins, ' +
          Math.max(played.playerValue, played.bankerValue) +
          ' over ' +
          Math.min(played.playerValue, played.bankerValue);
    setResult(
      winnerLabel +
        ' · Your bet: ' +
        BETS.find((b) => b.type === betType).label +
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
      <Stage
        label={
          hand
            ? 'Player ' + hand.playerValue + ', Banker ' + hand.bankerValue
            : 'No hand dealt yet'
        }
      >
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-sm w-16 text-right">Player</span>
            {hand ? (
              hand.playerCards.map((c, i) => <PlayingCard key={i} card={c} small />)
            ) : (
              <span className="text-3xl">🂠 🂠</span>
            )}
            {hand && (
              <span className="text-[var(--gold)] font-bold tabular-nums">{hand.playerValue}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-sm w-16 text-right">Banker</span>
            {hand ? (
              hand.bankerCards.map((c, i) => <PlayingCard key={i} card={c} small />)
            ) : (
              <span className="text-3xl">🂠 🂠</span>
            )}
            {hand && (
              <span className="text-[var(--gold)] font-bold tabular-nums">{hand.bankerValue}</span>
            )}
          </div>
        </div>
      </Stage>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Choose your bet">
        {BETS.map((b) => (
          <button
            key={b.type}
            onClick={() => setBetType(b.type)}
            aria-pressed={String(betType === b.type)}
            className={
              chipClass +
              (betType === b.type
                ? ' bg-[var(--gold)] text-[#241a02] border-[var(--gold-deep)]'
                : ' bg-[var(--panel)] text-[var(--text)] border-[var(--edge)] hover:border-[var(--gold)]')
            }
          >
            {b.label} · {b.pays}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <StakePicker stake={stake} setStake={setStake} pro={pro} balance={balance} />
        <button onClick={deal} disabled={stake > balance} className={actionClass}>
          Deal
        </button>
      </div>

      <ResultLine text={result} />
    </div>
  );
}

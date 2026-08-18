import { Caption, Cell, Radio } from '@telegram-apps/telegram-ui';
import type { PaymentMethodOut } from '../types';

const SUBTITLES: Record<string, string> = {
  platega: 'RUB',
  cryptobot: 'USDT, TON, USDC, BTC',
  stars: 'XTR',
};

interface PaymentMethodRowProps {
  method: PaymentMethodOut;
  selected: boolean;
  onSelect: () => void;
}

export default function PaymentMethodRow({ method, selected, onSelect }: PaymentMethodRowProps) {
  const [emoji, ...rest] = method.label.split(' ');

  return (
    <Cell
      className={`rounded-2xl bg-surface ${selected ? 'ring-2 ring-accent' : ''}`}
      onClick={onSelect}
      before={
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-lg">{emoji}</span>
        </div>
      }
      subtitle={<Caption className="text-muted">{SUBTITLES[method.id] ?? ''}</Caption>}
      after={<Radio name="payment-method" checked={selected} onChange={onSelect} readOnly />}
    >
      {rest.join(' ')}
    </Cell>
  );
}

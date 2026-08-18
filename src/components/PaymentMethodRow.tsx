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
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left ${
        selected ? 'ring-2 ring-accent' : ''
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-lg">{emoji}</span>
      <div className="flex-1">
        <span className="block text-sm font-semibold">{rest.join(' ')}</span>
        <span className="block text-xs text-muted">{SUBTITLES[method.id] ?? ''}</span>
      </div>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? 'border-accent' : 'border-white/20'
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
      </span>
    </button>
  );
}

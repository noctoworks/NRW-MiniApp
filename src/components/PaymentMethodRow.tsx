import type { PaymentMethodOut } from '../types';

const SUBTITLES: Record<string, string> = {
  platega: 'RUB',
  cryptobot: 'USDT, TON, USDC, BTC',
  stars: 'XTR',
};

const TITLES: Record<string, string> = {
  platega: 'Система Быстрых Платежей',
  cryptobot: 'Криптовалюта',
  stars: 'Telegram Stars',
};

interface PaymentMethodRowProps {
  method: PaymentMethodOut;
  selected: boolean;
  onSelect: () => void;
}

function MethodIcon({ id, emoji }: { id: string; emoji: string }) {
  // Реальный SVG-логотип есть только для СБП (единственный подключённый провайдер,
  // см. решение "Только Platega (СБП/карты)") — для остальных, если backend
  // когда-нибудь их вернёт, используем эмодзи-плейсхолдер вместо чужого бренд-лого.
  if (id === 'platega') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 rounded-lg">
        <rect width="40" height="40" fill="#fff" rx="8" />
        <path fill="#5b57a2" d="m7 10.183 4.033 7.143v4.357l-4.028 7.13z" />
        <path fill="#d90751" d="m22.486 14.727 3.78-2.295L34 12.425l-11.514 6.988z" />
        <path fill="#fab718" d="m22.465 10.14.021 9.458-4.043-2.461V3z" />
        <path fill="#ed6f26" d="m34 12.425-7.735.007-3.8-2.291L18.443 3z" />
        <path fill="#63b22f" d="M22.486 28.852v-4.588l-4.043-2.415L18.446 36z" />
        <path fill="#1487c9" d="m26.256 26.578-15.223-9.252L7 10.183l26.984 16.385z" />
        <path fill="#017f36" d="m18.446 36 4.04-7.148 3.77-2.274 7.727-.01z" />
        <path fill="#984995" d="m7.005 28.812 11.471-6.963-3.856-2.344-3.587 2.178z" />
      </svg>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-lg">
      {emoji}
    </span>
  );
}

export default function PaymentMethodRow({ method, selected, onSelect }: PaymentMethodRowProps) {
  const [emoji] = method.label.split(' ');

  return (
    <button type="button" onClick={onSelect} className={`plan-card w-full !items-center ${selected ? 'selected-primary' : ''}`}>
      <div className="flex items-center gap-3">
        <MethodIcon id={method.id} emoji={emoji} />
        <div className="text-left">
          <div className="text-body font-semibold text-white">{TITLES[method.id] ?? method.label}</div>
          <div className="text-subtitle2 text-[hsl(var(--subtitle-foreground))]">{SUBTITLES[method.id] ?? ''}</div>
        </div>
      </div>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-[hsl(var(--primary))]' : 'border-[hsl(var(--subtitle-foreground))]'
        }`}
      >
        {selected && <div className="h-3 w-3 rounded-full bg-[hsl(var(--primary))]" />}
      </div>
    </button>
  );
}

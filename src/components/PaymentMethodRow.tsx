import type { PaymentMethodOut } from '../types';

const SUBTITLES: Record<string, string> = {
  platega: 'RUB',
  stars: 'XTR',
  ton: 'TON Connect',
};

const TITLES: Record<string, string> = {
  platega: 'Система Быстрых Платежей',
  stars: 'Telegram Stars',
  ton: 'TON',
};

interface PaymentMethodRowProps {
  method: PaymentMethodOut;
  selected: boolean;
  onSelect: () => void;
}

function MethodIcon({ id }: { id: string }) {
  // Реальный SVG-логотип для каждого подключённого способа оплаты — раньше
  // для crypto/stars был эмодзи-плейсхолдер в сером квадрате, СБП выделялся
  // на их фоне (см. диалог "давай добавим картинки"). Свои иконки, не чужие
  // бренд-лого один в один — только опознаваемая форма/цвет.
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

  if (id === 'stars') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 rounded-lg">
        <defs>
          <linearGradient id="stars-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFC94A" />
            <stop offset="1" stopColor="#FF9F0A" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill="url(#stars-bg)" rx="8" />
        {/* Четырёхлучевая звезда-искра — тот же силуэт, что у иконки Telegram
         * Stars, не растровая копия оригинала. */}
        <path
          fill="#fff"
          d="M20 8c.7 4.2 2.1 6.9 4.4 8.6 2.3 1.7 5.1 2.4 7.6 2.4-2.5 0-5.3.7-7.6 2.4-2.3 1.7-3.7 4.4-4.4 8.6-.7-4.2-2.1-6.9-4.4-8.6C13.3 20.1 10.5 19.4 8 19.4c2.5 0 5.3-.7 7.6-2.4 2.3-1.7 3.7-4.4 4.4-8.6z"
        />
      </svg>
    );
  }

  if (id === 'ton') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 rounded-lg">
        <rect width="40" height="40" fill="#0098EA" rx="8" />
        {/* Силуэт "бриллианта" TON — узнаваемая форма логотипа, не растровая копия. */}
        <path fill="#fff" d="M12 13h16a2 2 0 0 1 1.74 2.99l-7.02 12.16a1 1 0 0 1-1.73 0l-7.02-12.16A2 2 0 0 1 12 13z" />
        <path fill="#0098EA" d="M19 16v9.3L13.9 16.6a.5.5 0 0 1 .43-.6z" opacity="0.35" />
      </svg>
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-lg">
      💳
    </span>
  );
}

export default function PaymentMethodRow({ method, selected, onSelect }: PaymentMethodRowProps) {
  return (
    <button type="button" onClick={onSelect} className={`plan-card w-full ${selected ? 'selected-primary' : ''}`}>
      <div className="flex items-center gap-3">
        <MethodIcon id={method.id} />
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

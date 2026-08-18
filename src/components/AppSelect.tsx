import { Caption } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { VPN_APPS, type VpnApp } from '../lib/deeplink';

interface AppSelectProps {
  selected: VpnApp;
  onSelect: (app: VpnApp) => void;
}

// Нативный <select> (даже стилизованный через TelegramUI Select) не даёт
// отрисовать выпадающий список под макет — попап всегда браузерный. Поэтому
// здесь свой дропдаун, а не telegram-ui/Select.
export default function AppSelect({ selected, onSelect }: AppSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full flex-col items-start gap-1 rounded-2xl bg-surface px-4 py-3 text-left ${open ? 'ring-1 ring-accent' : ''}`}
      >
        <Caption className="text-muted">Приложение</Caption>
        <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
          <span className="truncate">{selected.name}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-48 overflow-hidden rounded-2xl bg-surface-2 py-1 shadow-xl">
          {VPN_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                onSelect(app);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${app.id === selected.id ? 'text-accent' : 'text-white'} active:bg-white/5`}
            >
              {app.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

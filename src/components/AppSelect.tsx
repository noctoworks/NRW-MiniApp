import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { hapticSelection } from '../lib/haptics';

interface AppOption {
  id: string;
  name: string;
}

interface AppSelectProps {
  options: AppOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Нативный <select> (даже стилизованный через TelegramUI Select) не даёт
// отрисовать выпадающий список под макет — попап всегда браузерный. Поэтому
// здесь свой дропдаун, а не telegram-ui/Select. Список приложений теперь
// приходит с бэкенда (Subpage Builder Remnawave, см. api/cabinet.ts::getConnectApps),
// а не захардкожен — раньше половина схем подключения в нём была неверна.
export default function AppSelect({ options, selectedId, onSelect }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  if (!selected) return null;

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`card !py-2.5 !pr-3 !pl-4 flex w-full flex-col items-start gap-1 !rounded-2xl text-left ${open ? 'ring-1 ring-[hsl(var(--primary))]' : ''}`}
      >
        <span className="text-xs text-[hsl(var(--subtitle-foreground))]">Приложение</span>
        <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
          <span className="truncate">{selected.name}</span>
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={`shrink-0 text-[hsl(var(--subtitle-foreground))] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-48 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (opt.id !== selected.id) hapticSelection();
                onSelect(opt.id);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${opt.id === selected.id ? 'text-[hsl(var(--primary))]' : 'text-white'} active:bg-white/5`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

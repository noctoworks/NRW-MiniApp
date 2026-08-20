import { ChevronDown, Laptop } from 'lucide-react';
import { useState } from 'react';
import { hapticSelection } from '../lib/haptics';

interface PlatformOption {
  key: string;
  label: string;
}

interface PlatformPickerProps {
  options: PlatformOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

/** Компактный пикер платформы в шапке страницы "Настройка VPN" — см. референс
 * (sub_page): "Windows ▾" в правом верхнем углу, в одну строку, без подписи
 * сверху (в отличие от AppSelect на главном экране). */
export default function PlatformPicker({ options, selectedKey, onSelect }: PlatformPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === selectedKey) ?? options[0];

  if (!selected) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-2xl bg-[hsl(var(--card))] px-3.5 py-2.5 text-sm font-semibold text-white ${open ? 'ring-1 ring-[hsl(var(--primary))]' : ''}`}
      >
        <Laptop size={16} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
        {selected.label}
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`text-[hsl(var(--subtitle-foreground))] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-44 overflow-hidden rounded-2xl bg-[hsl(var(--muted))] py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                if (opt.key !== selected.key) hapticSelection();
                onSelect(opt.key);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${opt.key === selected.key ? 'text-[hsl(var(--primary))]' : 'text-white'} active:bg-white/5`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

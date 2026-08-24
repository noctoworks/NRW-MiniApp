import { Input } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { hapticImpact, hapticNotification } from '../../lib/haptics';

interface GrantSubscriptionFormProps {
  onSubmit: (days: number) => Promise<void>;
}

function parsePositiveDays(raw: string): number | null {
  const days = Math.trunc(Number(raw));
  return days > 0 ? days : null;
}

/** Отдельная кнопка для юзера БЕЗ подписки — раньше приходилось нажимать
 * «Продлить» (см. DualActionAmountForm), что не читалось как «выдать новую»
 * и всегда показывало ненужную здесь кнопку «Сократить» (сокращать нечего,
 * бэкенд и так вернёт 400). Один пресет дней + подтверждение, использует тот
 * же эндпоинт (POST .../subscription-days), что и продление — на бэкенде он
 * сам создаёт подписку по активному тарифу, если её ещё нет. */
export default function GrantSubscriptionForm({ onSubmit }: GrantSubscriptionFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    const days = parsePositiveDays(value);
    if (!days) return;
    setSubmitting(true);
    try {
      await onSubmit(days);
      hapticNotification('success');
      setOpen(false);
      setValue('');
    } catch {
      hapticNotification('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          hapticImpact('light');
          setOpen((v) => !v);
          setValue('');
        }}
        className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          open ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
        }`}
      >
        Выдать подписку
      </button>

      {open && (
        <div className="animate-fade-in flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {[7, 30, 90].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  hapticImpact('light');
                  setValue(String(preset));
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  value === String(preset)
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                header="Дни"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Количество дней"
                inputMode="decimal"
                autoFocus
              />
            </div>
            <button
              type="button"
              disabled={submitting || !parsePositiveDays(value)}
              onClick={handleConfirm}
              className="h-[52px] shrink-0 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Выдать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

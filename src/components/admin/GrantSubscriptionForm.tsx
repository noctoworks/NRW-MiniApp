import { Button, Text, TextInput } from '@gravity-ui/uikit';
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
      <Button
        view={open ? 'action' : 'outlined-action'}
        size="l"
        onClick={() => {
          hapticImpact('light');
          setOpen((v) => !v);
          setValue('');
        }}
      >
        Выдать подписку
      </Button>

      {open && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {[7, 30, 90].map((preset) => (
              <Button
                key={preset}
                view={value === String(preset) ? 'action' : 'outlined'}
                size="s"
                onClick={() => {
                  hapticImpact('light');
                  setValue(String(preset));
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Text variant="caption-2" color="secondary">
                Дни
              </Text>
              <TextInput
                value={value}
                onUpdate={setValue}
                placeholder="Количество дней"
                controlProps={{ inputMode: 'decimal' }}
                autoFocus
              />
            </div>
            <Button view="action" size="l" disabled={submitting || !parsePositiveDays(value)} onClick={handleConfirm}>
              Выдать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

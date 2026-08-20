import { Input } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { hapticImpact, hapticNotification } from '../../lib/haptics';

interface DualActionAmountFormProps {
  /** "Начислить" / "Продлить" — зелёная кнопка, положительное значение. */
  positiveLabel: string;
  /** "Списать" / "Сократить" — красная кнопка, отрицательное значение. */
  negativeLabel: string;
  inputHeader: string;
  placeholder: string;
  /** Парсит текст поля в положительное число или null, если ввод некорректен
   * (пусто/не число/≤0) — знак применяет сама форма по нажатой кнопке. */
  parse: (raw: string) => number | null;
  onSubmit: (signedAmount: number) => Promise<void>;
}

/** Две кнопки ("списать"/"начислить" или "сократить"/"продлить"), каждая
 * открывает один и тот же инлайн-паналь с полем ввода — вместо одного поля,
 * где нужно было самому додуматься ставить минус для списания (см. диалог:
 * "добавить кнопки окно где вводится сумма, и потом списать или начислить").
 * Общий компонент для баланса и дней подписки — форма одна и та же, отличаются
 * только подписи/парсинг числа. */
export default function DualActionAmountForm({
  positiveLabel,
  negativeLabel,
  inputHeader,
  placeholder,
  parse,
  onSubmit,
}: DualActionAmountFormProps) {
  const [mode, setMode] = useState<'positive' | 'negative' | null>(null);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openMode = (next: 'positive' | 'negative') => {
    hapticImpact('light');
    setMode((current) => (current === next ? null : next));
    setValue('');
  };

  const handleConfirm = async () => {
    const amount = parse(value);
    if (!amount || !mode) return;
    setSubmitting(true);
    try {
      await onSubmit(mode === 'positive' ? amount : -amount);
      hapticNotification('success');
      setMode(null);
      setValue('');
    } catch {
      hapticNotification('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => openMode('positive')}
          className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            mode === 'positive'
              ? 'bg-[hsl(var(--primary))] text-white'
              : 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'
          }`}
        >
          {positiveLabel}
        </button>
        <button
          type="button"
          onClick={() => openMode('negative')}
          className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            mode === 'negative'
              ? 'bg-[hsl(var(--destructive))] text-white'
              : 'bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))]'
          }`}
        >
          {negativeLabel}
        </button>
      </div>

      {mode && (
        <div className="animate-fade-in flex items-end gap-2">
          <div className="flex-1">
            <Input
              header={inputHeader}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              inputMode="decimal"
              autoFocus
            />
          </div>
          <button
            type="button"
            disabled={submitting || !parse(value)}
            onClick={handleConfirm}
            className={`h-[52px] shrink-0 rounded-xl px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40 ${
              mode === 'positive' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--destructive))]'
            }`}
          >
            {mode === 'positive' ? positiveLabel : negativeLabel}
          </button>
        </div>
      )}
    </div>
  );
}

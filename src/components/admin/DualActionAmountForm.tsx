import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useState } from 'react';
import { hapticImpact, hapticNotification } from '../../lib/haptics';

interface DualActionAmountFormProps {
  /** "Начислить" / "Продлить" — акцентная кнопка, положительное значение. */
  positiveLabel: string;
  /** "Списать" / "Сократить" — опасная кнопка, отрицательное значение. */
  negativeLabel: string;
  inputHeader: string;
  placeholder: string;
  /** Парсит текст поля в положительное число или null, если ввод некорректен
   * (пусто/не число/≤0) — знак применяет сама форма по нажатой кнопке. */
  parse: (raw: string) => number | null;
  onSubmit: (signedAmount: number) => Promise<void>;
  /** Быстрые пресеты значения (например [100, 500, 1000] для ₽ или [7, 30]
   * для дней) — по практике админ-панелей типовое начисление/продление на
   * "круглую" сумму должно занимать один тап, а не набор числа руками (см.
   * диалог "давай поправим админку" / research по грантам баланса). */
  presets: number[];
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
  presets,
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
        <Button view={mode === 'positive' ? 'action' : 'outlined-action'} size="l" onClick={() => openMode('positive')}>
          {positiveLabel}
        </Button>
        <Button view={mode === 'negative' ? 'outlined-danger' : 'flat-danger'} size="l" onClick={() => openMode('negative')}>
          {negativeLabel}
        </Button>
      </div>

      {mode && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <Button
                key={preset}
                view={value === String(preset) ? (mode === 'positive' ? 'action' : 'outlined-danger') : 'outlined'}
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
                {inputHeader}
              </Text>
              <TextInput
                value={value}
                onUpdate={setValue}
                placeholder={placeholder}
                controlProps={{ inputMode: 'decimal' }}
                autoFocus
              />
            </div>
            <Button
              view={mode === 'positive' ? 'action' : 'outlined-danger'}
              size="l"
              disabled={submitting || !parse(value)}
              onClick={handleConfirm}
            >
              {mode === 'positive' ? positiveLabel : negativeLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

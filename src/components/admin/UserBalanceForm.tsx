import { Button, Input } from '@telegram-apps/telegram-ui';
import { useState } from 'react';

interface UserBalanceFormProps {
  onSubmit: (amountRub: number) => Promise<void>;
}

export default function UserBalanceForm({ onSubmit }: UserBalanceFormProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const amount = Number.parseFloat(value.replace(',', '.'));
    if (!amount) return;
    setSubmitting(true);
    try {
      await onSubmit(amount);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          header="Баланс"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Сумма в ₽ (можно отрицательную)"
          inputMode="decimal"
        />
      </div>
      <Button mode="filled" size="m" disabled={submitting || !value} onClick={handleSubmit}>
        Применить
      </Button>
    </div>
  );
}

import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useState } from 'react';

interface ReferralCommissionFormProps {
  value: number | null;
  onSubmit: (percent: number | null) => Promise<void>;
}

export default function ReferralCommissionForm({ value, onSubmit }: ReferralCommissionFormProps) {
  const [input, setInput] = useState(value === null ? '' : String(value));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    const percent = trimmed === '' ? null : Number.parseInt(trimmed, 10);
    if (percent !== null && (Number.isNaN(percent) || percent < 0 || percent > 100)) return;
    setSubmitting(true);
    try {
      await onSubmit(percent);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1">
        <Text variant="caption-2" color="secondary">
          Персональный % рефералки
        </Text>
        <TextInput value={input} onUpdate={setInput} placeholder="По умолчанию (глобальный)" controlProps={{ inputMode: 'numeric' }} />
      </div>
      <Button view="action" size="m" disabled={submitting} onClick={handleSubmit}>
        Сохранить
      </Button>
    </div>
  );
}

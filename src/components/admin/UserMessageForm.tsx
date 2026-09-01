import { Button, Text, TextInput } from '@gravity-ui/uikit';
import { useState } from 'react';

interface UserMessageFormProps {
  onSubmit: (text: string) => Promise<void>;
}

export default function UserMessageForm({ onSubmit }: UserMessageFormProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1">
        <Text variant="caption-2" color="secondary">
          Сообщение
        </Text>
        <TextInput value={text} onUpdate={setText} placeholder="Текст сообщения пользователю" />
      </div>
      <Button view="action" size="m" disabled={submitting || !text.trim()} onClick={handleSubmit}>
        {sent ? 'Отправлено' : 'Отправить'}
      </Button>
    </div>
  );
}

import { Button, Input } from '@telegram-apps/telegram-ui';
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
      <div className="flex-1">
        <Input
          header="Сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст сообщения пользователю"
        />
      </div>
      <Button mode="filled" size="m" disabled={submitting || !text.trim()} onClick={handleSubmit}>
        {sent ? 'Отправлено' : 'Отправить'}
      </Button>
    </div>
  );
}

import { useQueryClient } from '@tanstack/react-query';
import { Button, Section } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { syncFromPanel, syncToPanel } from '../../api/admin';

interface SyncSectionProps {
  userId: number;
}

export default function SyncSection({ userId }: SyncSectionProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });

  const handle = async (direction: 'from' | 'to') => {
    setBusy(true);
    setMessage(null);
    try {
      const result = direction === 'from' ? await syncFromPanel(userId) : await syncToPanel(userId);
      setMessage(result.status === 'synced' ? 'Синхронизировано' : result.status);
      await invalidate();
    } catch {
      setMessage('Не удалось синхронизировать — проверьте, что у пользователя есть remnawave_uuid и подписка');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section header="Синхронизация с Remnawave" footer={message ?? undefined}>
      <div className="flex gap-2 px-4 py-3">
        <Button mode="gray" size="m" disabled={busy} onClick={() => handle('from')}>
          Из панели
        </Button>
        <Button mode="gray" size="m" disabled={busy} onClick={() => handle('to')}>
          В панель
        </Button>
      </div>
    </Section>
  );
}

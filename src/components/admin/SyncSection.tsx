import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Text } from '@gravity-ui/uikit';
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
    <Card view="outlined" className="flex flex-col gap-2 p-4">
      <Text variant="subheader-1">Синхронизация с Remnawave</Text>
      <div className="flex gap-2">
        <Button view="outlined" size="m" disabled={busy} onClick={() => handle('from')}>
          Из панели
        </Button>
        <Button view="outlined" size="m" disabled={busy} onClick={() => handle('to')}>
          В панель
        </Button>
      </div>
      {message && (
        <Text variant="caption-2" color="secondary">
          {message}
        </Text>
      )}
    </Card>
  );
}

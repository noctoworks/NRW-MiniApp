import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cell, IconButton, Section } from '@telegram-apps/telegram-ui';
import { getUserDevices, removeDevice, resetDevices } from '../../api/admin';
import { formatDate } from '../../lib/format';

interface DevicesSectionProps {
  userId: number;
}

export default function DevicesSection({ userId }: DevicesSectionProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'user', userId, 'devices'], queryFn: () => getUserDevices(userId) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId, 'devices'] });

  const handleRemove = async (hwid: string) => {
    await removeDevice(userId, hwid);
    await invalidate();
  };

  const handleResetAll = async () => {
    if (!window.confirm('Сбросить все устройства пользователя?')) return;
    await resetDevices(userId);
    await invalidate();
  };

  return (
    <Section header="Устройства" footer={data && data.length > 0 ? undefined : 'Нет активных устройств или подписка не оформлена'}>
      {isLoading ? (
        <Cell className="text-muted">Загрузка…</Cell>
      ) : (
        data?.map((device) => (
          <Cell
            key={device.hwid}
            subtitle={device.created_at ? `с ${formatDate(device.created_at)}` : undefined}
            after={
              <IconButton mode="plain" size="s" aria-label="Удалить устройство" onClick={() => handleRemove(device.hwid)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </IconButton>
            }
          >
            {device.device_model || device.platform || device.hwid}
          </Cell>
        ))
      )}
      {data && data.length > 0 && (
        <Cell onClick={handleResetAll} className="text-red-400">
          Сбросить все устройства
        </Cell>
      )}
    </Section>
  );
}

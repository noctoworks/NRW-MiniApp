import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Xmark } from '@gravity-ui/icons';
import { Button, Card, Icon, Text } from '@gravity-ui/uikit';
import { getUserDevices, removeDevice, resetDevices } from '../../api/admin';
import { formatDate } from '../../lib/format';
import { confirmDialog } from '../../lib/nativeDialogs';
import { AdminErrorState } from './AdminEmptyState';

interface DevicesSectionProps {
  userId: number;
}

export default function DevicesSection({ userId }: DevicesSectionProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'user', userId, 'devices'],
    queryFn: () => getUserDevices(userId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId, 'devices'] });

  const handleRemove = async (hwid: string) => {
    await removeDevice(userId, hwid);
    await invalidate();
  };

  const handleResetAll = async () => {
    if (!(await confirmDialog('Сбросить все устройства пользователя?'))) return;
    await resetDevices(userId);
    await invalidate();
  };

  return (
    <Card view="outlined" className="flex flex-col">
      <Text variant="subheader-1" className="block p-4 pb-2">
        Устройства
      </Text>
      {isLoading ? (
        <Text variant="body-1" color="secondary" className="block px-4 pb-3">
          Загрузка…
        </Text>
      ) : isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : (
        data?.map((device) => (
          <div
            key={device.hwid}
            className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3"
          >
            <div className="flex min-w-0 flex-col">
              <Text variant="body-1" ellipsis>
                {device.device_model || device.platform || device.hwid}
              </Text>
              {device.created_at && (
                <Text variant="caption-2" color="secondary">
                  с {formatDate(device.created_at)}
                </Text>
              )}
            </div>
            <Button view="flat-danger" size="s" aria-label="Удалить устройство" onClick={() => handleRemove(device.hwid)}>
              <Icon data={Xmark} size={15} />
            </Button>
          </div>
        ))
      )}
      {data && data.length > 0 ? (
        <Button view="flat-danger" size="m" onClick={handleResetAll} className="m-2">
          Сбросить все устройства
        </Button>
      ) : (
        !isLoading &&
        !isError && (
          <Text variant="caption-2" color="secondary" className="block px-4 pb-3">
            Нет активных устройств или подписка не оформлена
          </Text>
        )
      )}
    </Card>
  );
}

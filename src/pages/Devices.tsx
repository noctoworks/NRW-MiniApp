import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Laptop, Smartphone, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getDashboard, getDevices, removeDevice, resetDevices } from '../api/cabinet';
import Loader from '../components/Loader';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { formatDate } from '../lib/format';
import { hapticImpact, hapticNotification } from '../lib/haptics';
import { confirmDialog } from '../lib/nativeDialogs';

function isMobilePlatform(platform: string): boolean {
  return /ios|android/i.test(platform);
}

export default function Devices() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  const queryClient = useQueryClient();
  const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const { data: devices, isLoading, isError } = useQuery({ queryKey: ['devices'], queryFn: getDevices });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['devices'] });

  const handleRemove = async (hwid: string) => {
    hapticImpact('light');
    await removeDevice(hwid);
    hapticNotification('success');
    await invalidate();
  };

  const handleResetAll = async () => {
    if (!(await confirmDialog('Сбросить все подключённые устройства? Придётся заново добавить подписку в приложении.'))) return;
    hapticImpact('medium');
    await resetDevices();
    hapticNotification('success');
    await invalidate();
  };

  const limit = dashboard?.subscription?.device_limit;

  return (
    <main className="min-h-screen pb-10">
      <div
        className="px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">Мои устройства</h1>
        {typeof limit === 'number' && (
          <p className="mt-1 text-sm text-[hsl(var(--subtitle-foreground))]">
            Подключено {devices?.length ?? 0} {limit > 0 ? `из ${limit}` : '· без лимита'}
          </p>
        )}
      </div>

      {isLoading && <Loader inline label="Загружаем устройства…" />}

      {isError && (
        <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
          Не удалось загрузить список устройств. Попробуйте ещё раз чуть позже.
        </p>
      )}

      {!isLoading && !isError && devices && (
        <div className="animate-fade-in mt-4 flex flex-col gap-3 px-4">
          {devices.length === 0 ? (
            <p className="card text-center text-sm text-[hsl(var(--subtitle-foreground))]">
              Пока нет подключённых устройств — они появятся здесь после первого подключения.
            </p>
          ) : (
            <div className="card flex flex-col divide-y divide-white/5 !p-0">
              {devices.map((device) => {
                const Icon = isMobilePlatform(device.platform) ? Smartphone : Laptop;
                return (
                  <div key={device.hwid} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))]">
                      <Icon size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">
                        {device.device_model || device.platform || 'Неизвестное устройство'}
                      </div>
                      <div className="truncate text-xs text-[hsl(var(--subtitle-foreground))]">
                        {device.created_at ? `с ${formatDate(device.created_at)}` : device.hwid}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Отключить устройство"
                      onClick={() => handleRemove(device.hwid)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[hsl(var(--subtitle-foreground))] active:bg-white/10"
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {devices.length > 0 && (
            <button type="button" className="btn-secondary text-[hsl(var(--destructive))]" onClick={handleResetAll}>
              Сбросить все устройства
            </button>
          )}
        </div>
      )}
    </main>
  );
}

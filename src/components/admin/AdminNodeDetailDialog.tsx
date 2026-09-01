import { useQuery } from '@tanstack/react-query';
import { Card, Dialog, Label, Text } from '@gravity-ui/uikit';
import type { ReactNode } from 'react';
import { getNodeDetail } from '../../api/admin';
import { countryFlag, countryName, formatTrafficGb } from '../../lib/format';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  if (days > 0) return `${days} дн ${hours} ч`;
  return `${hours} ч`;
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--g-color-line-generic)] py-2 first:border-t-0">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="body-1" className="text-right">
        {children}
      </Text>
    </div>
  );
}

interface AdminNodeDetailDialogProps {
  nodeUuid: string | null;
  onClose: () => void;
}

/** Полная карточка ноды по клику на строку в /admin/nodes (диалог 2026-09-01:
 * "можем выводить всю инфу о ноде?") — панель реально отдаёт куда больше
 * полей, чем список показывает (см. NRW-Bot NodeDetailOut/get_node_detail).
 * system (CPU/RAM/uptime/loadAvg) — честно "нет данных", когда null, а не
 * спрятанный блок — агент наших нод это пока не репортит. */
export default function AdminNodeDetailDialog({ nodeUuid, onClose }: AdminNodeDetailDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'node', nodeUuid],
    queryFn: () => getNodeDetail(nodeUuid as string),
    enabled: nodeUuid !== null,
  });

  return (
    <Dialog open={nodeUuid !== null} onClose={onClose} maxWidth="m" hasCloseButton>
      <Dialog.Header caption={data?.name ?? 'Нода'} />
      <Dialog.Body className="flex flex-col gap-4 px-6 pb-6">
        {isLoading && (
          <Text variant="body-1" color="secondary">
            Загрузка…
          </Text>
        )}
        {isError && (
          <Text variant="body-1" color="danger">
            Не удалось загрузить ноду.
          </Text>
        )}
        {data && (
          <>
            <div className="flex flex-col">
              <InfoRow label="Статус">
                {data.is_disabled ? (
                  <Label theme="warning">Отключена</Label>
                ) : data.is_connected ? (
                  <Label theme="success">Online</Label>
                ) : (
                  <Label theme="danger">Offline</Label>
                )}
              </InfoRow>
              {data.last_status_message && <InfoRow label="Сообщение статуса">{data.last_status_message}</InfoRow>}
              {data.last_status_change && <InfoRow label="Статус изменился">{formatDateTime(data.last_status_change)}</InfoRow>}
              <InfoRow label="Регион">
                {countryFlag(data.country_code)} {countryName(data.country_code)}
              </InfoRow>
              <InfoRow label="Адрес">
                {data.address}
                {data.port ? `:${data.port}` : ''}
              </InfoRow>
              <InfoRow label="Онлайн сейчас">{data.users_online}</InfoRow>
              <InfoRow label="Аптайм xray">{formatUptime(data.xray_uptime_seconds)}</InfoRow>
              <InfoRow label="Версии">
                xray {data.versions.xray ?? '—'} · node {data.versions.node ?? '—'}
              </InfoRow>
              <InfoRow label="Трафик">
                {formatTrafficGb(data.traffic_used_gb)}
                {data.traffic_limit_gb ? ` из ${formatTrafficGb(data.traffic_limit_gb)}` : ' (без лимита)'}
              </InfoRow>
              {data.traffic_reset_day && <InfoRow label="Сброс трафика">{data.traffic_reset_day}-го числа</InfoRow>}
              {data.consumption_multiplier !== 1 && (
                <InfoRow label="Множитель расхода">×{data.consumption_multiplier}</InfoRow>
              )}
              {data.provider_name && <InfoRow label="Провайдер">{data.provider_name}</InfoRow>}
              {data.tags.length > 0 && <InfoRow label="Теги">{data.tags.join(', ')}</InfoRow>}
              {data.note && <InfoRow label="Заметка">{data.note}</InfoRow>}
              <InfoRow label="Добавлена">{formatDateTime(data.created_at)}</InfoRow>
            </div>

            <div className="flex flex-col gap-1.5">
              <Text variant="subheader-1">CPU / память</Text>
              <Card view="filled" className="p-3">
                <Text variant="body-2" color="secondary">
                  {data.system
                    ? JSON.stringify(data.system, null, 2)
                    : 'Панель не отдаёт эти данные для этой ноды — агент их не репортит.'}
                </Text>
              </Card>
            </div>
          </>
        )}
      </Dialog.Body>
    </Dialog>
  );
}

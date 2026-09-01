import { useQuery } from '@tanstack/react-query';
import { CircleCheckFill, CircleExclamationFill, CircleInfoFill, TriangleExclamationFill } from '@gravity-ui/icons';
import { Card, Icon, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getAlerts } from '../../api/admin';
import type { Alert, AlertSeverity } from '../../types';

const SEVERITY_ICON: Record<AlertSeverity, typeof CircleExclamationFill> = {
  critical: CircleExclamationFill,
  warning: TriangleExclamationFill,
  info: CircleInfoFill,
};

const SEVERITY_COLOR: Record<AlertSeverity, 'danger' | 'warning' | 'info'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
};

function AlertRow({ alert }: { alert: Alert }) {
  const navigate = useNavigate();
  const clickable = Boolean(alert.link);

  return (
    <div
      onClick={clickable ? () => navigate(alert.link as string) : undefined}
      className={`flex items-center gap-2.5 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0 ${
        clickable ? 'cursor-pointer hover:bg-[var(--g-color-base-simple-hover)]' : ''
      }`}
    >
      <Icon data={SEVERITY_ICON[alert.severity]} size={16} className={`shrink-0 text-[var(--g-color-text-${SEVERITY_COLOR[alert.severity]})]`} />
      <Text variant="body-1">{alert.title}</Text>
    </div>
  );
}

/** "Требует внимания" на Обзоре (диалог 2026-09-01) — живой снимок из уже
 * имеющихся данных (истекающие подписки, недоступные/отключённые ноды,
 * непрочитанные обращения), без Prometheus и без истории событий (нет
 * alert-таблицы — "recovered" показать нечем, только текущее состояние). */
export default function AlertsPanel() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'alerts'], queryFn: getAlerts });

  if (isLoading || !data) {
    return null;
  }

  return (
    <Card view="outlined" className="flex flex-col">
      <Text variant="subheader-1" className="block p-4 pb-2">
        Требует внимания
      </Text>
      {data.length === 0 ? (
        <div className="flex items-center gap-2 px-4 pb-4">
          <Icon data={CircleCheckFill} size={16} className="shrink-0 text-[var(--g-color-text-positive)]" />
          <Text variant="body-1" color="secondary">
            Всё в порядке
          </Text>
        </div>
      ) : (
        data.map((alert) => <AlertRow key={alert.id} alert={alert} />)
      )}
    </Card>
  );
}

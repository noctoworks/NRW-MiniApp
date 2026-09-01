import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getSubscriptionPulse } from '../../api/admin';

const ROWS: { key: 'new_today' | 'renewals_today' | 'expiring_24h' | 'expiring_3d'; label: string; dotColor: string }[] = [
  { key: 'new_today', label: 'Новых сегодня', dotColor: 'var(--g-color-base-info-heavy)' },
  { key: 'renewals_today', label: 'Продлений сегодня', dotColor: 'var(--g-color-base-positive-heavy)' },
  { key: 'expiring_24h', label: 'Истекает за 24ч', dotColor: 'var(--g-color-base-danger-heavy)' },
  { key: 'expiring_3d', label: 'Истекает за 3 дня', dotColor: 'var(--g-color-base-warning-heavy)' },
];

export default function SubscriptionsPulseCard() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['admin', 'subscription-pulse'], queryFn: getSubscriptionPulse });

  return (
    <Card view="outlined" className="flex flex-col">
      <Text variant="subheader-1" className="block p-4 pb-2">
        Подписки
      </Text>
      {ROWS.map((row) => (
        <div
          key={row.key}
          onClick={() => navigate('/admin/subscriptions')}
          className="flex cursor-pointer items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-2.5 hover:bg-[var(--g-color-base-simple-hover)]"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: row.dotColor }} />
            <Text variant="body-1">{row.label}</Text>
          </div>
          <Text variant="body-1" className="font-semibold">
            {data ? data[row.key] : '—'}
          </Text>
        </div>
      ))}
    </Card>
  );
}

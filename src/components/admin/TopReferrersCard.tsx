import { useQuery } from '@tanstack/react-query';
import { Button, Card, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getReferralFunnel } from '../../api/admin';
import { formatRub } from '../../lib/format';
import AdminEmptyState from './AdminEmptyState';

export default function TopReferrersCard() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['admin', 'referrals'], queryFn: getReferralFunnel });
  const topFive = data?.top_referrers.slice(0, 5) ?? [];

  return (
    <Card view="outlined" className="flex flex-col">
      <div className="flex items-center justify-between p-4 pb-2">
        <Text variant="subheader-1">Топ рефереров</Text>
        <Button view="flat" size="s" onClick={() => navigate('/admin/analytics/referrals')}>
          Все
        </Button>
      </div>
      {data && topFive.length === 0 ? (
        <AdminEmptyState text="Пока никто не заработал на рефералах" />
      ) : (
        topFive.map((referrer, i) => (
          <div
            key={referrer.user_id}
            className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-2.5 first:border-t-0"
          >
            <Text variant="body-2" ellipsis>
              {i + 1}. {referrer.full_name || (referrer.username ? `@${referrer.username}` : `id${referrer.telegram_id}`)}
            </Text>
            <Text variant="body-2" className="shrink-0 font-semibold">
              {formatRub(referrer.earnings_kopeks)}
            </Text>
          </div>
        ))
      )}
    </Card>
  );
}

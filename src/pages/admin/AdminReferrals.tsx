import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { getReferralFunnel } from '../../api/admin';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';

export default function AdminReferrals() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'referrals'],
    queryFn: getReferralFunnel,
  });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Text variant="header-1">Реферальная воронка</Text>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Приглашено" value={String(data.referred_users_count)} accent />
        <KpiTile label="Из них платят" value={String(data.referred_paying_count)} />
        <KpiTile label="Конверсия рефералов" value={`${data.conversion_percent}%`} />
        <KpiTile label="Выплачено рефереров" value={formatRub(data.total_earnings_kopeks)} />
      </div>

      <div className="flex flex-col gap-2">
        <Text variant="subheader-1">Топ рефереров</Text>
        <Card view="outlined" className="p-0">
          {data.top_referrers.length === 0 ? (
            <AdminEmptyState text="Пока никто не заработал на рефералах" />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {data.top_referrers.map((referrer, i) => (
                <div key={referrer.user_id} className="flex items-center justify-between">
                  <Text variant="body-1">
                    {i + 1}. {referrer.full_name || (referrer.username ? `@${referrer.username}` : `id${referrer.telegram_id}`)}
                    <Text as="span" color="secondary">
                      {' '}
                      · привёл {referrer.referred_count}
                    </Text>
                  </Text>
                  <Text variant="body-1" className="font-semibold">
                    {formatRub(referrer.earnings_kopeks)}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

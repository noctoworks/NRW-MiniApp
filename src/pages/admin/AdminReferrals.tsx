import { useQuery } from '@tanstack/react-query';
import { Cell, Section, Title } from '@telegram-apps/telegram-ui';
import { getReferralFunnel } from '../../api/admin';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';

export default function AdminReferrals() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'referrals'], queryFn: getReferralFunnel });

  if (isLoading || !data) {
    return <Loader inline />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Title level="2" weight="2">Реферальная воронка</Title>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Приглашено" value={String(data.referred_users_count)} accent />
        <KpiTile label="Из них платят" value={String(data.referred_paying_count)} />
        <KpiTile label="Конверсия рефералов" value={`${data.conversion_percent}%`} />
        <KpiTile label="Выплачено рефереров" value={formatRub(data.total_earnings_kopeks)} />
      </div>

      <Section header="Топ рефереров">
        {data.top_referrers.length === 0 ? (
          <Cell className="text-muted">Пока никто не заработал на рефералах</Cell>
        ) : (
          data.top_referrers.map((referrer, i) => (
            <Cell
              key={referrer.user_id}
              subtitle={`привёл ${referrer.referred_count}`}
              after={<span className="font-semibold">{formatRub(referrer.earnings_kopeks)}</span>}
            >
              {i + 1}. {referrer.username ? `@${referrer.username}` : `id${referrer.telegram_id}`}
            </Cell>
          ))
        )}
      </Section>
    </div>
  );
}

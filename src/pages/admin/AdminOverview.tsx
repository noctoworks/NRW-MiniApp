import { useQuery } from '@tanstack/react-query';
import { Title } from '@telegram-apps/telegram-ui';
import { getOverview, getRevenueTimeseries } from '../../api/admin';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import RevenueChart from '../../components/admin/RevenueChart';
import { formatRub } from '../../lib/format';

export default function AdminOverview() {
  const { data: overview, isLoading } = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview });
  const { data: timeseries } = useQuery({ queryKey: ['admin', 'revenue-timeseries'], queryFn: () => getRevenueTimeseries(30) });

  if (isLoading || !overview) {
    return <Loader inline />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Title level="2" weight="2">Дашборд</Title>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Доход сегодня" value={formatRub(overview.revenue_today_kopeks)} accent />
        <KpiTile label="Доход за 7 дн" value={formatRub(overview.revenue_7d_kopeks)} />
        <KpiTile label="Доход за 30 дн" value={formatRub(overview.revenue_30d_kopeks)} />
        <KpiTile label="Средний чек" value={formatRub(overview.avg_check_kopeks)} />
        <KpiTile label="Активные подписки" value={String(overview.active_subscriptions)} />
        <KpiTile label="Всего пользователей" value={String(overview.total_users)} />
        <KpiTile label="Новые за 7 дн" value={String(overview.new_users_7d)} />
        <KpiTile label="Конверсия в оплату" value={`${overview.conversion_percent}%`} />
      </div>

      {timeseries && <RevenueChart data={timeseries} />}
    </div>
  );
}

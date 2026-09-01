import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getOverview, getRevenueTimeseries } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import RevenueChart from '../../components/admin/RevenueChart';
import { formatRub } from '../../lib/format';

export default function AdminOverview() {
  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getOverview,
  });
  const { data: timeseries } = useQuery({ queryKey: ['admin', 'revenue-timeseries'], queryFn: () => getRevenueTimeseries(30) });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !overview) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Text variant="header-1">Дашборд</Text>

      {/* Доход — самое важное на экране, поэтому крупная плашка сверху, а не
          одна из восьми одинаковых плиток в общей сетке (см. диалог: "давай
          поправим админку"). Крупным — "за сегодня" (то, что реально нужно
          проверять каждый день), "за всё время" ушёл в мелкую строку ниже —
          раньше было наоборот, но именно "сегодня" должно бросаться в глаза
          первым, особенно с телефона. */}
      <Card view="filled" className="p-4">
        <Text variant="caption-2" color="secondary" className="block">
          Доход за сегодня
        </Text>
        <Text variant="display-1">{formatRub(overview.revenue_today_kopeks)}</Text>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--g-color-line-generic)] pt-3">
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              За 7 дн
            </Text>
            <Text variant="body-2" className="font-semibold">
              {formatRub(overview.revenue_7d_kopeks)}
            </Text>
          </div>
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              За 30 дн
            </Text>
            <Text variant="body-2" className="font-semibold">
              {formatRub(overview.revenue_30d_kopeks)}
            </Text>
          </div>
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              Всего
            </Text>
            <Text variant="body-2" color="brand" className="font-semibold">
              {formatRub(overview.revenue_all_time_kopeks)}
            </Text>
          </div>
        </div>
      </Card>

      {timeseries && <RevenueChart data={timeseries} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Активные подписки" value={String(overview.active_subscriptions)} />
        <KpiTile
          label="Платящих подписок"
          value={String(overview.paying_subscriptions)}
          hint={overview.new_paying_subscriptions_today > 0 ? `+${overview.new_paying_subscriptions_today} сегодня` : undefined}
        />
        <KpiTile label="Всего пользователей" value={String(overview.total_users)} />
        <KpiTile label="Новые за 7 дн" value={String(overview.new_users_7d)} />
        <KpiTile label="Конверсия в оплату" value={`${overview.conversion_percent}%`} />
        <KpiTile label="Средний чек" value={formatRub(overview.avg_check_kopeks)} />
        <KpiTile label="Churn за 30 дн" value={`${overview.churn_percent_30d}%`} />
      </div>
    </div>
  );
}

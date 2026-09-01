import { useQuery } from '@tanstack/react-query';
import { Text } from '@gravity-ui/uikit';
import { getOverview, getRevenueTimeseries } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import RevenueChart from '../../components/admin/RevenueChart';
import { formatRub } from '../../lib/format';

export default function AdminGrowth() {
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
    <div className="flex flex-col gap-6">
      <Text variant="header-1">MRR / ARR / Churn</Text>

      <Text variant="body-2" color="secondary" className="block max-w-xl">
        У сервиса нет recurring billing (автопродлений через провайдера) — MRR/ARR ниже это не
        подписочная метрика в классическом смысле, а прокси: выручка за последние 30 дней (и её
        ×12 для ARR). Ориентируйтесь на них как на тренд, не как на точный прогноз.
      </Text>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile label="MRR" value={formatRub(overview.mrr_kopeks)} hint="скользящее, доход за 30 дней" accent />
        <KpiTile label="ARR" value={formatRub(overview.arr_kopeks)} hint="MRR × 12" />
        <KpiTile
          label="Churn за 30 дней"
          value={`${overview.churn_percent_30d}%`}
          hint="доля истёкших подписок среди тех, у кого end_date попал в период"
        />
      </div>

      {timeseries && <RevenueChart data={timeseries} />}
    </div>
  );
}

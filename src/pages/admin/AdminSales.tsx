import { useQuery } from '@tanstack/react-query';
import { Text } from '@gravity-ui/uikit';
import { getSalesBreakdown } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import CategoryBarChart from '../../components/admin/CategoryBarChart';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';
import { transactionLabel } from '../../lib/transactions';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const PROVIDER_LABELS: Record<string, string> = {
  platega: 'Platega (СБП/карты)',
  stars: 'Telegram Stars',
  ton: 'TON',
  stub: 'Тест (stub)',
};

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

export default function AdminSales() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'sales-breakdown'],
    queryFn: getSalesBreakdown,
  });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="header-1">Продажи</Text>
        <Text variant="body-2" color="secondary" className="mt-1 block max-w-2xl">
          Разрезы по фактической выручке (оплата подписки + подарки, без оплат бонусным балансом —
          та же методология, что и везде в этой админке).
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryBarChart
          title="Доход по типу транзакции (30 дней)"
          categories={data.by_type.map((item) => transactionLabel(item.type))}
          values={data.by_type.map((item) => item.revenue_kopeks)}
          formatValue={formatRub}
        />

        <CategoryBarChart
          title="Доход по способу оплаты (30 дней)"
          categories={data.by_provider.map((item) => providerLabel(item.provider))}
          values={data.by_provider.map((item) => item.revenue_kopeks)}
          formatValue={formatRub}
        />

        <CategoryBarChart
          title="Доход по дням недели (90 дней)"
          categories={WEEKDAY_LABELS}
          values={data.by_weekday.map((item) => item.revenue_kopeks)}
          formatValue={formatRub}
        />

        <div className="flex flex-col gap-2">
          <CategoryBarChart
            title="Активные подписки по тарифам"
            categories={data.active_subs_by_tariff.map((item) => item.tariff_name)}
            values={data.active_subs_by_tariff.map((item) => item.active_count)}
            formatValue={(v) => `${v} подписок`}
          />
          <Text variant="caption-2" color="secondary">
            Снимок сейчас, не историческая выручка — Transaction не хранит тариф на момент покупки
            (только текущий тариф подписки), поэтому это «сколько активных подписок на тарифе»,
            а не «сколько денег он принёс».
          </Text>
        </div>
      </div>
    </div>
  );
}

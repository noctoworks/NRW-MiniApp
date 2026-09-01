import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getSalesBreakdown } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import CategoryBarChart from '../../components/admin/CategoryBarChart';
import Loader from '../../components/Loader';
import { formatRub } from '../../lib/format';
import { transactionLabel } from '../../lib/transactions';
import type { RevenueByProvider, RevenueByWeekday } from '../../types';

const WEEKDAY_LABELS = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям'];

const PROVIDER_LABELS: Record<string, string> = {
  platega: 'Platega (СБП/карты)',
  stars: 'Telegram Stars',
  ton: 'TON',
  stub: 'Тест (stub)',
};

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

function topByRevenue<T extends { revenue_kopeks: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((max, item) => (item.revenue_kopeks > max.revenue_kopeks ? item : max), items[0]);
}

function buildSummary(byType: { revenue_kopeks: number }[], byProvider: RevenueByProvider[], byWeekday: RevenueByWeekday[], topTariffName: string | null): string {
  const totalRevenue = byType.reduce((sum, item) => sum + item.revenue_kopeks, 0);
  const topProvider = topByRevenue(byProvider);
  const topWeekday = topByRevenue(byWeekday);

  let text = `За 30 дней — ${formatRub(totalRevenue)} дохода`;
  if (topProvider && topProvider.revenue_kopeks > 0) {
    text += `, больше всего через ${providerLabel(topProvider.provider)}`;
  }
  text += '.';
  if (topWeekday && topWeekday.revenue_kopeks > 0) {
    text += ` Активнее всего покупают по ${WEEKDAY_LABELS[topWeekday.weekday]}.`;
  }
  if (topTariffName) {
    text += ` Больше всего активных подписок — на тарифе «${topTariffName}».`;
  }
  return text;
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

  const topTariff = data.active_subs_by_tariff[0] ?? null;
  const summary = buildSummary(data.by_type, data.by_provider, data.by_weekday, topTariff?.tariff_name ?? null);

  return (
    <div className="flex flex-col gap-6">
      <Card view="filled" className="p-4">
        <Text variant="body-1">{summary}</Text>
      </Card>

      <div className="flex flex-col gap-3">
        <div>
          <Text variant="subheader-1">Откуда деньги</Text>
          <Text variant="caption-2" color="secondary" className="block">
            Оплата подписки + подарки за 30 дней, без оплат бонусным балансом
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CategoryBarChart
            title="По типу транзакции"
            categories={data.by_type.map((item) => transactionLabel(item.type))}
            values={data.by_type.map((item) => item.revenue_kopeks)}
            formatValue={formatRub}
          />
          <CategoryBarChart
            title="По способу оплаты"
            categories={data.by_provider.map((item) => providerLabel(item.provider))}
            values={data.by_provider.map((item) => item.revenue_kopeks)}
            formatValue={formatRub}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Text variant="subheader-1">Когда покупают</Text>
          <Text variant="caption-2" color="secondary" className="block">
            Доход по дням недели, 90 дней — для сглаживания случайных всплесков
          </Text>
        </div>
        <CategoryBarChart
          title="По дням недели"
          categories={['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']}
          values={data.by_weekday.map((item) => item.revenue_kopeks)}
          formatValue={formatRub}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Text variant="subheader-1">Что покупают сейчас</Text>
          <Text variant="caption-2" color="secondary" className="block">
            Снимок активных подписок по тарифам — не историческая выручка (Transaction не хранит
            тариф на момент покупки, только текущий тариф подписки)
          </Text>
        </div>
        <CategoryBarChart
          title="Активные подписки по тарифам"
          categories={data.active_subs_by_tariff.map((item) => item.tariff_name)}
          values={data.active_subs_by_tariff.map((item) => item.active_count)}
          formatValue={(v) => `${v} подписок`}
        />
      </div>
    </div>
  );
}

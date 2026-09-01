import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getNetProfit } from '../../api/admin';

function formatWholeRub(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function ProfitColumn({ title, revenue, cost, netProfit }: { title: string; revenue: number; cost: number; netProfit: number }) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="caption-2" color="secondary">
        {title}
      </Text>
      <Text variant="display-2" color={netProfit >= 0 ? 'positive' : 'danger'}>
        {formatWholeRub(netProfit)}
      </Text>
      <Text variant="caption-2" color="secondary">
        {formatWholeRub(revenue)} доход − {formatWholeRub(cost)} расходы на инфру
      </Text>
    </div>
  );
}

/** Чистая прибыль = выручка − расходы на инфру (диалог 2026-09-01) — оба в
 * рублях (пользователь подтвердил, что расходы в Remnawave вводятся в ₽).
 * Пока расходы нигде не настроены (Providers/Billing Nodes в самом
 * Remnawave), cost = 0 и чистая прибыль честно равна выручке — не ошибка,
 * а отражение реального состояния данных. */
export default function NetProfitCard() {
  const { data } = useQuery({ queryKey: ['admin', 'net-profit'], queryFn: getNetProfit });

  if (!data) return null;

  return (
    <Card view="filled" className="p-4">
      <Text variant="subheader-1" className="mb-3 block">
        Чистая прибыль
      </Text>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProfitColumn
          title="За этот месяц"
          revenue={data.revenue_this_month}
          cost={data.cost_this_month}
          netProfit={data.net_profit_this_month}
        />
        <ProfitColumn
          title="За всё время"
          revenue={data.revenue_all_time}
          cost={data.cost_all_time}
          netProfit={data.net_profit_all_time}
        />
      </div>
    </Card>
  );
}

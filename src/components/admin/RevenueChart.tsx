import { Chart, type ChartData } from '@gravity-ui/charts';
import { Card, Text } from '@gravity-ui/uikit';
import { formatRub } from '../../lib/format';
import type { RevenuePoint } from '../../types';

interface RevenueChartProps {
  data: RevenuePoint[];
}

// Раньше показывали только выручку (одна линия recharts) — count (число
// платежей за день) в RevenuePoint уже был, но нигде не отображался (см.
// диалог 2026-09-01, "максимальная аналитика"). Теперь вторая серия на своей
// оси — то же самое API, без новых полей с бэкенда.
export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData: ChartData = {
    series: {
      data: [
        {
          type: 'area',
          name: 'Выручка',
          data: data.map((point) => ({ x: new Date(point.date).getTime(), y: point.revenue_kopeks })),
          yAxis: 0,
          tooltip: {
            valueFormat: { type: 'custom', formatter: ({ value }) => formatRub(Number(value)) },
          },
        },
        {
          type: 'line',
          name: 'Платежей',
          data: data.map((point) => ({ x: new Date(point.date).getTime(), y: point.count })),
          yAxis: 1,
          tooltip: {
            valueFormat: { type: 'number', precision: 0 },
          },
        },
      ],
    },
    xAxis: { type: 'datetime' },
    yAxis: [{ title: { text: 'Выручка' } }, { title: { text: 'Платежей' } }],
    legend: { enabled: true },
    tooltip: { headerFormat: { type: 'date', format: 'D MMM' } },
  };

  return (
    <Card view="filled" className="p-4">
      <Text variant="body-2" color="secondary" className="mb-2 block">
        Выручка и платежи по дням
      </Text>
      <div style={{ height: 240 }}>
        <Chart data={chartData} />
      </div>
    </Card>
  );
}

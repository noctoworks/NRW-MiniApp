import { Chart, type ChartData } from '@gravity-ui/charts';
import { Card, Text } from '@gravity-ui/uikit';

interface CategoryBarChartProps {
  title: string;
  categories: string[];
  values: number[];
  formatValue: (value: number) => string;
}

/** Общий столбчатый график для разрезов продаж (Продажи, диалог
 * 2026-09-01) — одна серия, категориальная ось X. Переиспользуется вместо
 * четырёх копий одного и того же Chart-конфига. */
export default function CategoryBarChart({ title, categories, values, formatValue }: CategoryBarChartProps) {
  const chartData: ChartData = {
    series: {
      data: [
        {
          type: 'bar-x',
          name: title,
          data: values.map((y, i) => ({ x: i, y })),
          tooltip: {
            valueFormat: { type: 'custom', formatter: ({ value }) => formatValue(Number(value)) },
          },
        },
      ],
    },
    xAxis: { type: 'category', categories },
    legend: { enabled: false },
  };

  return (
    <Card view="outlined" className="flex flex-col gap-2 p-4">
      <Text variant="subheader-1">{title}</Text>
      <div style={{ height: 220 }}>
        <Chart data={chartData} />
      </div>
    </Card>
  );
}

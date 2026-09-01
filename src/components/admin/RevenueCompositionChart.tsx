import { Chart, type ChartData } from '@gravity-ui/charts';
import { Card, Text } from '@gravity-ui/uikit';
import AdminEmptyState from './AdminEmptyState';
import { formatRub } from '../../lib/format';
import type { RevenueComposition } from '../../types';

const PROVIDER_LABELS: Record<string, string> = {
  platega: 'Platega (СБП/карты)',
  stars: 'Telegram Stars',
  ton: 'TON',
  stub: 'Тест (stub)',
};

// Категориальная палитра из скилла dataviz (references/palette.md, слоты
// 1/2/3/4 — blue/orange/aqua/yellow, dark-режим), провалидирована
// scripts/validate_palette.js --mode dark: все проверки прошли (худшая
// смежная пара CVD ΔE 8.4). Админка всегда в тёмной теме (AdminGravityTheme,
// theme="dark" без переключателя) — светлый вариант не нужен. Цвет
// закреплён ЗА ПРОВАЙДЕРОМ (не за рангом по выручке) — стабильно от запуска
// к запуску, как и требует правило "color follows the entity, never its rank".
const PROVIDER_COLORS: Record<string, string> = {
  platega: '#3987e5',
  stars: '#d95926',
  ton: '#199e70',
  stub: '#c98500',
};
const FALLBACK_COLOR = '#9085e9'; // слот 7 (violet) — на случай нового провайдера, которого ещё нет в списке выше

function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}

interface RevenueCompositionChartProps {
  data: RevenueComposition;
}

/** Состав выручки по способам оплаты, по дням (диалог 2026-09-01,
 * "разнообразим графики") — stacked bar вместо плоского снэпшот-бара
 * (см. CategoryBarChart "По способу оплаты"), чтобы было видно, как
 * меняется микс провайдеров во времени, а не только итог за период. */
export default function RevenueCompositionChart({ data }: RevenueCompositionChartProps) {
  const hasData = data.series.some((s) => s.values.some((v) => v > 0));

  if (!hasData) {
    return (
      <Card view="outlined" className="flex flex-col gap-2 p-4">
        <Text variant="subheader-1">Состав выручки по дням</Text>
        <AdminEmptyState text="Данных за период нет" />
      </Card>
    );
  }

  const chartData: ChartData = {
    series: {
      data: data.series.map((s) => ({
        type: 'bar-x',
        name: providerLabel(s.provider),
        color: PROVIDER_COLORS[s.provider] ?? FALLBACK_COLOR,
        stacking: 'normal',
        stackId: 'revenue',
        data: data.days.map((day, i) => ({ x: new Date(day).getTime(), y: s.values[i] })),
        tooltip: {
          valueFormat: { type: 'custom', formatter: ({ value }) => formatRub(Number(value)) },
        },
      })),
    },
    xAxis: { type: 'datetime' },
    legend: { enabled: true },
    tooltip: { headerFormat: { type: 'date', format: 'D MMM' } },
  };

  return (
    <Card view="outlined" className="flex flex-col gap-2 p-4">
      <Text variant="subheader-1">Состав выручки по дням</Text>
      <div style={{ height: 260 }}>
        <Chart data={chartData} />
      </div>
    </Card>
  );
}

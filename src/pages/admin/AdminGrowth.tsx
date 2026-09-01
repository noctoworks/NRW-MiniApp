import { useQuery } from '@tanstack/react-query';
import { Card, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { useState } from 'react';
import { getOverview, getRevenueTimeseries } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import RevenueChart from '../../components/admin/RevenueChart';
import { formatRub } from '../../lib/format';
import type { RevenuePoint } from '../../types';

const PERIODS = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
  { days: 365, label: '1 год' },
];

function sumRevenue(points: RevenuePoint[]): number {
  return points.reduce((sum, p) => sum + p.revenue_kopeks, 0);
}

function sumCount(points: RevenuePoint[]): number {
  return points.reduce((sum, p) => sum + p.count, 0);
}

/** Строим саммари простыми словами за выбранный период (диалог 2026-09-01,
 * "динамика продаж... чтобы были отчёты") — из тех же данных, что и график,
 * без отдельного запроса. Сравнение с предыдущим периодом той же длины —
 * честно посчитано (не выдуманный % роста), но приблизительно: границы двух
 * периодов сдвинуты на день из-за включительного диапазона timeseries. */
function buildDynamicsSummary(current: RevenuePoint[], previous: RevenuePoint[], periodLabel: string): string {
  const currentRevenue = sumRevenue(current);
  const currentCount = sumCount(current);
  const previousRevenue = sumRevenue(previous);

  let text = `За ${periodLabel} — ${formatRub(currentRevenue)} дохода, ${currentCount} оплат.`;
  if (previousRevenue > 0) {
    const changePercent = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 1000) / 10;
    const direction = changePercent >= 0 ? 'больше' : 'меньше';
    text += ` Это на ${Math.abs(changePercent)}% ${direction}, чем за предыдущий такой же период.`;
  }
  return text;
}

export default function AdminGrowth() {
  const [periodDays, setPeriodDays] = useState(30);

  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getOverview,
  });
  const { data: doubleTimeseries } = useQuery({
    queryKey: ['admin', 'revenue-timeseries', periodDays * 2],
    queryFn: () => getRevenueTimeseries(periodDays * 2),
  });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !overview) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const currentPeriod = doubleTimeseries?.slice(periodDays) ?? [];
  const previousPeriod = doubleTimeseries?.slice(0, periodDays) ?? [];
  const periodLabel = PERIODS.find((p) => p.days === periodDays)?.label ?? `${periodDays} дней`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="subheader-1" className="mb-2 block">
          MRR / ARR / Churn
        </Text>
        <Text variant="body-2" color="secondary" className="block max-w-xl">
          У сервиса нет recurring billing (автопродлений через провайдера) — MRR/ARR ниже это не
          подписочная метрика в классическом смысле, а прокси: выручка за последние 30 дней (и её
          ×12 для ARR). Ориентируйтесь на них как на тренд, не как на точный прогноз.
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile label="MRR" value={formatRub(overview.mrr_kopeks)} hint="скользящее, доход за 30 дней" accent />
        <KpiTile label="ARR" value={formatRub(overview.arr_kopeks)} hint="MRR × 12" />
        <KpiTile
          label="Churn за 30 дней"
          value={`${overview.churn_percent_30d}%`}
          hint="доля истёкших подписок среди тех, у кого end_date попал в период"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="subheader-1">Динамика продаж</Text>
          <SegmentedRadioGroup value={String(periodDays)} onUpdate={(value) => setPeriodDays(Number(value))}>
            {PERIODS.map((p) => (
              <SegmentedRadioGroup.Option key={p.days} value={String(p.days)}>
                {p.label}
              </SegmentedRadioGroup.Option>
            ))}
          </SegmentedRadioGroup>
        </div>

        {doubleTimeseries && (
          <>
            <Card view="filled" className="p-4">
              <Text variant="body-1">{buildDynamicsSummary(currentPeriod, previousPeriod, periodLabel)}</Text>
            </Card>
            <RevenueChart data={currentPeriod} />
          </>
        )}
      </div>
    </div>
  );
}

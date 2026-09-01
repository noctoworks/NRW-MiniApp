import { useQuery } from '@tanstack/react-query';
import { Button, Card, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getOverview, getRevenueTimeseries } from '../../api/admin';
import { formatRub } from '../../lib/format';
import type { RevenuePoint } from '../../types';
import Sparkline from './Sparkline';

function Stat({
  label,
  value,
  tone,
  sparkline,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'danger';
  sparkline?: number[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <div className="flex items-center gap-2">
        <Text variant="subheader-1" color={tone}>
          {value}
        </Text>
        {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} width={40} height={18} />}
      </div>
    </div>
  );
}

/** Скользящая MRR за каждый из последних 30 дней (не сам overview.mrr_kopeks
 * — тот один текущий снэпшот) — на реальных дневных данных, окном 30 дней
 * каждая точка, честно посчитано на фронте (см. диалог 2026-09-01,
 * "разнообразим графики"). Нужно 60 дней сырых точек, чтобы у самой первой
 * из 30 точек тоже было полное 30-дневное окно позади. */
function rollingMrrSeries(points: RevenuePoint[]): number[] {
  const series: number[] = [];
  for (let i = 29; i < points.length; i++) {
    const windowSum = points.slice(i - 29, i + 1).reduce((sum, p) => sum + p.revenue_kopeks, 0);
    series.push(windowSum);
  }
  return series;
}

/** "Растёт ли проект" одним взглядом на Обзоре (диалог 2026-09-01: "хочу
 * видеть все данные для понимания, растёт проект или нет"). Поля уже
 * приходят в /admin/overview — раньше рендерились только на вкладке
 * Аналитика → Динамика (AdminGrowth), здесь тот же честный прокси: MRR/ARR
 * не про recurring billing (его нет), а скользящая выручка за 30 дней ×1/×12. */
export default function GrowthPulseCard() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview });
  const { data: timeseries60 } = useQuery({
    queryKey: ['admin', 'revenue-timeseries', 60],
    queryFn: () => getRevenueTimeseries(60),
  });

  if (!data) return null;

  const mrrTrend = timeseries60 ? rollingMrrSeries(timeseries60) : undefined;

  return (
    <Card view="outlined" className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <Text variant="subheader-1">Рост</Text>
        <Button view="flat" size="s" onClick={() => navigate('/admin/analytics')}>
          Динамика
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="MRR" value={formatRub(data.mrr_kopeks)} sparkline={mrrTrend} />
        <Stat label="ARR" value={formatRub(data.arr_kopeks)} />
        <Stat label="Конверсия" value={`${data.conversion_percent}%`} />
        <Stat
          label="Churn за 30 дней"
          value={`${data.churn_percent_30d}%`}
          tone={data.churn_percent_30d > 10 ? 'danger' : undefined}
        />
        <Stat label="Средний чек" value={formatRub(data.avg_check_kopeks)} />
        <Stat label="Выручка за всё время" value={formatRub(data.revenue_all_time_kopeks)} />
      </div>
    </Card>
  );
}

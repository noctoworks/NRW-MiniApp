import { useQuery } from '@tanstack/react-query';
import { Button, Card, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getOverview } from '../../api/admin';
import { formatRub } from '../../lib/format';

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'danger' }) {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="subheader-1" color={tone}>
        {value}
      </Text>
    </div>
  );
}

/** "Растёт ли проект" одним взглядом на Обзоре (диалог 2026-09-01: "хочу
 * видеть все данные для понимания, растёт проект или нет"). Поля уже
 * приходят в /admin/overview — раньше рендерились только на вкладке
 * Аналитика → Динамика (AdminGrowth), здесь тот же честный прокси: MRR/ARR
 * не про recurring billing (его нет), а скользящая выручка за 30 дней ×1/×12. */
export default function GrowthPulseCard() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['admin', 'overview'], queryFn: getOverview });

  if (!data) return null;

  return (
    <Card view="outlined" className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <Text variant="subheader-1">Рост</Text>
        <Button view="flat" size="s" onClick={() => navigate('/admin/analytics')}>
          Динамика
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="MRR" value={formatRub(data.mrr_kopeks)} />
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

import { Card, Text } from '@gravity-ui/uikit';
import Sparkline from './Sparkline';

interface KpiTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  /** Ряд значений для мини-графика тренда (реальная история, не выдумка —
   * см. диалог 2026-09-01). Передавать только там, где дневная история
   * реально есть (выручка) — не рисовать для метрик без истории снэпшотов. */
  sparkline?: number[];
}

export default function KpiTile({ label, value, hint, accent, sparkline }: KpiTileProps) {
  return (
    <Card view="filled" className="flex flex-col gap-1 p-3.5">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <div className="flex items-center justify-between gap-2">
        <Text variant="display-2" color={accent ? 'brand' : 'primary'} ellipsis>
          {value}
        </Text>
        {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} />}
      </div>
      {hint && (
        <Text variant="caption-2" color="secondary">
          {hint}
        </Text>
      )}
    </Card>
  );
}

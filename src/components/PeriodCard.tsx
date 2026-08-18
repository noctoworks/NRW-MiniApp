import { Badge, Caption, Cell, Selectable } from '@telegram-apps/telegram-ui';
import { formatRub } from '../lib/format';
import type { PeriodOut } from '../types';

interface PeriodCardProps {
  period: PeriodOut;
  savingsPercent: number;
  popular: boolean;
  selected: boolean;
  onSelect: () => void;
}

export default function PeriodCard({ period, savingsPercent, popular, selected, onSelect }: PeriodCardProps) {
  const perMonth = period.days >= 30 ? formatRub((period.price_kopeks / period.days) * 30) : formatRub(period.price_kopeks);

  return (
    <Cell
      className={`rounded-2xl bg-surface ${selected ? 'ring-2 ring-accent' : ''}`}
      onClick={onSelect}
      before={<Selectable name="period" checked={selected} onChange={onSelect} readOnly />}
      titleBadge={popular ? <Badge type="number">Популярный</Badge> : undefined}
      subtitle={savingsPercent > 0 ? <Caption className="text-success">выгода {savingsPercent}%</Caption> : undefined}
      after={
        <div className="text-right">
          <span className="block text-sm font-bold">{formatRub(period.price_kopeks)}</span>
          <Caption className="block text-muted">{perMonth} / мес</Caption>
        </div>
      }
    >
      {period.label}
    </Cell>
  );
}

import { formatRub } from '../lib/format';
import type { PeriodOut } from '../types';

interface PeriodCardProps {
  period: PeriodOut;
  savingsPercent: number;
  popular: boolean;
  selected: boolean;
  onSelect: () => void;
}

const MONTH_WORDS = new Map<number, string>([
  [1, 'месяц'],
  [3, 'месяца'],
  [6, 'месяцев'],
  [12, 'месяцев'],
  [24, 'месяца'],
]);

export default function PeriodCard({ period, savingsPercent, popular, selected, onSelect }: PeriodCardProps) {
  const months = Math.round(period.days / 30);
  const perMonth = period.days >= 30 ? formatRub((period.price_kopeks / period.days) * 30) : formatRub(period.price_kopeks);

  return (
    <button type="button" onClick={onSelect} className={`plan-card w-full !items-center ${selected ? 'selected-primary' : ''}`}>
      {popular && (
        <div className="badge absolute -top-2 right-8 bg-[hsl(var(--primary))] px-2.5 py-0.5 text-white">Популярный</div>
      )}
      <div className="flex flex-col items-start">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white">{months}</span>
          <span className="text-body text-[hsl(var(--subtitle-foreground))]">{MONTH_WORDS.get(months) ?? 'мес.'}</span>
        </div>
        {savingsPercent > 0 && <span className="text-subtitle2 font-medium text-[#21c45d]">выгода {savingsPercent}%</span>}
      </div>
      <div className="flex flex-col items-end">
        <div className="text-lg font-bold text-white">{formatRub(period.price_kopeks)}</div>
        <div className="text-subtitle2 text-[hsl(var(--subtitle-foreground))]">{perMonth} / мес</div>
      </div>
    </button>
  );
}

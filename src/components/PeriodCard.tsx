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
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3.5 text-left ${
        selected ? 'ring-2 ring-accent' : ''
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-text">
          Популярный
        </span>
      )}
      <div>
        <span className="block text-sm font-semibold">{period.label}</span>
        {savingsPercent > 0 && <span className="block text-xs font-medium text-success">выгода {savingsPercent}%</span>}
      </div>
      <div className="text-right">
        <span className="block text-sm font-bold">{formatRub(period.price_kopeks)}</span>
        <span className="block text-xs text-muted">{perMonth} / мес</span>
      </div>
    </button>
  );
}

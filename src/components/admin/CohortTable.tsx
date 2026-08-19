import { formatRub } from '../../lib/format';
import type { CohortsResponse } from '../../types';

interface CohortTableProps {
  data: CohortsResponse;
}

export default function CohortTable({ data }: CohortTableProps) {
  const maxValue = Math.max(1, ...data.cohorts.flatMap((c) => c.revenue_per_user_by_month_offset));

  return (
    <div className="card overflow-x-auto">
      <span className="mb-3 block text-sm font-medium text-muted">
        Когорты — выручка на пользователя по месяцам с регистрации
      </span>
      <table className="w-full min-w-[560px] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-muted">Когорта</th>
            <th className="px-2 py-1 text-left text-muted">Юзеров</th>
            {Array.from({ length: data.max_months + 1 }, (_, i) => (
              <th key={i} className="px-2 py-1 text-muted">
                М{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.cohorts.map((cohort) => (
            <tr key={cohort.cohort_month}>
              <td className="whitespace-nowrap px-2 py-1.5 font-medium">{cohort.cohort_month}</td>
              <td className="px-2 py-1.5 text-muted">{cohort.users_count}</td>
              {cohort.revenue_per_user_by_month_offset.map((value, offset) => (
                <td
                  key={offset}
                  className="rounded-lg px-2 py-1.5 text-center"
                  style={{ background: `color-mix(in srgb, var(--tg-accent) ${Math.round((value / maxValue) * 60)}%, transparent)` }}
                >
                  {value > 0 ? formatRub(value) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

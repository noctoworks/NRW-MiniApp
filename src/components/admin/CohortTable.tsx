import { Card, Text } from '@gravity-ui/uikit';
import { formatRub } from '../../lib/format';
import type { CohortsResponse } from '../../types';

interface CohortTableProps {
  data: CohortsResponse;
}

export default function CohortTable({ data }: CohortTableProps) {
  const maxValue = Math.max(1, ...data.cohorts.flatMap((c) => c.revenue_per_user_by_month_offset));

  return (
    <Card view="filled" className="overflow-x-auto p-4">
      <Text variant="body-2" color="secondary" className="mb-3 block">
        Когорты — выручка на пользователя по месяцам с регистрации
      </Text>
      <table className="w-full min-w-[560px] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-[var(--g-color-text-secondary)]">Когорта</th>
            <th className="px-2 py-1 text-left text-[var(--g-color-text-secondary)]">Юзеров</th>
            {Array.from({ length: data.max_months + 1 }, (_, i) => (
              <th key={i} className="px-2 py-1 text-[var(--g-color-text-secondary)]">
                М{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.cohorts.map((cohort) => (
            <tr key={cohort.cohort_month}>
              <td className="whitespace-nowrap px-2 py-1.5 font-medium text-[var(--g-color-text-primary)]">
                {cohort.cohort_month}
              </td>
              <td className="px-2 py-1.5 text-[var(--g-color-text-secondary)]">{cohort.users_count}</td>
              {cohort.revenue_per_user_by_month_offset.map((value, offset) => (
                <td
                  key={offset}
                  className="px-2 py-1.5 text-center text-[var(--g-color-text-primary)]"
                  style={{
                    borderRadius: 'var(--g-border-radius-l)',
                    background: `color-mix(in srgb, var(--g-color-base-brand) ${Math.round((value / maxValue) * 60)}%, transparent)`,
                  }}
                >
                  {value > 0 ? formatRub(value) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

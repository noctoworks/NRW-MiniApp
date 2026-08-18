import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatRub } from '../../lib/format';
import type { RevenuePoint } from '../../types';

interface RevenueChartProps {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((point) => ({ ...point, label: point.date.slice(5) }));

  return (
    <div className="rounded-2xl bg-surface p-4">
      <span className="mb-2 block text-sm font-medium text-muted">Выручка по дням</span>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--tg-hint)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--tg-hint)' }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => formatRub(v)}
          />
          <Tooltip
            formatter={(value: number) => formatRub(value)}
            labelFormatter={(label: string) => label}
            contentStyle={{ background: 'var(--tg-surface-2)', border: 'none', borderRadius: 12, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="revenue_kopeks" stroke="var(--tg-accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

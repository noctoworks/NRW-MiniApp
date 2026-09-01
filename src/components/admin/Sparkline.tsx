interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

/** Мини-график тренда внутри KPI-плитки (диалог 2026-09-01, "разнообразим
 * графики") — сырой SVG, не Chart из @gravity-ui/charts: одна серия без
 * осей/легенды/тултипа не тянет за собой инфраструктуру полноценного
 * графика (см. скилл dataviz, components.md — Sparkline: Tier 2, "plain
 * HTML/SVG"). Линия 2px, скруглённые концы — как и любая линия по mark specs. */
export default function Sparkline({ values, width = 56, height = 24 }: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 2;

  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--g-color-line-brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

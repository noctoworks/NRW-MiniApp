interface KpiTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

// Раньше плитка собиралась из TelegramUI (Caption/Title) и жила на своём фоне,
// из-за чего админка визуально отличалась от главного экрана. Теперь это
// обычная .card с той же типографикой, что в блоке «Трафик» на главной.
export default function KpiTile({ label, value, hint, accent }: KpiTileProps) {
  return (
    <div className="card flex flex-col gap-1 !p-3.5">
      <span className="text-xs text-[hsl(var(--subtitle-foreground))]">{label}</span>
      <span className={`text-xl font-bold ${accent ? 'text-[hsl(var(--primary))]' : ''}`}>{value}</span>
      {hint && <span className="text-xs leading-tight text-[hsl(var(--subtitle-foreground))]">{hint}</span>}
    </div>
  );
}

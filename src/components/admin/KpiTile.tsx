import { Caption, Title } from '@telegram-apps/telegram-ui';

interface KpiTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export default function KpiTile({ label, value, hint, accent }: KpiTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface px-4 py-3.5">
      <Caption className="text-muted">{label}</Caption>
      <Title level="3" weight="2" className={accent ? 'text-accent' : ''}>
        {value}
      </Title>
      {hint && (
        <Caption level="2" className="leading-tight text-muted">
          {hint}
        </Caption>
      )}
    </div>
  );
}

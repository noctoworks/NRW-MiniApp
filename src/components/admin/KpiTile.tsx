import { Card, Text } from '@gravity-ui/uikit';

interface KpiTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export default function KpiTile({ label, value, hint, accent }: KpiTileProps) {
  return (
    <Card view="filled" className="flex flex-col gap-1 p-3.5">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="display-2" color={accent ? 'brand' : 'primary'} ellipsis>
        {value}
      </Text>
      {hint && (
        <Text variant="caption-2" color="secondary">
          {hint}
        </Text>
      )}
    </Card>
  );
}

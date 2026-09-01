import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getUserTrafficByNode } from '../../api/admin';
import { countryFlag, formatTrafficGb } from '../../lib/format';
import AdminEmptyState, { AdminErrorState } from './AdminEmptyState';

interface NodeTrafficSectionProps {
  userId: number;
}

export default function NodeTrafficSection({ userId }: NodeTrafficSectionProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'user', userId, 'traffic-by-node'],
    queryFn: () => getUserTrafficByNode(userId, 30),
  });

  return (
    <Card view="outlined" className="flex flex-col">
      <Text variant="subheader-1" className="block p-4 pb-2">
        Трафик по нодам (30 дней)
      </Text>
      {isLoading ? (
        <Text variant="body-1" color="secondary" className="block px-4 pb-3">
          Загрузка…
        </Text>
      ) : isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <AdminEmptyState text="Трафика за период нет" />
      ) : (
        data.map((node) => (
          <div
            key={node.node_uuid}
            className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0"
          >
            <div className="flex items-center gap-2">
              {countryFlag(node.country_code) && <span className="text-base leading-none">{countryFlag(node.country_code)}</span>}
              <Text variant="body-1">{node.node_name}</Text>
            </div>
            <Text variant="body-1" color="secondary">
              {formatTrafficGb(node.total_bytes / 1024 ** 3)}
            </Text>
          </div>
        ))
      )}
    </Card>
  );
}

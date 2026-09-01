import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getNodes } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import Loader from '../../components/Loader';
import { countryFlag, formatTrafficGb } from '../../lib/format';

export default function AdminTraffic() {
  const { data: nodes, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'nodes'], queryFn: getNodes });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !nodes) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const sorted = [...nodes].sort((a, b) => b.traffic_used_gb - a.traffic_used_gb);
  const total = sorted.reduce((sum, n) => sum + n.traffic_used_gb, 0);
  const max = Math.max(1, ...sorted.map((n) => n.traffic_used_gb));

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Text variant="header-1">Трафик</Text>
      <Text variant="body-2" color="secondary">
        Разбивка по нодам на текущий момент. История/тренд во времени пока не считается — нет
        снэпшотов трафика по датам, только живое значение с панели.
      </Text>

      <Card view="filled" className="p-4">
        <Text variant="caption-2" color="secondary" className="block">
          Всего по нодам
        </Text>
        <Text variant="display-1">{formatTrafficGb(total)}</Text>
      </Card>

      <Card view="outlined" className="flex flex-col">
        {sorted.length === 0 ? (
          <Text variant="body-1" color="secondary" className="block p-4">
            Нод не найдено
          </Text>
        ) : (
          sorted.map((node) => (
            <div
              key={node.uuid}
              className="flex flex-col gap-1.5 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {countryFlag(node.country_code) && (
                    <span className="text-base leading-none">{countryFlag(node.country_code)}</span>
                  )}
                  <Text variant="body-1">{node.name}</Text>
                </div>
                <Text variant="body-1" className="font-semibold">
                  {formatTrafficGb(node.traffic_used_gb)}
                </Text>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--g-color-base-generic)]">
                <div
                  className="h-full rounded-full bg-[var(--g-color-base-brand)]"
                  style={{ width: `${Math.max(2, (node.traffic_used_gb / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Card, Label, Text } from '@gravity-ui/uikit';
import { getNodes } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import Loader from '../../components/Loader';
import { countryFlag, formatTrafficGb } from '../../lib/format';

export default function AdminNodes() {
  const { data: nodes, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'nodes'], queryFn: getNodes });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !nodes) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Text variant="header-1">Ноды</Text>
      <Text variant="body-2" color="secondary">
        Статус и трафик по нодам Remnawave. CPU/память/аптайм здесь пока нет — панель не отдаёт это тем же
        запросом, что и остальное (см. «Мониторинг»).
      </Text>

      <Card view="outlined" className="flex flex-col">
        {nodes.length === 0 ? (
          <Text variant="body-1" color="secondary" className="block p-4">
            Нод не найдено
          </Text>
        ) : (
          nodes.map((node) => (
            <div
              key={node.uuid}
              className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0"
            >
              <div className="flex items-center gap-2">
                {countryFlag(node.country_code) && <span className="text-lg leading-none">{countryFlag(node.country_code)}</span>}
                <Text variant="body-1">{node.name}</Text>
              </div>
              <div className="flex items-center gap-3">
                <Text variant="caption-2" color="secondary">
                  {formatTrafficGb(node.traffic_used_gb)}
                </Text>
                {node.is_disabled ? (
                  <Label theme="warning">Отключена</Label>
                ) : node.is_connected ? (
                  <Label theme="success">Online</Label>
                ) : (
                  <Label theme="danger">Offline</Label>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

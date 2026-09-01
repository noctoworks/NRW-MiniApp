import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getNodes } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import Loader from '../../components/Loader';
import { countryFlag, countryName, formatTrafficGb } from '../../lib/format';
import type { Node } from '../../types';

interface RegionGroup {
  countryCode: string;
  nodes: Node[];
  onlineCount: number;
  trafficGb: number;
}

function groupByRegion(nodes: Node[]): RegionGroup[] {
  const groups = new Map<string, RegionGroup>();
  for (const node of nodes) {
    const key = node.country_code || '';
    const group = groups.get(key) ?? { countryCode: key, nodes: [], onlineCount: 0, trafficGb: 0 };
    group.nodes.push(node);
    if (node.is_connected && !node.is_disabled) group.onlineCount += 1;
    group.trafficGb += node.traffic_used_gb;
    groups.set(key, group);
  }
  // Больше нод — выше в списке; при равенстве по трафику.
  return [...groups.values()].sort((a, b) => b.nodes.length - a.nodes.length || b.trafficGb - a.trafficGb);
}

export default function AdminRegions() {
  const { data: nodes, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'nodes'], queryFn: getNodes });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !nodes) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const regions = groupByRegion(nodes);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Text variant="header-1">Регионы</Text>
      <Text variant="body-2" color="secondary">
        Разбивка по странам считается из списка нод (см. «Ноды») — отдельного справочника регионов в базе
        пока нет.
      </Text>

      <Card view="outlined" className="flex flex-col">
        {regions.length === 0 ? (
          <Text variant="body-1" color="secondary" className="block p-4">
            Нод не найдено
          </Text>
        ) : (
          regions.map((region) => (
            <div
              key={region.countryCode || 'unset'}
              className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0"
            >
              <div className="flex items-center gap-2">
                {countryFlag(region.countryCode) && (
                  <span className="text-lg leading-none">{countryFlag(region.countryCode)}</span>
                )}
                <div className="flex flex-col">
                  <Text variant="body-1">{countryName(region.countryCode)}</Text>
                  <Text variant="caption-2" color="secondary">
                    {region.onlineCount} / {region.nodes.length} нод онлайн
                  </Text>
                </div>
              </div>
              <Text variant="caption-2" color="secondary">
                {formatTrafficGb(region.trafficGb)}
              </Text>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Button, Card, Label, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getMonitoring, getNodes } from '../../api/admin';
import { countryFlag, formatTrafficGb } from '../../lib/format';
import AdminEmptyState from './AdminEmptyState';

/** Инфраструктура на Обзоре (диалог 2026-09-01, мокап-референс) — статус +
 * живые юзеры онлайн (из /monitoring) + суммарный трафик ноды. Сознательно
 * БЕЗ CPU/RAM/Cost по ноде — Remnawave не отдаёт аппаратные метрики
 * отдельных нод (только хоста самой панели, см. /monitoring), а стоимости
 * серверов нет ни в БД, ни в Remnawave — показывать нечем. */
export default function NodesOverviewTable() {
  const navigate = useNavigate();
  const { data: nodes, isLoading } = useQuery({ queryKey: ['admin', 'nodes'], queryFn: getNodes });
  const { data: monitoring } = useQuery({ queryKey: ['admin', 'monitoring'], queryFn: getMonitoring });

  const onlineByUuid = new Map((monitoring?.nodes ?? []).map((n) => [n.node_uuid, n.users_online]));

  return (
    <Card view="outlined" className="flex flex-col">
      <div className="flex items-center justify-between p-4 pb-2">
        <Text variant="subheader-1">Инфраструктура</Text>
        <Button view="flat" size="s" onClick={() => navigate('/admin/nodes')}>
          Все ноды
        </Button>
      </div>

      {isLoading ? (
        <Text variant="body-1" color="secondary" className="block px-4 pb-4">
          Загрузка…
        </Text>
      ) : !nodes || nodes.length === 0 ? (
        <AdminEmptyState text="Нод не найдено" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-t border-[var(--g-color-line-generic)]">
                <th className="px-4 py-2 font-normal">
                  <Text variant="caption-2" color="secondary">
                    Нода
                  </Text>
                </th>
                <th className="px-4 py-2 font-normal">
                  <Text variant="caption-2" color="secondary">
                    Статус
                  </Text>
                </th>
                <th className="px-4 py-2 font-normal">
                  <Text variant="caption-2" color="secondary">
                    Онлайн
                  </Text>
                </th>
                <th className="px-4 py-2 text-right font-normal">
                  <Text variant="caption-2" color="secondary">
                    Трафик
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.uuid} className="border-t border-[var(--g-color-line-generic)]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {countryFlag(node.country_code) && <span className="text-base leading-none">{countryFlag(node.country_code)}</span>}
                      <Text variant="body-1">{node.name}</Text>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Label theme={node.is_disabled ? 'warning' : node.is_connected ? 'success' : 'danger'}>
                      {node.is_disabled ? 'Отключена' : node.is_connected ? 'Online' : 'Offline'}
                    </Label>
                  </td>
                  <td className="px-4 py-2.5">
                    <Text variant="body-1">{onlineByUuid.get(node.uuid) ?? '—'}</Text>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Text variant="body-1" color="secondary">
                      {formatTrafficGb(node.traffic_used_gb)}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

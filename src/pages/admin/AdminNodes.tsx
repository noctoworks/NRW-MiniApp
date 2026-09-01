import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRotateRight } from '@gravity-ui/icons';
import { Button, Card, Icon, Label, Switch, Text } from '@gravity-ui/uikit';
import { disableNode, enableNode, getNodes, restartNode } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import InfraBillingCard from '../../components/admin/InfraBillingCard';
import Loader from '../../components/Loader';
import { countryFlag, formatTrafficGb } from '../../lib/format';
import { alertDialog, confirmDialog } from '../../lib/nativeDialogs';
import type { Node } from '../../types';

function NodeRow({ node }: { node: Node }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'nodes'] });

  // Пути (/nodes/{uuid}/actions/enable|disable|restart) сверены с исходником
  // контракта панели, но НЕ проверялись вживую (в отличие от остального
  // раздела «Ноды») — первый клик здесь на бою и есть первая проверка (см.
  // app/external/remnawave/real.py в NRW-Bot).
  const toggleMutation = useMutation({
    mutationFn: (enable: boolean) => (enable ? enableNode(node.uuid) : disableNode(node.uuid)),
    onSuccess: invalidate,
    onError: () => alertDialog('Не удалось изменить статус ноды. Попробуйте ещё раз чуть позже.'),
  });

  const restartMutation = useMutation({
    mutationFn: () => restartNode(node.uuid),
    onError: () => alertDialog('Не удалось перезапустить ноду. Попробуйте ещё раз чуть позже.'),
  });

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      const confirmed = await confirmDialog(`Отключить ноду «${node.name}»? Пользователи на ней потеряют соединение.`);
      if (!confirmed) return;
    }
    toggleMutation.mutate(checked);
  };

  const handleRestart = async () => {
    const confirmed = await confirmDialog(`Перезапустить ноду «${node.name}»? Активные соединения на ней оборвутся.`);
    if (!confirmed) return;
    restartMutation.mutate();
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0">
      <div className="flex min-w-0 items-center gap-2">
        {countryFlag(node.country_code) && <span className="shrink-0 text-lg leading-none">{countryFlag(node.country_code)}</span>}
        <Text variant="body-1" ellipsis>
          {node.name}
        </Text>
      </div>
      <div className="flex shrink-0 items-center gap-3">
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
        <Button view="flat" size="s" onClick={handleRestart} loading={restartMutation.isPending} title="Перезапустить">
          <Icon data={ArrowRotateRight} size={14} />
        </Button>
        <Switch checked={!node.is_disabled} onUpdate={handleToggle} loading={toggleMutation.isPending} title="Включена" />
      </div>
    </div>
  );
}

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
        Статус и трафик по нодам Remnawave. Переключатель — включить/отключить ноду, значок рядом —
        перезапустить. CPU/память/аптайм здесь пока нет — панель не отдаёт это тем же запросом, что и
        остальное (см. «Мониторинг»).
      </Text>

      <Card view="outlined" className="flex flex-col">
        {nodes.length === 0 ? (
          <Text variant="body-1" color="secondary" className="block p-4">
            Нод не найдено
          </Text>
        ) : (
          nodes.map((node) => <NodeRow key={node.uuid} node={node} />)
        )}
      </Card>

      <InfraBillingCard />
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp } from '@gravity-ui/icons';
import { Card, Icon, Text } from '@gravity-ui/uikit';
import { getMonitoring } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import { formatTrafficGb } from '../../lib/format';
import type { NodeMetric } from '../../types';

function TrafficStat({ upload, download }: { upload: string; download: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Text variant="caption-2" className="inline-flex items-center gap-0.5">
        <Icon data={ArrowUp} size={11} />
        {upload}
      </Text>
      <Text variant="caption-2" className="inline-flex items-center gap-0.5">
        <Icon data={ArrowDown} size={11} />
        {download}
      </Text>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days} дн ${hours} ч`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} ч ${minutes} мин`;
}

function formatBytes(bytes: number): string {
  return formatTrafficGb(bytes / 1024 ** 3);
}

function NodeMetricCard({ node }: { node: NodeMetric }) {
  return (
    <Card view="outlined" className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <Text variant="body-1" className="font-semibold">
          {node.node_name}
        </Text>
        <Text variant="caption-2" color="secondary">
          {node.users_online} онлайн
        </Text>
      </div>
      <div className="flex flex-col gap-1">
        {node.inbound_stats.map((s) => (
          <div key={`in-${s.tag}`} className="flex items-center justify-between gap-2">
            <Text variant="caption-2" color="secondary" ellipsis>
              {s.tag}
            </Text>
            <TrafficStat upload={s.upload} download={s.download} />
          </div>
        ))}
        {node.outbound_stats.map((s) => (
          <div key={`out-${s.tag}`} className="flex items-center justify-between gap-2">
            <Text variant="caption-2" color="secondary" ellipsis>
              {s.tag}
            </Text>
            <TrafficStat upload={s.upload} download={s.download} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminMonitoring() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'monitoring'], queryFn: getMonitoring });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const { panel, nodes } = data;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Text variant="header-1">Мониторинг</Text>
      <Text variant="body-2" color="secondary">
        CPU/память/аптайм — это ресурсы машины, на которой крутится сама панель Remnawave, а не
        аппаратные метрики отдельных VPN-нод (панель их не отдаёт). Трафик по нодам — живой счётчик
        с момента последнего рестарта ноды, не за период.
      </Text>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label="Онлайн сейчас" value={String(panel.users_online_now)} accent />
        <KpiTile label="За сутки" value={String(panel.users_online_last_day)} />
        <KpiTile label="За неделю" value={String(panel.users_online_last_week)} />
        <KpiTile label="Никогда не заходили" value={String(panel.users_never_online)} />
        <KpiTile label="Нод онлайн" value={String(panel.nodes_online)} />
        <KpiTile label="Трафик всего" value={formatBytes(panel.nodes_total_bytes_lifetime)} />
        <KpiTile
          label="Память панели"
          value={`${formatBytes(panel.memory_used_bytes)} / ${formatBytes(panel.memory_total_bytes)}`}
          hint={`${panel.cpu_cores} CPU`}
        />
        <KpiTile label="Аптайм панели" value={formatUptime(panel.uptime_seconds)} />
      </div>

      <div className="flex flex-col gap-3">
        <Text variant="subheader-1">Ноды</Text>
        {nodes.length === 0 ? (
          <Text variant="body-1" color="secondary">
            Нод не найдено
          </Text>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {nodes.map((node) => (
              <NodeMetricCard key={node.node_uuid} node={node} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

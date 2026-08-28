import { useQuery } from '@tanstack/react-query';
import { Avatar, Badge, Caption, Cell, List, Title } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router';
import { listSupportThreads } from '../../api/admin';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

// Обновляем список сам по себе, пока админ на странице — это единственный
// раздел админки, где важно увидеть новое сообщение без ручного рефреша
// (ждём живого клиента, а не проверяем статистику раз в день).
const POLL_INTERVAL_MS = 15_000;

export default function AdminSupport() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'support', 'threads'],
    queryFn: listSupportThreads,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return (
    <div className="flex flex-col gap-4">
      <Title level="2" weight="2">
        Обращения
      </Title>

      {isLoading ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : isError || !data ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <div className="card !p-0">
          <AdminEmptyState text="Обращений пока нет" />
        </div>
      ) : (
        <List className="card overflow-hidden !p-0">
          {data.map((thread) => {
            const label = thread.full_name || (thread.username ? `@${thread.username}` : `id${thread.telegram_id}`);
            return (
              <Cell
                key={thread.user_id}
                onClick={() => navigate(`/admin/support/${thread.user_id}`)}
                before={<Avatar size={40} acronym={label.charAt(0).toUpperCase()} />}
                subtitle={
                  <Caption className="text-muted">
                    {thread.last_message.length > 60 ? `${thread.last_message.slice(0, 60)}…` : thread.last_message}
                    {' · '}
                    {timeAgo(thread.last_message_at)}
                  </Caption>
                }
                after={thread.unread ? <Badge type="dot" mode="critical" /> : undefined}
              >
                {label}
              </Cell>
            );
          })}
        </List>
      )}
    </div>
  );
}

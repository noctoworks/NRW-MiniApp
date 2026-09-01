import { useQuery } from '@tanstack/react-query';
import { Avatar, Card, Text } from '@gravity-ui/uikit';
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
      <Text variant="header-1">Обращения</Text>

      {isLoading ? (
        <Text variant="body-1" color="secondary">
          Загрузка…
        </Text>
      ) : isError || !data ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <AdminEmptyState text="Обращений пока нет" />
      ) : (
        <Card view="outlined" className="flex flex-col overflow-hidden">
          {data.map((thread) => {
            const label = thread.full_name || (thread.username ? `@${thread.username}` : `id${thread.telegram_id}`);
            const preview = thread.last_message.length > 60 ? `${thread.last_message.slice(0, 60)}…` : thread.last_message;
            return (
              <div
                key={thread.ticket_id}
                onClick={() => navigate(`/admin/support/${thread.ticket_id}`)}
                className="flex cursor-pointer items-center gap-3 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0"
              >
                <Avatar size="m" text={label.charAt(0).toUpperCase()} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Text variant="body-1" ellipsis>
                    {label}
                  </Text>
                  <Text variant="caption-2" color="secondary" ellipsis>
                    {thread.status === 'closed' && '✅ Закрыто · '}
                    {preview} · {timeAgo(thread.last_message_at)}
                    {thread.assigned_admin_name && ` · ведёт ${thread.assigned_admin_name}`}
                  </Text>
                </div>
                {thread.status === 'open' && thread.unread && (
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: 'var(--g-color-base-danger-heavy)' }} />
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

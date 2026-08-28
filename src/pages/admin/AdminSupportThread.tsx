import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Caption, Title } from '@telegram-apps/telegram-ui';
import { useNavigate, useParams } from 'react-router';
import { getSupportThread, replySupportThread } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import UserMessageForm from '../../components/admin/UserMessageForm';

const POLL_INTERVAL_MS = 15_000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Ремаунт при смене :userId — тот же приём, что у AdminUserDetail (см. её
 * комментарий): без key недописанный черновик ответа юзеру A мог бы уйти
 * юзеру B при переходе между тредами. */
export default function AdminSupportThread() {
  const { userId } = useParams<{ userId: string }>();
  return <AdminSupportThreadContent key={userId} />;
}

function AdminSupportThreadContent() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'support', 'thread', id],
    queryFn: () => getSupportThread(id),
    enabled: Number.isFinite(id),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const handleReply = async (text: string) => {
    await replySupportThread(id, text);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'thread', id] });
    await queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'threads'] });
  };

  if (isLoading) {
    return <div className="text-sm text-muted">Загрузка…</div>;
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const label = data.full_name || (data.username ? `@${data.username}` : `id${data.telegram_id}`);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <button type="button" onClick={() => navigate('/admin/support')} className="text-sm text-muted">
        ← К обращениям
      </button>

      <div>
        <Title level="2" weight="2">
          {label}
        </Title>
        <Caption className="text-muted">
          {data.username && `@${data.username} · `}telegram_id {data.telegram_id}
        </Caption>
      </div>

      <div className="card flex flex-col gap-2 !p-4">
        {data.messages.length === 0 ? (
          <span className="text-sm text-muted">Сообщений пока нет.</span>
        ) : (
          data.messages.map((message) => (
            <div key={message.id} className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm text-white ${
                  message.direction === 'out' ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <Caption
                  className={`mt-1 block text-right ${message.direction === 'out' ? 'text-white/70' : 'text-muted'}`}
                >
                  {formatTime(message.created_at)}
                </Caption>
              </div>
            </div>
          ))
        )}
      </div>

      <UserMessageForm onSubmit={handleReply} />
    </div>
  );
}

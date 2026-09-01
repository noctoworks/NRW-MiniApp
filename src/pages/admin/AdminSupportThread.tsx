import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Text } from '@gravity-ui/uikit';
import { useNavigate, useParams } from 'react-router';
import { closeSupportTicket, getSupportThread, reopenSupportTicket, replySupportThread } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import UserMessageForm from '../../components/admin/UserMessageForm';
import { confirmDialog } from '../../lib/nativeDialogs';

const POLL_INTERVAL_MS = 15_000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Ремаунт при смене :ticketId — тот же приём, что у AdminUserDetail (см. её
 * комментарий): без key недописанный черновик ответа юзеру A мог бы уйти
 * юзеру B при переходе между тредами. */
export default function AdminSupportThread() {
  const { ticketId } = useParams<{ ticketId: string }>();
  return <AdminSupportThreadContent key={ticketId} />;
}

function AdminSupportThreadContent() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const id = Number(ticketId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'support', 'thread', id],
    queryFn: () => getSupportThread(id),
    enabled: Number.isFinite(id),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'thread', id] });
    await queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'threads'] });
  };

  const handleReply = async (text: string) => {
    await replySupportThread(id, text);
    await invalidate();
  };

  const handleToggleStatus = async () => {
    if (!data) return;
    if (data.status === 'open') {
      if (!(await confirmDialog('Закрыть тикет? Пользователь по-прежнему сможет написать снова.'))) return;
      await closeSupportTicket(id);
    } else {
      await reopenSupportTicket(id);
    }
    await invalidate();
  };

  if (isLoading) {
    return (
      <Text variant="body-1" color="secondary">
        Загрузка…
      </Text>
    );
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const label = data.full_name || (data.username ? `@${data.username}` : `id${data.telegram_id}`);

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Button view="flat" size="s" onClick={() => navigate('/admin/support')} className="self-start">
        ← К обращениям
      </Button>

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Text variant="header-1">{label}</Text>
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: data.status === 'open' ? 'var(--g-color-base-positive-heavy)' : 'var(--g-color-base-danger-heavy)' }}
            />
          </div>
          <Text variant="caption-2" color="secondary">
            {data.username && `@${data.username} · `}telegram_id {data.telegram_id}
            {data.assigned_admin_name && ` · ведёт ${data.assigned_admin_name}`}
          </Text>
        </div>

        <Button view={data.status === 'open' ? 'outlined-danger' : 'outlined'} size="s" onClick={handleToggleStatus}>
          {data.status === 'open' ? 'Закрыть тикет' : 'Переоткрыть тикет'}
        </Button>
      </div>

      <Card view="filled" className="flex flex-col gap-2 p-4">
        {data.messages.length === 0 ? (
          <Text variant="body-1" color="secondary">
            Сообщений пока нет.
          </Text>
        ) : (
          data.messages.map((message) => (
            <div key={message.id} className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-3.5 py-2"
                style={{
                  borderRadius: 'var(--g-border-radius-2xl)',
                  background: message.direction === 'out' ? 'var(--g-color-base-brand)' : 'var(--g-color-base-generic)',
                  // Text.color не знает про "текст на брендовом фоне" — это
                  // отдельный токен (--g-color-text-brand-contrast, см.
                  // theming.md), не значение пропса, поэтому явный style,
                  // а не Text color=.
                  color: message.direction === 'out' ? 'var(--g-color-text-brand-contrast)' : undefined,
                }}
              >
                <Text
                  variant="body-1"
                  color={message.direction === 'out' ? undefined : 'primary'}
                  className="block whitespace-pre-wrap break-words"
                  style={message.direction === 'out' ? { color: 'inherit' } : undefined}
                >
                  {message.body}
                </Text>
                <Text
                  variant="caption-2"
                  color={message.direction === 'out' ? undefined : 'secondary'}
                  className="mt-1 block text-right"
                  style={message.direction === 'out' ? { color: 'inherit', opacity: 0.7 } : undefined}
                >
                  {formatTime(message.created_at)}
                </Text>
              </div>
            </div>
          ))
        )}
      </Card>

      <UserMessageForm onSubmit={handleReply} />
    </div>
  );
}

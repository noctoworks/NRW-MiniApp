import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Caption, Cell, Section, Switch, Title } from '@telegram-apps/telegram-ui';
import { useNavigate, useParams } from 'react-router';
import { adjustBalance, deleteUser, getUserDetail, messageUser, toggleBlock } from '../../api/admin';
import UserBalanceForm from '../../components/admin/UserBalanceForm';
import UserMessageForm from '../../components/admin/UserMessageForm';
import { formatDate, formatRub } from '../../lib/format';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => getUserDetail(userId),
    enabled: Number.isFinite(userId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });

  if (isLoading || !data) {
    return <div className="text-sm text-muted">Загрузка…</div>;
  }

  const handleBlockToggle = async () => {
    await toggleBlock(userId, !data.is_blocked);
    await invalidate();
  };

  const handleDelete = async () => {
    if (!window.confirm('Заблокировать и обезличить пользователя? Финансовая история сохранится.')) return;
    await deleteUser(userId);
    navigate('/admin/users');
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <button type="button" onClick={() => navigate('/admin/users')} className="text-sm text-muted">
        ← К списку
      </button>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <Title level="2" weight="2">
            {data.username ? `@${data.username}` : `id${data.telegram_id}`}
          </Title>
          <Badge type="dot" mode={data.is_blocked ? 'critical' : 'primary'} />
        </div>
        <Caption className="text-muted">
          telegram_id {data.telegram_id} · регистрация {formatDate(data.created_at)}
        </Caption>
        {data.blocked_bot && (
          <p className="mt-2 text-sm text-yellow-400">⚠️ Пользователь заблокировал бота — сообщения не доставляются.</p>
        )}
      </div>

      <Section>
        <Cell subtitle={<Caption className="text-muted">Баланс</Caption>}>{formatRub(data.balance_kopeks)}</Cell>
        <Cell subtitle={<Caption className="text-muted">Рефералы</Caption>}>
          {data.referrals_invited_count} · {formatRub(data.referrals_earned_kopeks)}
        </Cell>
        <Cell subtitle={<Caption className="text-muted">Подписка</Caption>}>
          {data.subscription ? `${data.subscription.status} до ${formatDate(data.subscription.end_date)}` : 'нет'}
        </Cell>
        <Cell subtitle={<Caption className="text-muted">Трафик</Caption>}>
          {data.subscription
            ? `${data.subscription.traffic_used_gb.toFixed(1)} / ${data.subscription.traffic_limit_gb || '∞'} ГБ`
            : '—'}
        </Cell>
      </Section>

      <Section>
        <div className="flex flex-col gap-3 px-4 py-3">
          <UserBalanceForm onSubmit={async (amount) => { await adjustBalance(userId, amount); await invalidate(); }} />
          <UserMessageForm onSubmit={(text) => messageUser(userId, text).then(() => undefined)} />
        </div>
        <Cell after={<Switch checked={data.is_blocked} onChange={handleBlockToggle} />}>Заблокирован</Cell>
        <Cell onClick={handleDelete} className="text-red-400">
          Удалить (заблокировать и обезличить)
        </Cell>
      </Section>

      <Section header="Последние транзакции">
        {data.transactions.length === 0 ? (
          <Cell className="text-muted">Транзакций нет</Cell>
        ) : (
          data.transactions.map((t) => (
            <Cell
              key={t.id}
              subtitle={<Caption className="text-muted">{formatDate(t.created_at)} · {t.status}</Caption>}
              after={<span className="font-semibold">{formatRub(t.amount_kopeks)}</span>}
            >
              {t.type}
            </Cell>
          ))
        )}
      </Section>
    </div>
  );
}

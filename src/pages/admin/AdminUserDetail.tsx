import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Caption, Cell, Section, SegmentedControl, Switch, Title } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  adjustBalance,
  adjustSubscriptionDays,
  deleteUser,
  getUserDetail,
  messageUser,
  setReferralCommission,
  setUserPromoGroup,
  toggleBlock,
} from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import DevicesSection from '../../components/admin/DevicesSection';
import DualActionAmountForm from '../../components/admin/DualActionAmountForm';
import GrantSubscriptionForm from '../../components/admin/GrantSubscriptionForm';
import ReferralCommissionForm from '../../components/admin/ReferralCommissionForm';
import SyncSection from '../../components/admin/SyncSection';
import TransactionsSection from '../../components/admin/TransactionsSection';
import UserMessageForm from '../../components/admin/UserMessageForm';
import UserPromoGroupSelect from '../../components/admin/UserPromoGroupSelect';
import { formatDate, formatRub } from '../../lib/format';
import { confirmDialog } from '../../lib/nativeDialogs';

type DetailTab = 'overview' | 'transactions' | 'devices' | 'settings';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'transactions', label: 'Транзакции' },
  { id: 'devices', label: 'Устройства' },
  { id: 'settings', label: 'Настройки' },
];

function parsePositiveRub(raw: string): number | null {
  const amount = Number.parseFloat(raw.replace(',', '.'));
  return amount > 0 ? amount : null;
}

function parsePositiveDays(raw: string): number | null {
  const days = Math.trunc(Number(raw));
  return days > 0 ? days : null;
}

/** Обёртка форсирует полный ремаунт AdminUserDetailContent при переходе на
 * другого пользователя (смена :id) — React Router САМ ПО СЕБЕ этого не
 * делает, переиспользует тот же инстанс компонента. Без key useState внутри
 * DualActionAmountForm/ReferralCommissionForm/UserMessageForm/
 * TransactionsSection переживает переход между юзерами: не отправленный
 * черновик суммы/сообщения/комиссии для юзера A может уйти юзеру B при
 * следующей отправке — см. ревью. */
export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  return <AdminUserDetailContent key={id} />;
}

function AdminUserDetailContent() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<DetailTab>('overview');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => getUserDetail(userId),
    enabled: Number.isFinite(userId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });

  if (isLoading) {
    return <div className="text-sm text-muted">Загрузка…</div>;
  }

  if (isError || !data) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  const handleBlockToggle = async () => {
    await toggleBlock(userId, !data.is_blocked);
    await invalidate();
  };

  const handleDelete = async () => {
    if (!(await confirmDialog('Заблокировать и обезличить пользователя? Финансовая история сохранится.'))) return;
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
            {data.full_name || (data.username ? `@${data.username}` : `id${data.telegram_id}`)}
          </Title>
          <Badge type="dot" mode={data.is_blocked ? 'critical' : 'primary'} />
        </div>
        <Caption className="text-muted">
          {data.username && `@${data.username} · `}telegram_id {data.telegram_id} · регистрация {formatDate(data.created_at)}
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
          {data.subscription
            ? `${data.subscription.is_trial ? '🎁 триал' : '💎 ' + data.subscription.status} до ${formatDate(data.subscription.end_date)}`
            : 'нет'}
        </Cell>
        <Cell subtitle={<Caption className="text-muted">Трафик</Caption>}>
          {data.subscription
            ? `${data.subscription.traffic_used_gb.toFixed(1)} / ${data.subscription.traffic_limit_gb || '∞'} ГБ`
            : '—'}
        </Cell>
        <Cell subtitle={<Caption className="text-muted">Промогруппа</Caption>}>
          {data.promo_group_name ?? 'без скидки'}
        </Cell>
      </Section>

      {/* Вкладки вместо одного нескончаемого блока (баланс + дни + сообщение +
       * реферальный % + промогруппа + блок + удаление вперемешку) — частые
       * действия (начислить/продлить) отдельно от разовых настроек, опасные
       * (удаление) визуально отделены и не соседствуют с обычными (см.
       * диалог "давай поправим админку" / research по CRM-паттернам:
       * табы для записи с несколькими доменами данных, а не один скролл). */}
      <SegmentedControl>
        {TABS.map((t) => (
          <SegmentedControl.Item key={t.id} selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>

      {tab === 'overview' && (
        <Section>
          <div className="flex flex-col gap-4 px-4 py-3">
            <div>
              <div className="section-title !mb-2 !px-0">Баланс</div>
              <DualActionAmountForm
                positiveLabel="Начислить"
                negativeLabel="Списать"
                inputHeader="Сумма"
                placeholder="Сумма в ₽"
                parse={parsePositiveRub}
                presets={[100, 500, 1000]}
                onSubmit={async (amount) => { await adjustBalance(userId, amount); await invalidate(); }}
              />
            </div>

            <div>
              <div className="section-title !mb-2 !px-0">Подписка</div>
              {data.subscription ? (
                <DualActionAmountForm
                  positiveLabel="Продлить"
                  negativeLabel="Сократить"
                  inputHeader="Дни"
                  placeholder="Количество дней"
                  parse={parsePositiveDays}
                  presets={[7, 30, 90]}
                  onSubmit={async (days) => { await adjustSubscriptionDays(userId, days); await invalidate(); }}
                />
              ) : (
                <GrantSubscriptionForm
                  onSubmit={async (days) => { await adjustSubscriptionDays(userId, days); await invalidate(); }}
                />
              )}
            </div>
          </div>
        </Section>
      )}

      {tab === 'transactions' && <TransactionsSection userId={userId} />}

      {tab === 'devices' && (
        <>
          <DevicesSection userId={userId} />
          <SyncSection userId={userId} />
        </>
      )}

      {tab === 'settings' && (
        <>
          <Section>
            <div className="flex flex-col gap-4 px-4 py-3">
              <UserMessageForm onSubmit={(text) => messageUser(userId, text).then(() => undefined)} />
              <ReferralCommissionForm
                value={data.referral_commission_percent}
                onSubmit={async (percent) => { await setReferralCommission(userId, percent); await invalidate(); }}
              />
              <UserPromoGroupSelect
                value={data.promo_group_id}
                onChange={async (groupId) => { await setUserPromoGroup(userId, groupId); await invalidate(); }}
              />
            </div>
            <Cell after={<Switch checked={data.is_blocked} onChange={handleBlockToggle} />}>Заблокирован</Cell>
          </Section>

          {/* Опасная зона — визуально отделена (заголовок + отступ), не
           * соседствует вплотную с обычными переключателями выше. */}
          <div>
            <div className="section-title !text-[hsl(var(--destructive))]">Опасная зона</div>
            <Section>
              <Cell onClick={handleDelete} className="text-red-400">
                Удалить (заблокировать и обезличить)
              </Cell>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

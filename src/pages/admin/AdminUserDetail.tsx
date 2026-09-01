import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';
import { useState, type ReactNode } from 'react';
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
import NodeTrafficSection from '../../components/admin/NodeTrafficSection';
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

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="body-1">{children}</Text>
    </div>
  );
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
    return (
      <Text variant="body-1" color="secondary">
        Загрузка…
      </Text>
    );
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
      <Button view="flat" size="s" onClick={() => navigate('/admin/users')} className="self-start">
        ← К списку
      </Button>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <Text variant="header-1">
            {data.full_name || (data.username ? `@${data.username}` : `id${data.telegram_id}`)}
          </Text>
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: data.is_blocked ? 'var(--g-color-base-danger-heavy)' : 'var(--g-color-base-positive-heavy)' }}
          />
        </div>
        <Text variant="caption-2" color="secondary">
          {data.username && `@${data.username} · `}telegram_id {data.telegram_id} · регистрация {formatDate(data.created_at)}
        </Text>
        {data.blocked_bot && (
          <Text variant="body-2" color="warning" className="mt-2 block">
            ⚠️ Пользователь заблокировал бота — сообщения не доставляются.
          </Text>
        )}
      </div>

      <Card view="outlined" className="flex flex-col">
        <InfoRow label="Баланс">{formatRub(data.balance_kopeks)}</InfoRow>
        <InfoRow label="Рефералы">
          {data.referrals_invited_count} · {formatRub(data.referrals_earned_kopeks)}
        </InfoRow>
        <InfoRow label="Подписка">
          {data.subscription
            ? `${data.subscription.is_trial ? '🎁 триал' : '💎 ' + data.subscription.status} до ${formatDate(data.subscription.end_date)}`
            : 'нет'}
        </InfoRow>
        <InfoRow label="Трафик">
          {data.subscription
            ? `${data.subscription.traffic_used_gb.toFixed(1)} / ${data.subscription.traffic_limit_gb || '∞'} ГБ`
            : '—'}
        </InfoRow>
        <InfoRow label="Промогруппа">{data.promo_group_name ?? 'без скидки'}</InfoRow>
      </Card>

      {/* Вкладки вместо одного нескончаемого блока (баланс + дни + сообщение +
       * реферальный % + промогруппа + блок + удаление вперемешку) — частые
       * действия (начислить/продлить) отдельно от разовых настроек, опасные
       * (удаление) визуально отделены и не соседствуют с обычными (см.
       * диалог "давай поправим админку" / research по CRM-паттернам:
       * табы для записи с несколькими доменами данных, а не один скролл). */}
      <SegmentedRadioGroup value={tab} onUpdate={(value) => setTab(value as DetailTab)}>
        {TABS.map((t) => (
          <SegmentedRadioGroup.Option key={t.id} value={t.id}>
            {t.label}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>

      {tab === 'overview' && (
        <Card view="outlined" className="flex flex-col gap-4 p-4">
          <div>
            <Text variant="subheader-1" className="mb-2 block">
              Баланс
            </Text>
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
            <Text variant="subheader-1" className="mb-2 block">
              Подписка
            </Text>
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
              <GrantSubscriptionForm onSubmit={async (days) => { await adjustSubscriptionDays(userId, days); await invalidate(); }} />
            )}
          </div>
        </Card>
      )}

      {tab === 'transactions' && <TransactionsSection userId={userId} />}

      {tab === 'devices' && (
        <div className="flex flex-col gap-4">
          <DevicesSection userId={userId} />
          <NodeTrafficSection userId={userId} />
          <SyncSection userId={userId} />
        </div>
      )}

      {tab === 'settings' && (
        <div className="flex flex-col gap-4">
          <Card view="outlined" className="flex flex-col">
            <div className="flex flex-col gap-4 p-4">
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
            <div className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3">
              <Text variant="body-1">Заблокирован</Text>
              <Switch checked={data.is_blocked} onUpdate={handleBlockToggle} />
            </div>
          </Card>

          {/* Опасная зона — визуально отделена (заголовок + отступ), не
           * соседствует вплотную с обычными переключателями выше. */}
          <div>
            <Text variant="subheader-1" color="danger" className="mb-2 block">
              Опасная зона
            </Text>
            <Card view="outlined">
              <Button view="flat-danger" size="l" onClick={handleDelete} width="max">
                Удалить (заблокировать и обезличить)
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

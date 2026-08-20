import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Caption, Cell, Input, Section, SegmentedControl, Switch, Title } from '@telegram-apps/telegram-ui';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { useState } from 'react';
import { createCampaign, deleteCampaign, getCampaignStats, listCampaigns, updateCampaign } from '../../api/admin';
import { copyToClipboard } from '../../lib/clipboard';
import { formatRub } from '../../lib/format';
import { confirmDialog } from '../../lib/nativeDialogs';
import type { Campaign, CampaignBonusType } from '../../types';

const BONUS_LABELS: Record<CampaignBonusType, string> = {
  balance: 'Баланс',
  subscription: 'Подписка',
  none: 'Без бонуса',
};

function CampaignStatsRow({ campaignId }: { campaignId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'campaign', campaignId, 'stats'],
    queryFn: () => getCampaignStats(campaignId),
  });

  if (isLoading || !data) return <Caption className="px-4 pb-3 text-muted">Загрузка статистики…</Caption>;

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-3 text-xs text-muted">
      <span>Регистраций: {data.registrations_count}</span>
      <span>Платят: {data.paying_count}</span>
      <span>Конверсия: {data.conversion_percent}%</span>
      <span>Выручка: {formatRub(data.revenue_kopeks)}</span>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });

  const handleToggle = async () => {
    await updateCampaign(campaign.id, { is_active: !campaign.is_active });
    await invalidate();
  };

  const handleDelete = async () => {
    if (!(await confirmDialog(`Удалить кампанию «${campaign.name}»?`))) return;
    await deleteCampaign(campaign.id);
    await invalidate();
  };

  const handleCopyLink = async () => {
    await copyToClipboard(campaign.deep_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Cell
        subtitle={
          <Caption className="text-muted">
            {BONUS_LABELS[campaign.bonus_type]}
            {campaign.bonus_type === 'balance' && ` · ${formatRub(campaign.balance_bonus_kopeks)}`}
            {campaign.bonus_type === 'subscription' && ` · ${campaign.subscription_duration_days} дн.`}
          </Caption>
        }
        after={<Switch checked={campaign.is_active} onChange={handleToggle} />}
      >
        {campaign.name}
      </Cell>
      {/* Отдельная строка под второстепенные действия — раньше все четыре
       * (копировать/статистика/переключатель/удалить) стояли вплотную в
       * size="s", включая деструктивное "удалить" рядом с безобидными —
       * на телефоне легко промахнуться (см. диалог: "удобство на телефоне"). */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-medium text-[hsl(var(--subtitle-foreground))] active:opacity-70"
        >
          {copied ? (
            <span className="text-success">✓ Скопировано</span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Ссылка
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowStats((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-medium text-[hsl(var(--subtitle-foreground))] active:opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 17V9M13 17V5M8 17v-5" />
          </svg>
          Статистика
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-[hsl(var(--destructive)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))] active:opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          Удалить
        </button>
      </div>
      {showStats && <CampaignStatsRow campaignId={campaign.id} />}
    </>
  );
}

function CreateCampaignForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [startParameter, setStartParameter] = useState('');
  const [bonusType, setBonusType] = useState<CampaignBonusType>('balance');
  const [balanceRub, setBalanceRub] = useState('');
  const [subscriptionDays, setSubscriptionDays] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !startParameter.trim()) return;
    setSubmitting(true);
    try {
      await createCampaign({
        name: name.trim(),
        start_parameter: startParameter.trim(),
        bonus_type: bonusType,
        balance_bonus_kopeks: bonusType === 'balance' ? Math.round(Number.parseFloat(balanceRub || '0') * 100) : 0,
        subscription_duration_days: bonusType === 'subscription' ? Number.parseInt(subscriptionDays || '0', 10) : null,
      });
      setName('');
      setStartParameter('');
      setBalanceRub('');
      setSubscriptionDays('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <Input header="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Instagram Jan" />
      <Input
        header="start_parameter (для ссылки)"
        value={startParameter}
        onChange={(e) => setStartParameter(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
        placeholder="instagram_jan2026"
      />

      <SegmentedControl>
        {(Object.keys(BONUS_LABELS) as CampaignBonusType[]).map((type) => (
          <SegmentedControl.Item key={type} selected={bonusType === type} onClick={() => setBonusType(type)}>
            {BONUS_LABELS[type]}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>

      {bonusType === 'balance' && (
        <Input header="Бонус, ₽" value={balanceRub} onChange={(e) => setBalanceRub(e.target.value)} inputMode="decimal" />
      )}
      {bonusType === 'subscription' && (
        <Input
          header="Бесплатных дней подписки"
          value={subscriptionDays}
          onChange={(e) => setSubscriptionDays(e.target.value)}
          inputMode="numeric"
        />
      )}

      <Button mode="filled" size="m" disabled={submitting} onClick={handleCreate}>
        Создать кампанию
      </Button>
    </div>
  );
}

export default function AdminCampaigns() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'campaigns'], queryFn: listCampaigns });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Title level="2" weight="2">
        Кампании
      </Title>
      <p className="text-xs text-muted">
        Ссылка вида t.me/бот?start=start_parameter — бонус начисляется один раз при
        регистрации нового пользователя по ссылке.
      </p>

      <Section footer="Ссылку на кампанию можно скопировать иконкой рядом с названием">
        <CreateCampaignForm />
        {isLoading ? (
          <Cell className="text-muted">Загрузка…</Cell>
        ) : data && data.length > 0 ? (
          data.map((campaign) => <CampaignRow key={campaign.id} campaign={campaign} />)
        ) : (
          <AdminEmptyState text="Кампаний ещё нет" />
        )}
      </Section>
    </div>
  );
}

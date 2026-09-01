import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartColumn, Check, Copy, Xmark } from '@gravity-ui/icons';
import { Button, Card, Icon, SegmentedRadioGroup, Switch, Text, TextInput } from '@gravity-ui/uikit';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';
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

  if (isLoading || !data)
    return (
      <Text variant="caption-2" color="secondary" className="block px-4 pb-3">
        Загрузка статистики…
      </Text>
    );

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
      <Text variant="caption-2" color="secondary">
        Регистраций: {data.registrations_count}
      </Text>
      <Text variant="caption-2" color="secondary">
        Платят: {data.paying_count}
      </Text>
      <Text variant="caption-2" color="secondary">
        Конверсия: {data.conversion_percent}%
      </Text>
      <Text variant="caption-2" color="secondary">
        Выручка: {formatRub(data.revenue_kopeks)}
      </Text>
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
    <div className="border-t border-[var(--g-color-line-generic)] py-3">
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <Text variant="body-1" ellipsis>
            {campaign.name}
          </Text>
          <Text variant="caption-2" color="secondary">
            {BONUS_LABELS[campaign.bonus_type]}
            {campaign.bonus_type === 'balance' && ` · ${formatRub(campaign.balance_bonus_kopeks)}`}
            {campaign.bonus_type === 'subscription' && ` · ${campaign.subscription_duration_days} дн.`}
          </Text>
        </div>
        <Switch checked={campaign.is_active} onUpdate={handleToggle} />
      </div>
      {/* Отдельная строка под второстепенные действия — раньше все четыре
       * (копировать/статистика/переключатель/удалить) стояли вплотную в
       * size="s", включая деструктивное "удалить" рядом с безобидными —
       * на телефоне легко промахнуться (см. диалог: "удобство на телефоне"). */}
      <div className="mt-2 flex items-center gap-2 px-4">
        <Button view="flat" size="s" onClick={handleCopyLink}>
          {copied ? (
            <>
              <Icon data={Check} size={14} />
              Скопировано
            </>
          ) : (
            <>
              <Icon data={Copy} size={14} />
              Ссылка
            </>
          )}
        </Button>
        <Button view="flat" size="s" onClick={() => setShowStats((v) => !v)}>
          <Icon data={ChartColumn} size={14} />
          Статистика
        </Button>
        <Button view="flat-danger" size="s" onClick={handleDelete} className="ml-auto">
          <Icon data={Xmark} size={14} />
          Удалить
        </Button>
      </div>
      {showStats && <CampaignStatsRow campaignId={campaign.id} />}
    </div>
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
      <div className="flex flex-col gap-1">
        <Text variant="caption-2" color="secondary">
          Название
        </Text>
        <TextInput value={name} onUpdate={setName} placeholder="Instagram Jan" />
      </div>
      <div className="flex flex-col gap-1">
        <Text variant="caption-2" color="secondary">
          start_parameter (для ссылки)
        </Text>
        <TextInput
          value={startParameter}
          onUpdate={(value) => setStartParameter(value.replace(/[^a-zA-Z0-9_-]/g, ''))}
          placeholder="instagram_jan2026"
        />
      </div>

      <SegmentedRadioGroup value={bonusType} onUpdate={(value) => setBonusType(value as CampaignBonusType)}>
        {(Object.keys(BONUS_LABELS) as CampaignBonusType[]).map((type) => (
          <SegmentedRadioGroup.Option key={type} value={type}>
            {BONUS_LABELS[type]}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>

      {bonusType === 'balance' && (
        <div className="flex flex-col gap-1">
          <Text variant="caption-2" color="secondary">
            Бонус, ₽
          </Text>
          <TextInput value={balanceRub} onUpdate={setBalanceRub} controlProps={{ inputMode: 'decimal' }} />
        </div>
      )}
      {bonusType === 'subscription' && (
        <div className="flex flex-col gap-1">
          <Text variant="caption-2" color="secondary">
            Бесплатных дней подписки
          </Text>
          <TextInput value={subscriptionDays} onUpdate={setSubscriptionDays} controlProps={{ inputMode: 'numeric' }} />
        </div>
      )}

      <Button view="action" size="m" loading={submitting} onClick={handleCreate}>
        Создать кампанию
      </Button>
    </div>
  );
}

export default function AdminCampaigns() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: listCampaigns,
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Text variant="header-1">Кампании</Text>
      <Text variant="body-2" color="secondary">
        Ссылка вида t.me/бот?start=start_parameter — бонус начисляется один раз при
        регистрации нового пользователя по ссылке.
      </Text>

      <Card view="outlined" className="flex flex-col">
        <CreateCampaignForm />
        {isLoading ? (
          <Text variant="body-1" color="secondary" className="block px-4 py-3">
            Загрузка…
          </Text>
        ) : isError || !data ? (
          <AdminErrorState onRetry={() => refetch()} />
        ) : data.length > 0 ? (
          data.map((campaign) => <CampaignRow key={campaign.id} campaign={campaign} />)
        ) : (
          <AdminEmptyState text="Кампаний ещё нет" />
        )}
        <Text variant="caption-2" color="secondary" className="block border-t border-[var(--g-color-line-generic)] px-4 py-2">
          Ссылку на кампанию можно скопировать иконкой рядом с названием
        </Text>
      </Card>
    </div>
  );
}

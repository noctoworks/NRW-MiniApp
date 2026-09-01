import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Xmark } from '@gravity-ui/icons';
import { Button, Card, Icon, SegmentedRadioGroup, Switch, Text, TextInput } from '@gravity-ui/uikit';
import { useState } from 'react';
import { createPromoCode, deletePromoCode, listPromoCodes, updatePromoCode } from '../../api/admin';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { formatRub } from '../../lib/format';
import { confirmDialog } from '../../lib/nativeDialogs';
import type { PromoCode, PromoCodeType } from '../../types';

function formatPromoValue(code: PromoCode): string {
  return code.type === 'balance' ? formatRub(code.value) : `${code.value} дн.`;
}

function PromoCodeRow({ code }: { code: PromoCode }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });

  const handleToggle = async () => {
    await updatePromoCode(code.id, { is_active: !code.is_active });
    await invalidate();
  };

  const handleDelete = async () => {
    if (!(await confirmDialog(`Удалить промокод «${code.code}»? Это необратимо.`))) return;
    await deletePromoCode(code.id);
    await invalidate();
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 first:border-t-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <Text variant="body-1" className="font-semibold" ellipsis>
          {code.code}
        </Text>
        <Text variant="caption-2" color="secondary">
          {formatPromoValue(code)} · {code.activations_count}/{code.max_activations} активаций
        </Text>
      </div>
      <Switch checked={code.is_active} onUpdate={handleToggle} />
      <Button view="flat-danger" size="s" onClick={handleDelete} aria-label="Удалить промокод" className="shrink-0">
        <Icon data={Xmark} size={15} />
      </Button>
    </div>
  );
}

function CreatePromoCodeForm() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [type, setType] = useState<PromoCodeType>('balance');
  const [value, setValue] = useState('');
  const [maxActivations, setMaxActivations] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    const parsedValue = type === 'balance' ? Math.round(Number.parseFloat(value.replace(',', '.')) * 100) : Number.parseInt(value, 10);
    const parsedMax = Number.parseInt(maxActivations, 10);
    if (!code.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0 || !Number.isFinite(parsedMax) || parsedMax <= 0) return;
    setSubmitting(true);
    try {
      await createPromoCode({ code: code.trim(), type, value: parsedValue, max_activations: parsedMax });
      setCode('');
      setValue('');
      setMaxActivations('1');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex flex-col gap-1">
        <Text variant="caption-2" color="secondary">
          Код
        </Text>
        <TextInput value={code} onUpdate={setCode} placeholder="Например, SUMMER2026" />
      </div>

      <SegmentedRadioGroup value={type} onUpdate={(v) => setType(v as PromoCodeType)}>
        <SegmentedRadioGroup.Option value="balance">Баланс</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="days">Дни подписки</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Text variant="caption-2" color="secondary">
            {type === 'balance' ? 'Сумма, ₽' : 'Дней'}
          </Text>
          <TextInput value={value} onUpdate={setValue} controlProps={{ inputMode: type === 'balance' ? 'decimal' : 'numeric' }} />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <Text variant="caption-2" color="secondary">
            Лимит активаций
          </Text>
          <TextInput value={maxActivations} onUpdate={setMaxActivations} controlProps={{ inputMode: 'numeric' }} />
        </div>
        <Button view="action" size="m" loading={submitting} onClick={handleCreate}>
          Создать
        </Button>
      </div>
    </div>
  );
}

export default function AdminPromoCodes() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'promo-codes'],
    queryFn: listPromoCodes,
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Text variant="header-1">Промокоды</Text>
      <Text variant="body-2" color="secondary">
        Разовые коды на баланс или дни подписки — пользователь вводит код сам в боте, один код на
        человека.
      </Text>

      <Card view="outlined" className="flex flex-col">
        <CreatePromoCodeForm />
        {isLoading ? (
          <Text variant="body-1" color="secondary" className="block px-4 py-3">
            Загрузка…
          </Text>
        ) : isError || !data ? (
          <AdminErrorState onRetry={() => refetch()} />
        ) : data.length > 0 ? (
          data.map((code) => <PromoCodeRow key={code.id} code={code} />)
        ) : (
          <AdminEmptyState text="Промокодов ещё нет" />
        )}
      </Card>
    </div>
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Cell, Input, Section, Title } from '@telegram-apps/telegram-ui';
import AdminEmptyState, { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { useState } from 'react';
import { createPromoGroup, deletePromoGroup, listPromoGroups, updatePromoGroup } from '../../api/admin';
import { confirmDialog } from '../../lib/nativeDialogs';
import type { PromoGroup } from '../../types';

function GroupRow({ group }: { group: PromoGroup }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [discount, setDiscount] = useState(String(group.discount_percent));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'promo-groups'] });

  const handleSave = async () => {
    const percent = Number.parseInt(discount, 10);
    if (Number.isNaN(percent) || percent < 0 || percent > 100 || !name.trim()) return;
    await updatePromoGroup(group.id, { name: name.trim(), discount_percent: percent });
    setEditing(false);
    await invalidate();
  };

  const handleDelete = async () => {
    if (!(await confirmDialog(`Удалить группу «${group.name}»? Юзеры вернутся к обычной цене.`))) return;
    await deletePromoGroup(group.id);
    await invalidate();
  };

  if (editing) {
    return (
      <Cell
        after={
          <div className="flex gap-1">
            <Button mode="filled" size="s" onClick={handleSave}>
              Сохранить
            </Button>
            <Button mode="gray" size="s" onClick={() => setEditing(false)}>
              Отмена
            </Button>
          </div>
        }
      >
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" />
          <Input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="%" inputMode="numeric" className="w-16" />
        </div>
      </Cell>
    );
  }

  return (
    <Cell
      subtitle={`${group.users_count} юзеров`}
      after={<span className="font-semibold text-accent">-{group.discount_percent}%</span>}
      onClick={() => setEditing(true)}
    >
      <div className="flex items-center justify-between gap-2">
        {group.name}
        {/* Раньше редактировать/удалить были парой мелких (size="s") иконок
         * вплотную друг к другу — на телефоне легко промахнуться между ними
         * (см. диалог: "удобство на телефоне"). Открытие редактирования теперь
         * по тапу на всю строку (см. onClick выше), удаление — отдельная,
         * заметно отделённая кнопка. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleDelete();
          }}
          aria-label="Удалить группу"
          className="shrink-0 rounded-full bg-[hsl(var(--destructive)/0.12)] p-2 text-[hsl(var(--destructive))] active:opacity-70"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Cell>
  );
}

function CreateGroupForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    const percent = Number.parseInt(discount, 10);
    if (!name.trim() || Number.isNaN(percent) || percent < 0 || percent > 100) return;
    setSubmitting(true);
    try {
      await createPromoGroup(name.trim(), percent);
      setName('');
      setDiscount('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'promo-groups'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3">
      <div className="flex-1">
        <Input header="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, VIP" />
      </div>
      <div className="w-24">
        <Input header="Скидка %" value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="numeric" />
      </div>
      <Button mode="filled" size="m" disabled={submitting} onClick={handleCreate}>
        Создать
      </Button>
    </div>
  );
}

export default function AdminPromoGroups() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'promo-groups'],
    queryFn: listPromoGroups,
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Title level="2" weight="2">
        Промогруппы
      </Title>
      <p className="text-xs text-muted">
        Скидочные тиры на пользователя — единый % на цену подписки (у нас нет отдельных
        покупок трафика/устройств, поэтому один процент вместо трёх, как в референсе).
      </p>

      <Section footer="Назначаются пользователю в его карточке">
        <CreateGroupForm />
        {isLoading ? (
          <Cell className="text-muted">Загрузка…</Cell>
        ) : isError || !data ? (
          <AdminErrorState onRetry={() => refetch()} />
        ) : data.length > 0 ? (
          data.map((group) => <GroupRow key={group.id} group={group} />)
        ) : (
          <AdminEmptyState text="Групп ещё нет" />
        )}
      </Section>
    </div>
  );
}

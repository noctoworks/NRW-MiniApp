import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Xmark } from '@gravity-ui/icons';
import { Button, Card, Icon, Text, TextInput } from '@gravity-ui/uikit';
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
      <div className="flex items-end gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3">
        <div className="flex-1">
          <TextInput value={name} onUpdate={setName} placeholder="Название" />
        </div>
        <div className="w-16">
          <TextInput value={discount} onUpdate={setDiscount} placeholder="%" controlProps={{ inputMode: 'numeric' }} />
        </div>
        <Button view="action" size="m" onClick={handleSave}>
          Сохранить
        </Button>
        <Button view="flat" size="m" onClick={() => setEditing(false)}>
          Отмена
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3"
      onClick={() => setEditing(true)}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <Text variant="body-1" ellipsis>
          {group.name}
        </Text>
        <Text variant="caption-2" color="secondary">
          {group.users_count} юзеров
        </Text>
      </div>
      <Text variant="body-1" color="brand" className="shrink-0">
        -{group.discount_percent}%
      </Text>
      {/* Раньше редактировать/удалить были парой мелких (size="s") иконок
       * вплотную друг к другу — на телефоне легко промахнуться между ними
       * (см. диалог: "удобство на телефоне"). Открытие редактирования теперь
       * по тапу на всю строку (см. onClick выше), удаление — отдельная,
       * заметно отделённая кнопка. */}
      <Button
        view="flat-danger"
        size="s"
        onClick={(e) => {
          e.stopPropagation();
          void handleDelete();
        }}
        aria-label="Удалить группу"
        className="shrink-0"
      >
        <Icon data={Xmark} size={15} />
      </Button>
    </div>
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
        <TextInput label="Название" value={name} onUpdate={setName} placeholder="Например, VIP" />
      </div>
      <div className="w-24">
        <TextInput label="Скидка %" value={discount} onUpdate={setDiscount} controlProps={{ inputMode: 'numeric' }} />
      </div>
      <Button view="action" size="m" loading={submitting} onClick={handleCreate}>
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
      <Text variant="header-1">Промогруппы</Text>
      <Text variant="body-2" color="secondary">
        Скидочные тиры на пользователя — единый % на цену подписки (у нас нет отдельных
        покупок трафика/устройств, поэтому один процент вместо трёх, как в референсе).
      </Text>

      <Card view="outlined" className="flex flex-col">
        <CreateGroupForm />
        {isLoading ? (
          <Text variant="body-1" color="secondary" className="block px-4 py-3">
            Загрузка…
          </Text>
        ) : isError || !data ? (
          <AdminErrorState onRetry={() => refetch()} />
        ) : data.length > 0 ? (
          data.map((group) => <GroupRow key={group.id} group={group} />)
        ) : (
          <AdminEmptyState text="Групп ещё нет" />
        )}
        <Text variant="caption-2" color="secondary" className="block border-t border-[var(--g-color-line-generic)] px-4 py-2">
          Назначаются пользователю в его карточке
        </Text>
      </Card>
    </div>
  );
}

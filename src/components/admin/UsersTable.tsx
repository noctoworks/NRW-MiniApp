import { Table, useTable } from '@gravity-ui/table';
import type { ColumnDef, SortingState } from '@gravity-ui/table/tanstack';
import { Avatar, Label, Text } from '@gravity-ui/uikit';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { AdminUserListItem } from '../../types';
import AdminEmptyState from './AdminEmptyState';

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

function userLabel(user: AdminUserListItem): string {
  return user.full_name || (user.username ? `@${user.username}` : `id${user.telegram_id}`);
}

// Ранг для сортировки по статусу (не текстовое поле, поэтому accessorFn, а
// не accessorKey) — заблокированные первые (обычно самое важное для админа),
// потом активные подписки, потом остальные.
function statusRank(user: AdminUserListItem): number {
  if (user.is_blocked) return 0;
  if (user.has_active_subscription) return 1;
  return 2;
}

const columns: ColumnDef<AdminUserListItem>[] = [
  {
    id: 'user',
    accessorFn: (user) => userLabel(user),
    header: 'Пользователь',
    size: 240,
    cell: ({ row }) => {
      const user = row.original;
      const label = userLabel(user);
      return (
        <div className="flex items-center gap-2">
          <Avatar size="m" text={label.charAt(0).toUpperCase()} />
          <Text variant="body-1" ellipsis>
            {label}
          </Text>
        </div>
      );
    },
  },
  {
    accessorKey: 'telegram_id',
    header: 'Telegram ID',
    size: 120,
  },
  {
    id: 'status',
    accessorFn: statusRank,
    header: 'Статус',
    size: 130,
    cell: ({ row }) => {
      const user = row.original;
      if (user.is_blocked) return <Label theme="danger">Чёрный список</Label>;
      if (user.has_active_subscription) return <Label theme="success">{user.is_trial ? 'Триал' : 'Активна'}</Label>;
      return null;
    },
  },
  {
    id: 'last_activity_at',
    accessorFn: (user) => (user.last_activity_at ? new Date(user.last_activity_at).getTime() : 0),
    header: 'Активность',
    size: 130,
    cell: ({ row }) => timeAgo(row.original.last_activity_at),
  },
];

interface UsersTableProps {
  items: AdminUserListItem[];
}

export default function UsersTable({ items }: UsersTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useTable({
    columns,
    data: items,
    enableSorting: true,
    getRowId: (item) => String(item.id),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (items.length === 0) {
    return <AdminEmptyState text="Никого не найдено" />;
  }

  return (
    <div className="overflow-x-auto">
      <Table table={table} onRowClick={(row) => navigate(`/admin/users/${row.original.id}`)} rowClassName="cursor-pointer" />
    </div>
  );
}

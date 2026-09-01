import { useQuery } from '@tanstack/react-query';
import { Table, useTable } from '@gravity-ui/table';
import type { ColumnDef, SortingState } from '@gravity-ui/table/tanstack';
import { Label, Pagination, SegmentedRadioGroup, Text, TextInput } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { listSubscriptions } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { formatDate, formatTraffic } from '../../lib/format';
import type { AdminSubscriptionListItem, SubscriptionStatus } from '../../types';

const STATUS_OPTIONS: { value: SubscriptionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активна' },
  { value: 'expired', label: 'Истекла' },
  { value: 'disabled', label: 'Отключена' },
];

const STATUS_THEME: Record<SubscriptionStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  expired: 'danger',
  disabled: 'warning',
};

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Активна',
  expired: 'Истекла',
  disabled: 'Отключена',
};

function userLabel(s: AdminSubscriptionListItem): string {
  return s.full_name || (s.username ? `@${s.username}` : `id${s.telegram_id}`);
}

const SEARCH_DEBOUNCE_MS = 400;

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(queryInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [queryInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'subscriptions', query, status, page],
    queryFn: () => listSubscriptions({ query: query || undefined, status: status === 'all' ? undefined : status, page }),
  });

  const columns: ColumnDef<AdminSubscriptionListItem>[] = [
    {
      id: 'user',
      accessorFn: userLabel,
      header: 'Пользователь',
      size: 200,
      cell: ({ row }) => (
        <Text variant="body-1" ellipsis>
          {row.original.is_trial && '🎁 '}
          {userLabel(row.original)}
        </Text>
      ),
    },
    {
      accessorKey: 'tariff_name',
      header: 'Тариф',
      size: 130,
      cell: ({ row }) => <Text variant="body-1">{row.original.tariff_name}</Text>,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      size: 120,
      cell: ({ row }) => <Label theme={STATUS_THEME[row.original.status]}>{STATUS_LABEL[row.original.status]}</Label>,
    },
    {
      id: 'traffic',
      accessorFn: (s) => s.traffic_used_gb,
      header: 'Трафик',
      size: 150,
      cell: ({ row }) => (
        <Text variant="caption-2" color="secondary">
          {formatTraffic(row.original.traffic_used_gb, row.original.traffic_limit_gb)}
        </Text>
      ),
    },
    {
      accessorKey: 'autopay_enabled',
      header: 'Автоплатёж',
      size: 110,
      cell: ({ row }) => (
        <Text variant="caption-2" color={row.original.autopay_enabled ? 'positive' : 'secondary'}>
          {row.original.autopay_enabled ? 'Вкл' : 'Выкл'}
        </Text>
      ),
    },
    {
      accessorKey: 'end_date',
      header: 'До',
      size: 140,
      cell: ({ row }) => (
        <Text variant="caption-2" color="secondary">
          {formatDate(row.original.end_date)}
        </Text>
      ),
    },
  ];

  const table = useTable({
    columns,
    data: data?.items ?? [],
    enableSorting: true,
    getRowId: (item) => String(item.user_id),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="flex flex-col gap-4">
      <Text variant="header-1">Подписки</Text>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <TextInput
            value={queryInput}
            onUpdate={(value) => {
              setQueryInput(value);
              setPage(1);
            }}
            placeholder="Поиск по username или telegram_id"
          />
        </div>
        <SegmentedRadioGroup
          value={status}
          onUpdate={(value) => {
            setStatus(value as SubscriptionStatus | 'all');
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <SegmentedRadioGroup.Option key={opt.value} value={opt.value}>
              {opt.label}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </div>

      {isLoading ? (
        <Text variant="body-1" color="secondary">
          Загрузка…
        </Text>
      ) : isError || !data ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <Text variant="body-1" color="secondary">
          Ничего не найдено
        </Text>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table
              table={table}
              onRowClick={(row) => navigate(`/admin/users/${row.original.user_id}`)}
              rowClassName="cursor-pointer"
            />
          </div>
          {data.total_pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={page}
                pageSize={Math.ceil(data.total / data.total_pages)}
                total={data.total}
                onUpdate={(nextPage) => setPage(nextPage)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

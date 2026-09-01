import { useQuery } from '@tanstack/react-query';
import { Check, Xmark } from '@gravity-ui/icons';
import { Table, useTable } from '@gravity-ui/table';
import type { ColumnDef, SortingState } from '@gravity-ui/table/tanstack';
import { Button, Icon, Label, Pagination, SegmentedRadioGroup, Select, Text, TextInput } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';
import { getPlategaReconcile, listTransactions } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import AdminTransactionDetailDialog from '../../components/admin/AdminTransactionDetailDialog';
import { formatDate, formatRub } from '../../lib/format';
import { isIncomeTransaction, transactionLabel, transactionStatusLabel } from '../../lib/transactions';
import type { AdminTransactionListItem, TransactionStatus, TransactionType } from '../../types';

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'subscription_payment', label: 'Оплата подписки' },
  { value: 'gift', label: 'Подарок другу' },
  { value: 'topup', label: 'Пополнение баланса' },
  { value: 'referral_reward', label: 'Реферальный бонус' },
  { value: 'refund', label: 'Возврат' },
];

const STATUS_OPTIONS: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'completed', label: 'Завершено' },
  { value: 'pending', label: 'В обработке' },
  { value: 'failed', label: 'Не удалось' },
];

function userLabel(t: AdminTransactionListItem): string {
  return t.full_name || (t.username ? `@${t.username}` : `id${t.telegram_id}`);
}

const SEARCH_DEBOUNCE_MS = 400;

export default function AdminTransactions() {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TransactionType[]>([]);
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(queryInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [queryInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'transactions', query, type[0], status, page],
    queryFn: () =>
      listTransactions({
        query: query || undefined,
        type: type[0],
        status: status === 'all' ? undefined : status,
        page,
      }),
  });

  // Сверка с Platega — по требованию (кнопка), не на каждую загрузку страницы:
  // это реальный запрос к боевому платёжному провайдеру (см. диалог
  // 2026-09-01), не хочется дёргать его при каждой пагинации/фильтре.
  const {
    data: reconcile,
    isFetching: isReconciling,
    refetch: runReconcile,
  } = useQuery({
    queryKey: ['admin', 'transactions', 'platega-reconcile'],
    queryFn: () => getPlategaReconcile(7),
    enabled: false,
  });

  const columns: ColumnDef<AdminTransactionListItem>[] = [
    {
      id: 'user',
      accessorFn: userLabel,
      header: 'Пользователь',
      size: 200,
      cell: ({ row }) => <Text variant="body-1" ellipsis>{userLabel(row.original)}</Text>,
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      size: 160,
      cell: ({ row }) => <Text variant="body-1">{transactionLabel(row.original.type)}</Text>,
    },
    {
      accessorKey: 'amount_kopeks',
      header: 'Сумма',
      size: 120,
      cell: ({ row }) => {
        const income = isIncomeTransaction(row.original.type);
        return (
          <Text variant="body-1" color={income ? 'positive' : 'primary'} className="font-semibold">
            {income ? '+' : '−'}
            {formatRub(row.original.amount_kopeks)}
          </Text>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      size: 130,
      cell: ({ row }) => {
        const { status: txStatus } = row.original;
        if (txStatus === 'completed') return null;
        return <Label theme={txStatus === 'failed' ? 'danger' : 'warning'}>{transactionStatusLabel(txStatus)}</Label>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Дата',
      size: 140,
      cell: ({ row }) => <Text variant="caption-2" color="secondary">{formatDate(row.original.created_at)}</Text>,
    },
    {
      id: 'platega',
      header: 'Platega',
      size: 130,
      // Сверяются только строки с provider='platega' — у остальных (топап
      // админом, реферальный бонус) нет записи external_id в пространстве
      // Platega, сверять там нечего (см. AdminTransactionListItem).
      cell: ({ row }) => {
        const { payment_provider, payment_external_id } = row.original;
        if (payment_provider !== 'platega' || !payment_external_id) {
          return (
            <Text variant="caption-2" color="secondary">
              —
            </Text>
          );
        }
        if (!reconcile) return null;
        const plategaStatus = reconcile[payment_external_id];
        return plategaStatus ? (
          <div className="flex items-center gap-1">
            <Icon data={Check} size={14} className="text-[var(--g-color-text-positive)]" />
            <Text variant="caption-2" color="secondary">
              {plategaStatus}
            </Text>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Icon data={Xmark} size={14} className="text-[var(--g-color-text-danger)]" />
            <Text variant="caption-2" color="danger">
              Нет у Platega
            </Text>
          </div>
        );
      },
    },
  ];

  const table = useTable({
    columns,
    data: data?.items ?? [],
    enableSorting: true,
    getRowId: (item) => String(item.id),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="flex flex-col gap-4">
      <Text variant="header-1">Транзакции</Text>

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
        <div className="w-56">
          <Select
            placeholder="Все типы"
            value={type}
            onUpdate={(values) => {
              setType(values as TransactionType[]);
              setPage(1);
            }}
            hasClear
            width="max"
          >
            {TYPE_OPTIONS.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <SegmentedRadioGroup
          value={status}
          onUpdate={(value) => {
            setStatus(value as TransactionStatus | 'all');
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <SegmentedRadioGroup.Option key={opt.value} value={opt.value}>
              {opt.label}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
        <Button view="outlined" size="m" loading={isReconciling} onClick={() => runReconcile()} className="ml-auto">
          Сверить с Platega (7 дн)
        </Button>
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
            <Table table={table} onRowClick={(row) => setSelectedId(row.original.id)} rowClassName="cursor-pointer" />
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

      <AdminTransactionDetailDialog transactionId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

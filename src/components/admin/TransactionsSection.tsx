import { useQuery } from '@tanstack/react-query';
import { Card, Pagination, Text } from '@gravity-ui/uikit';
import { useState } from 'react';
import { getUserTransactions } from '../../api/admin';
import { formatDate, formatRub } from '../../lib/format';
import { isIncomeTransaction, transactionLabel, transactionStatusLabel } from '../../lib/transactions';
import AdminEmptyState, { AdminErrorState } from './AdminEmptyState';
import AdminTransactionDetailDialog from './AdminTransactionDetailDialog';

interface TransactionsSectionProps {
  userId: number;
}

export default function TransactionsSection({ userId }: TransactionsSectionProps) {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'user', userId, 'transactions', page],
    queryFn: () => getUserTransactions(userId, page),
  });

  return (
    <Card view="outlined" className="flex flex-col">
      <Text variant="subheader-1" className="block p-4 pb-2">
        Транзакции
      </Text>
      {isLoading ? (
        <Text variant="body-1" color="secondary" className="block px-4 pb-3">
          Загрузка…
        </Text>
      ) : isError || !data ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <AdminEmptyState text="Транзакций нет" />
      ) : (
        data.items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3 text-left hover:bg-[var(--g-color-base-simple-hover)]"
          >
            <div className="flex flex-col">
              <Text variant="body-1">{transactionLabel(t.type)}</Text>
              <Text variant="caption-2" color="secondary">
                {formatDate(t.created_at)}
                {transactionStatusLabel(t.status) ? ` · ${transactionStatusLabel(t.status)}` : ''}
              </Text>
            </div>
            <Text variant="body-1" color={isIncomeTransaction(t.type) ? 'positive' : 'primary'} className="font-semibold">
              {isIncomeTransaction(t.type) ? '+' : '−'}
              {formatRub(t.amount_kopeks)}
            </Text>
          </button>
        ))
      )}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center py-3">
          <Pagination
            page={page}
            pageSize={Math.ceil(data.total / data.total_pages)}
            total={data.total}
            onUpdate={(nextPage) => setPage(nextPage)}
          />
        </div>
      )}

      <AdminTransactionDetailDialog transactionId={selectedId} onClose={() => setSelectedId(null)} />
    </Card>
  );
}

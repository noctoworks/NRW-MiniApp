import { useQuery } from '@tanstack/react-query';
import { Card, Pagination, Text } from '@gravity-ui/uikit';
import { useState } from 'react';
import { getUserTransactions } from '../../api/admin';
import { formatDate, formatRub } from '../../lib/format';
import AdminEmptyState, { AdminErrorState } from './AdminEmptyState';

interface TransactionsSectionProps {
  userId: number;
}

export default function TransactionsSection({ userId }: TransactionsSectionProps) {
  const [page, setPage] = useState(1);
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
          <div key={t.id} className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-3">
            <div className="flex flex-col">
              <Text variant="body-1">{t.type}</Text>
              <Text variant="caption-2" color="secondary">
                {formatDate(t.created_at)} · {t.status}
              </Text>
            </div>
            <Text variant="body-1" className="font-semibold">
              {formatRub(t.amount_kopeks)}
            </Text>
          </div>
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
    </Card>
  );
}

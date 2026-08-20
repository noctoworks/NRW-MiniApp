import { useQuery } from '@tanstack/react-query';
import { Caption, Cell, Pagination, Section } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { getUserTransactions } from '../../api/admin';
import { formatDate, formatRub } from '../../lib/format';
import AdminEmptyState from './AdminEmptyState';

interface TransactionsSectionProps {
  userId: number;
}

export default function TransactionsSection({ userId }: TransactionsSectionProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId, 'transactions', page],
    queryFn: () => getUserTransactions(userId, page),
  });

  return (
    <Section header="Транзакции">
      {isLoading || !data ? (
        <Cell className="text-muted">Загрузка…</Cell>
      ) : data.items.length === 0 ? (
        <AdminEmptyState text="Транзакций нет" />
      ) : (
        data.items.map((t) => (
          <Cell
            key={t.id}
            subtitle={<Caption className="text-muted">{formatDate(t.created_at)} · {t.status}</Caption>}
            after={<span className="font-semibold">{formatRub(t.amount_kopeks)}</span>}
          >
            {t.type}
          </Cell>
        ))
      )}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center py-3">
          <Pagination count={data.total_pages} page={page} onChange={(_, p) => setPage(p)} />
        </div>
      )}
    </Section>
  );
}

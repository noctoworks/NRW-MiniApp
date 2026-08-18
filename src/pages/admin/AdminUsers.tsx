import { useQuery } from '@tanstack/react-query';
import { Input, Pagination, SegmentedControl, Title } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { listUsers } from '../../api/admin';
import UsersTable from '../../components/admin/UsersTable';
import type { AdminUserFilter } from '../../types';

const FILTERS: { id: AdminUserFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'no_sub', label: 'Без подписки' },
  { id: 'blocked', label: 'Чёрный список' },
  { id: 'blocked_bot', label: 'Заблокировали бота' },
];

export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AdminUserFilter>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', query, filter, page],
    queryFn: () => listUsers({ query: query || undefined, filter, page }),
  });

  return (
    <div className="flex flex-col gap-4">
      <Title level="2" weight="2">
        Пользователи
      </Title>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск по username или telegram_id"
          />
        </div>
        <SegmentedControl>
          {FILTERS.map((f) => (
            <SegmentedControl.Item
              key={f.id}
              selected={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
            >
              {f.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>

      {isLoading || !data ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : (
        <>
          <UsersTable items={data.items} />
          {data.total_pages > 1 && (
            <div className="flex justify-center">
              <Pagination count={data.total_pages} page={page} onChange={(_, p) => setPage(p)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Input, Pagination, SegmentedControl, Title } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import { listUsers } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import UsersTable from '../../components/admin/UsersTable';
import type { AdminUserFilter } from '../../types';

const FILTERS: { id: AdminUserFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'no_sub', label: 'Без подписки' },
  { id: 'blocked', label: 'Чёрный список' },
  { id: 'blocked_bot', label: 'Заблокировали бота' },
];

/** Поиск бьёт по бэкенду при каждом изменении query — без дебаунса это
 * запрос на каждое нажатие клавиши (см. диалог/аудит). 400мс — стандартная
 * задержка для search-инпутов, достаточно, чтобы не долбить бэк во время
 * набора, но не ощущается как лаг после того, как перестал печатать. */
const SEARCH_DEBOUNCE_MS = 400;

export default function AdminUsers() {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AdminUserFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(queryInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [queryInput]);

  const { data, isLoading, isError, refetch } = useQuery({
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
            value={queryInput}
            onChange={(e) => {
              setQueryInput(e.target.value);
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

      {isLoading ? (
        <div className="text-sm text-muted">Загрузка…</div>
      ) : isError || !data ? (
        <AdminErrorState onRetry={() => refetch()} />
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

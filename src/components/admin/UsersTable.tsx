import { Avatar, Badge, Caption, Cell, List } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router';
import type { AdminUserListItem } from '../../types';

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

interface UsersTableProps {
  items: AdminUserListItem[];
}

export default function UsersTable({ items }: UsersTableProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return <div className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted">Никого не найдено</div>;
  }

  return (
    <List className="overflow-hidden rounded-2xl bg-surface">
      {items.map((user) => {
        const label = user.username ? `@${user.username}` : `id${user.telegram_id}`;
        return (
          <Cell
            key={user.id}
            onClick={() => navigate(`/admin/users/${user.id}`)}
            before={<Avatar size={40} acronym={label.replace('@', '').charAt(0).toUpperCase()} />}
            subtitle={<Caption className="text-muted">{user.telegram_id} · {timeAgo(user.last_activity_at)}</Caption>}
            after={
              user.is_blocked ? (
                <Badge type="dot" mode="critical" />
              ) : user.has_active_subscription ? (
                <Badge type="dot" mode="primary" />
              ) : undefined
            }
          >
            {label}
          </Cell>
        );
      })}
    </List>
  );
}

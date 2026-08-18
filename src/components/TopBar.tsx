import { useQuery } from '@tanstack/react-query';
import { Avatar, IconButton } from '@telegram-apps/telegram-ui';
import { Link } from 'react-router';
import { getDashboard } from '../api/cabinet';
import { useAuthStore } from '../store/auth';

export default function TopBar() {
  const telegramUser = useAuthStore((s) => s.telegramUser);
  const name = [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ') || 'Пользователь';
  const initial = name.charAt(0).toUpperCase();

  // Тот же queryKey, что у Dashboard/AdminGuard — не создаёт лишних запросов.
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <IconButton mode="gray" size="m">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </IconButton>

      <div className="flex items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-4">
        <Avatar size={24} src={telegramUser?.photo_url} acronym={telegramUser?.photo_url ? undefined : initial} />
        <span className="text-sm font-medium">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        {data?.is_admin && (
          <Link to="/admin">
            <IconButton mode="gray" size="m" aria-label="Админка">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 17V9M13 17V5M8 17v-5" />
              </svg>
            </IconButton>
          </Link>
        )}
        <IconButton mode="gray" size="m">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

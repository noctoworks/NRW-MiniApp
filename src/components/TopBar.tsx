import { useQuery } from '@tanstack/react-query';
import { Bell, HelpCircle } from 'lucide-react';
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
      <button
        type="button"
        aria-label="Помощь"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]"
      >
        <HelpCircle size={18} strokeWidth={2} />
      </button>

      <div className="user-pill">
        {telegramUser?.photo_url ? (
          <img src={telegramUser.photo_url} alt="" className="user-pill-avatar" />
        ) : (
          <span className="user-pill-avatar flex items-center justify-center bg-[hsl(var(--primary))] text-xs font-semibold">
            {initial}
          </span>
        )}
        <span className="text-sm font-medium">{name}</span>
      </div>

      <div className="flex items-center gap-2">
        {data?.is_admin && (
          <Link
            to="/admin"
            aria-label="Админка"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 17V9M13 17V5M8 17v-5" />
            </svg>
          </Link>
        )}
        <button
          type="button"
          aria-label="Уведомления"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]"
        >
          <Bell size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

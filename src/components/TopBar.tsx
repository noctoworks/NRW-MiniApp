import { useQuery } from '@tanstack/react-query';
import { HelpCircle, Settings, Users } from 'lucide-react';
import { Link } from 'react-router';
import { getDashboard } from '../api/cabinet';
import { hapticImpact } from '../lib/haptics';
import { useAuthStore } from '../store/auth';

export default function TopBar() {
  const telegramUser = useAuthStore((s) => s.telegramUser);
  const name = [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ') || 'Пользователь';
  const initial = name.charAt(0).toUpperCase();

  // Тот же queryKey, что у Dashboard/AdminGuard — не создаёт лишних запросов.
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center px-4"
      // --tg-total-safe-top (globals.css) — официальный механизм Telegram
      // (Bot API 8.0+, safeAreaInset + contentSafeAreaInset) вместо
      // подобранных вручную констант: сам реагирует на fullscreen/обычный
      // режим и на смену устройства, без хардкода на нашей стороне.
      style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
    >
      <Link
        to="/about"
        onClick={() => hapticImpact('light')}
        aria-label="О сервисе"
        className="icon-button justify-self-start"
      >
        <HelpCircle size={18} strokeWidth={2} />
      </Link>

      <Link to="/profile" onClick={() => hapticImpact('light')} className="user-pill justify-self-center">
        {telegramUser?.photo_url ? (
          <img src={telegramUser.photo_url} alt="" className="user-pill-avatar" />
        ) : (
          <span className="user-pill-avatar flex items-center justify-center bg-[hsl(var(--primary))] text-xs font-semibold">
            {initial}
          </span>
        )}
        <span className="text-sm font-medium">{name}</span>
      </Link>

      <div id="tour-topbar-icons" className="flex items-center gap-2 justify-self-end">
        {data?.is_admin && (
          <Link
            to="/admin"
            aria-label="Админка"
            className="icon-button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 17V9M13 17V5M8 17v-5" />
            </svg>
          </Link>
        )}
        <Link
          to="/referral"
          onClick={() => hapticImpact('light')}
          aria-label="Пригласить друзей"
          className="icon-button"
        >
          <Users size={18} strokeWidth={2} />
        </Link>
        <Link
          to="/settings"
          onClick={() => hapticImpact('light')}
          aria-label="Настройки"
          className="icon-button"
        >
          <Settings size={18} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

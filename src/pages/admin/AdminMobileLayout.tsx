import { useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import { hapticSelection } from '../../lib/haptics';

// Тот же список разделов, что у десктопного сайдбара (AdminDesktopLayout) —
// раньше на мобильном была только сводка KPI без доступа к остальным разделам
// (пользователи, промогруппы и т.д. были физически недостижимы — см. диалог).
const NAV_ITEMS = [
  { to: '/admin', label: 'Дашборд', end: true },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/admin/promo-groups', label: 'Промогруппы' },
  { to: '/admin/campaigns', label: 'Кампании' },
  { to: '/admin/ltv', label: 'LTV' },
  { to: '/admin/growth', label: 'MRR' },
  { to: '/admin/referrals', label: 'Рефералы' },
];

/** Мобильный аналог AdminDesktopLayout: та же система разделов через <Outlet/>,
 * только вместо бокового сайдбара — горизонтальная прокручиваемая полоса вкладок
 * (тот же паттерн, что и выбор платформы на /connect). "Назад" в основное
 * приложение — только нативная Telegram BackButton (см. useTelegramBackButton),
 * без самодельной кнопки в шапке — она тут была лишней (см. диалог). Переход
 * МЕЖДУ разделами админки/в карточку пользователя обрабатывают сами страницы
 * (см. AdminUserDetail "← К списку"), единая Telegram BackButton не умеет быть
 * контекстно-зависимой по вложенным роутам без отдельного учёта на каждой
 * странице. */
export default function AdminMobileLayout() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  return (
    <div className="page">
      <h1 className="mb-4 text-xl font-bold text-white">Админка</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={hapticSelection}
            className={({ isActive }) =>
              `shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

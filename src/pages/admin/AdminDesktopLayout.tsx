import { List } from '@telegram-apps/telegram-ui';
import { NavLink, Outlet, useNavigate } from 'react-router';

const NAV_ITEMS = [
  { to: '/admin', label: 'Дашборд', end: true },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/admin/promo-groups', label: 'Промогруппы' },
  { to: '/admin/campaigns', label: 'Кампании' },
  { to: '/admin/ltv', label: 'LTV и когорты' },
  { to: '/admin/growth', label: 'MRR и churn' },
  { to: '/admin/referrals', label: 'Рефералы' },
];

export default function AdminDesktopLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-surface px-3 py-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-4 px-3 text-left text-xs text-muted hover:text-white"
        >
          ← В приложение
        </button>
        <List>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors ${
                  isActive ? 'bg-accent text-accent-text' : 'text-muted hover:bg-surface-2 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </List>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

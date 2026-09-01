import { Tab, TabList, TabProvider, Text } from '@gravity-ui/uikit';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AdminGravityTheme from '../../components/admin/AdminGravityTheme';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import { hapticSelection } from '../../lib/haptics';

// Тот же список разделов, что у десктопного сайдбара (AdminDesktopLayout) —
// раньше на мобильном была только сводка KPI без доступа к остальным разделам
// (пользователи, промогруппы и т.д. были физически недостижимы — см. диалог).
const NAV_ITEMS = [
  { id: 'overview', to: '/admin', label: 'Дашборд', end: true },
  { id: 'users', to: '/admin/users', label: 'Пользователи', end: false },
  { id: 'promo-groups', to: '/admin/promo-groups', label: 'Промогруппы', end: false },
  { id: 'campaigns', to: '/admin/campaigns', label: 'Кампании', end: false },
  { id: 'ltv', to: '/admin/ltv', label: 'LTV', end: false },
  { id: 'growth', to: '/admin/growth', label: 'MRR', end: false },
  { id: 'referrals', to: '/admin/referrals', label: 'Рефералы', end: false },
  { id: 'support', to: '/admin/support', label: 'Обращения', end: false },
];

/** Мобильный аналог AdminDesktopLayout: та же система разделов через <Outlet/>,
 * только вместо бокового сайдбара — горизонтальная прокручиваемая полоса вкладок
 * (TabList contentOverflow="scroll" — вкладки тут навигация по роутам, а не
 * переключение панелей, поэтому TabPanel не используется, onUpdate просто
 * дёргает navigate()). "Назад" в основное приложение — только нативная
 * Telegram BackButton (см. useTelegramBackButton), без самодельной кнопки в
 * шапке — она тут была лишней (см. диалог). Переход МЕЖДУ разделами
 * админки/в карточку пользователя обрабатывают сами страницы (см.
 * AdminUserDetail "← К списку"), единая Telegram BackButton не умеет быть
 * контекстно-зависимой по вложенным роутам без отдельного учёта на каждой
 * странице. */
export default function AdminMobileLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useTelegramBackButton(() => navigate('/'));

  const activeItem = NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  return (
    <AdminGravityTheme>
      <div className="page">
        <Text variant="header-1" className="mb-4 block">
          Админка
        </Text>

        <TabProvider
          value={activeItem?.id}
          onUpdate={(id) => {
            hapticSelection();
            const item = NAV_ITEMS.find((i) => i.id === id);
            if (item) navigate(item.to);
          }}
        >
          <TabList contentOverflow="scroll" className="mb-4">
            {NAV_ITEMS.map((item) => (
              <Tab key={item.id} value={item.id}>
                {item.label}
              </Tab>
            ))}
          </TabList>
        </TabProvider>

        <Outlet />
      </div>
    </AdminGravityTheme>
  );
}

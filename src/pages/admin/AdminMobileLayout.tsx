import { Tab, TabList, TabProvider, Text } from '@gravity-ui/uikit';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AdminGravityTheme from '../../components/admin/AdminGravityTheme';
import { ADMIN_NAV_ITEMS } from '../../lib/adminNav';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import { hapticSelection } from '../../lib/haptics';

/** Мобильный аналог AdminDesktopLayout: та же система разделов через <Outlet/>,
 * только вместо бокового сайдбара с группами — горизонтальная прокручиваемая
 * полоса вкладок (TabList contentOverflow="scroll") БЕЗ группировки —
 * узкий экран не тянет заголовки групп поверх вкладок, полный список
 * ADMIN_NAV_ITEMS плоско, порядок как в группах десктопа. "Назад" в основное
 * приложение — только нативная Telegram BackButton (см. useTelegramBackButton),
 * без самодельной кнопки в шапке — она тут была лишней (см. диалог). Переход
 * МЕЖДУ разделами админки/в карточку пользователя обрабатывают сами страницы
 * (см. AdminUserDetail "К списку"), единая Telegram BackButton не умеет быть
 * контекстно-зависимой по вложенным роутам без отдельного учёта на каждой
 * странице. */
export default function AdminMobileLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useTelegramBackButton(() => navigate('/'));

  const activeItem = ADMIN_NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  return (
    <AdminGravityTheme>
      <div className="min-h-screen px-4 pb-8" style={{ paddingTop: 'calc(1.5rem + var(--tg-total-safe-top, 0px))' }}>
        <Text variant="header-1" className="mb-4 block">
          Админка
        </Text>

        <TabProvider
          value={activeItem?.id}
          onUpdate={(id) => {
            hapticSelection();
            const item = ADMIN_NAV_ITEMS.find((i) => i.id === id);
            if (item) navigate(item.to);
          }}
        >
          <TabList contentOverflow="scroll" className="mb-4">
            {ADMIN_NAV_ITEMS.map((item) => (
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

import {
  ArrowShapeTurnUpLeft,
  ChartColumn,
  ChartLineArrowUp,
  Comments,
  Flag,
  House,
  Link as LinkIcon,
  Persons,
  Tags,
} from '@gravity-ui/icons';
import { AsideHeader } from '@gravity-ui/navigation';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AdminGravityTheme from '../../components/admin/AdminGravityTheme';

const NAV_ITEMS = [
  { id: 'overview', to: '/admin', label: 'Дашборд', end: true, icon: House },
  { id: 'users', to: '/admin/users', label: 'Пользователи', end: false, icon: Persons },
  { id: 'promo-groups', to: '/admin/promo-groups', label: 'Промогруппы', end: false, icon: Tags },
  { id: 'campaigns', to: '/admin/campaigns', label: 'Кампании', end: false, icon: Flag },
  { id: 'ltv', to: '/admin/ltv', label: 'LTV и когорты', end: false, icon: ChartColumn },
  { id: 'growth', to: '/admin/growth', label: 'MRR и churn', end: false, icon: ChartLineArrowUp },
  { id: 'referrals', to: '/admin/referrals', label: 'Рефералы', end: false, icon: LinkIcon },
  { id: 'support', to: '/admin/support', label: 'Обращения', end: false, icon: Comments },
];

export default function AdminDesktopLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // AsideHeader — контролируемый компонент (см. диалог 2026-09-01, доки
  // @gravity-ui/navigation): без своего state + onChangeCompact сайдбар
  // "замерзает" в развёрнутом виде, сворачивание кнопкой перестаёт работать.
  const [compact, setCompact] = useState(false);

  return (
    <AdminGravityTheme>
      <AsideHeader
        compact={compact}
        onChangeCompact={setCompact}
        logo={{ text: 'NRW Admin' }}
        subheaderItems={[
          {
            id: 'back-to-app',
            title: 'В приложение',
            icon: ArrowShapeTurnUpLeft,
            onItemClick: () => navigate('/'),
          },
        ]}
        menuItems={NAV_ITEMS.map((item) => ({
          id: item.id,
          title: item.label,
          icon: item.icon,
          current: item.end ? pathname === item.to : pathname.startsWith(item.to),
          onItemClick: () => navigate(item.to),
        }))}
        renderContent={() => (
          <main className="min-h-screen overflow-y-auto px-8 py-6">
            <Outlet />
          </main>
        )}
      />
    </AdminGravityTheme>
  );
}

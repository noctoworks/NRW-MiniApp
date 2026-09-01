import { ArrowShapeTurnUpLeft } from '@gravity-ui/icons';
import { AsideHeader } from '@gravity-ui/navigation';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import AdminGravityTheme from '../../components/admin/AdminGravityTheme';
import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS } from '../../lib/adminNav';

export default function AdminDesktopLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // AsideHeader — контролируемый компонент (см. диалог 2026-09-01, доки
  // @gravity-ui/navigation): без своего state + onChangeCompact сайдбар
  // "замерзает" в развёрнутом виде, сворачивание кнопкой перестаёт работать.
  const [compact, setCompact] = useState(false);
  // Сворачивание отдельных групп (Продукт/Инфра/Финансы/Система) — по докам
  // @gravity-ui/navigation, инлайн collapsedMenuGroupIds/onToggleMenuGroupCollapsed
  // работают ТОЛЬКО при menuOverflow="scroll" (диалог 2026-09-01: "хочется
  // раскрывать и скрывать"). Все группы развёрнуты по умолчанию (пустой объект).
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Record<string, boolean>>({});

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
        menuGroups={ADMIN_NAV_GROUPS}
        menuOverflow="scroll"
        collapsedMenuGroupIds={collapsedGroupIds}
        onToggleMenuGroupCollapsed={(groupId) =>
          setCollapsedGroupIds((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
        }
        menuItems={ADMIN_NAV_ITEMS.map((item) => ({
          id: item.id,
          title: item.label,
          icon: item.icon,
          groupId: item.groupId,
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

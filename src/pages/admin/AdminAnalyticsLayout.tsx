import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { Outlet, useLocation, useNavigate } from 'react-router';

const TABS = [
  { id: 'dynamics', to: '/admin/analytics', label: 'Динамика' },
  { id: 'sales', to: '/admin/analytics/sales', label: 'Продажи' },
  { id: 'ltv', to: '/admin/analytics/ltv', label: 'LTV и когорты' },
  { id: 'referrals', to: '/admin/analytics/referrals', label: 'Рефералы' },
];

/** Раньше Доход/Продажи/LTV/Рефералы были отдельными пунктами меню (диалог
 * 2026-09-01: "аналитику объединим в один раздел") — общий заголовок + вкладки
 * вместо четырёх строк в сайдбаре. Вкладка синхронизирована с URL (не local
 * state), чтобы ссылка на конкретный раздел аналитики была валидной. */
export default function AdminAnalyticsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = TABS.find((tab) => tab.to === pathname)?.id ?? 'dynamics';

  return (
    <div className="flex flex-col gap-4">
      <Text variant="header-1">Аналитика</Text>

      <SegmentedRadioGroup
        value={activeTab}
        onUpdate={(value) => {
          const tab = TABS.find((t) => t.id === value);
          if (tab) navigate(tab.to);
        }}
      >
        {TABS.map((tab) => (
          <SegmentedRadioGroup.Option key={tab.id} value={tab.id}>
            {tab.label}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>

      <Outlet />
    </div>
  );
}

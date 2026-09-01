import { useQuery } from '@tanstack/react-query';
import { Card, Text } from '@gravity-ui/uikit';
import { getMonitoring, getOverview, getRecentPayments, getRevenueTimeseries } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import AlertsPanel from '../../components/admin/AlertsPanel';
import GrowthPulseCard from '../../components/admin/GrowthPulseCard';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import NetProfitCard from '../../components/admin/NetProfitCard';
import NodesOverviewTable from '../../components/admin/NodesOverviewTable';
import RevenueChart from '../../components/admin/RevenueChart';
import SubscriptionsPulseCard from '../../components/admin/SubscriptionsPulseCard';
import TopReferrersCard from '../../components/admin/TopReferrersCard';
import { formatRub } from '../../lib/format';
import { useAuthStore } from '../../store/auth';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function getTodayLabel(): string {
  const raw = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function AdminOverview() {
  const telegramUser = useAuthStore((s) => s.telegramUser);

  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getOverview,
  });
  const { data: timeseries } = useQuery({ queryKey: ['admin', 'revenue-timeseries'], queryFn: () => getRevenueTimeseries(30) });
  const { data: recentPayments } = useQuery({ queryKey: ['admin', 'recent-payments'], queryFn: () => getRecentPayments(8) });
  const { data: monitoring } = useQuery({ queryKey: ['admin', 'monitoring'], queryFn: getMonitoring });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !overview) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  // Единственный "прирост в %", который честно считается из уже имеющихся
  // данных (нет истории снэпшотов, чтобы посчитать остальные так же) — см.
  // диалог 2026-09-01. У Users/Active/Online на референс-мокапе были ещё и
  // sparkline-графики — не добавляем: нет daily-истории по ним (только у
  // выручки), рисовать было бы нечестно.
  const usersGrowthPercent =
    overview.total_users > overview.new_users_7d
      ? Math.round((overview.new_users_7d / (overview.total_users - overview.new_users_7d)) * 1000) / 10
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Text variant="header-1">
          {getGreeting()}
          {telegramUser?.first_name ? `, ${telegramUser.first_name}` : ''}
        </Text>
        <Text variant="body-2" color="secondary">
          {getTodayLabel()}
        </Text>
      </div>

      <AlertsPanel />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Пользователи"
          value={String(overview.total_users)}
          hint={usersGrowthPercent > 0 ? `+${usersGrowthPercent}% за 7 дн` : undefined}
        />
        <KpiTile
          label="Активные подписки"
          value={String(overview.active_subscriptions)}
          hint={`${overview.paying_subscriptions} платящих`}
        />
        <KpiTile label="Онлайн сейчас" value={monitoring ? String(monitoring.panel.users_online_now) : '—'} accent />
        <KpiTile
          label="Доход сегодня"
          value={formatRub(overview.revenue_today_kopeks)}
          hint={`7 дн: ${formatRub(overview.revenue_7d_kopeks)}`}
        />
      </div>

      <GrowthPulseCard />

      <NetProfitCard />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">{timeseries && <RevenueChart data={timeseries} />}</div>
        <SubscriptionsPulseCard />
      </div>

      <NodesOverviewTable />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card view="outlined" className="flex flex-col">
          <Text variant="subheader-1" className="block p-4 pb-2">
            Последние платежи
          </Text>
          {!recentPayments || recentPayments.length === 0 ? (
            <Text variant="body-2" color="secondary" className="block px-4 pb-4">
              Платежей пока нет
            </Text>
          ) : (
            recentPayments.map((payment, i) => {
              const label =
                payment.full_name || (payment.username ? `@${payment.username}` : `id${payment.telegram_id}`);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 border-t border-[var(--g-color-line-generic)] px-4 py-2.5 first:border-t-0"
                >
                  <Text variant="body-2" ellipsis>
                    {label}
                  </Text>
                  <Text variant="body-2" color="positive" className="shrink-0 font-semibold">
                    +{formatRub(payment.amount_kopeks)}
                  </Text>
                </div>
              );
            })
          )}
        </Card>

        <TopReferrersCard />
      </div>
    </div>
  );
}

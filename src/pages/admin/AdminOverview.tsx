import { useQuery } from '@tanstack/react-query';
import { Server } from '@gravity-ui/icons';
import { Button, Card, Icon, Text } from '@gravity-ui/uikit';
import { useNavigate } from 'react-router';
import { getOverview, getRecentPayments, getRevenueTimeseries } from '../../api/admin';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import KpiTile from '../../components/admin/KpiTile';
import Loader from '../../components/Loader';
import RevenueChart from '../../components/admin/RevenueChart';
import { formatRub, formatTrafficGb } from '../../lib/format';
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
  const navigate = useNavigate();
  const telegramUser = useAuthStore((s) => s.telegramUser);

  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getOverview,
  });
  const { data: timeseries } = useQuery({ queryKey: ['admin', 'revenue-timeseries'], queryFn: () => getRevenueTimeseries(30) });
  const { data: recentPayments } = useQuery({ queryKey: ['admin', 'recent-payments'], queryFn: () => getRecentPayments(8) });

  if (isLoading) {
    return <Loader inline />;
  }

  if (isError || !overview) {
    return <AdminErrorState onRetry={() => refetch()} />;
  }

  // Единственный "прирост в %", который честно считается из уже имеющихся
  // данных (нет истории снэпшотов, чтобы посчитать остальные так же) — см.
  // диалог 2026-09-01. Остальные плитки показывают реальную вторую цифру
  // (сумму/счётчик), а не выдуманный процент.
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Пользователи"
          value={String(overview.total_users)}
          hint={usersGrowthPercent > 0 ? `+${usersGrowthPercent}% за 7 дн` : undefined}
        />
        <KpiTile
          label="Активные"
          value={String(overview.active_subscriptions)}
          hint={`${overview.paying_subscriptions} платящих`}
        />
        <KpiTile
          label="Выручка (30 дн)"
          value={formatRub(overview.revenue_30d_kopeks)}
          hint={`${formatRub(overview.revenue_today_kopeks)} сегодня`}
          accent
        />
        <KpiTile label="Трафик" value={formatTrafficGb(overview.total_traffic_gb)} />
      </div>

      {timeseries && <RevenueChart data={timeseries} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card view="outlined" className="flex flex-col">
          <div className="flex items-center justify-between p-4 pb-2">
            <Text variant="subheader-1">Ноды</Text>
            <Button view="flat" size="s" onClick={() => navigate('/admin/nodes')}>
              Все ноды
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 px-4 pb-6 pt-2 text-center">
            <Icon data={Server} size={24} className="opacity-50" />
            <Text variant="body-2" color="secondary">
              Статус нод скоро появится здесь
            </Text>
          </div>
        </Card>

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
      </div>

      {/* Дальше — расширенная разбивка (было на старом "Дашборде") для тех,
          кому нужны детали за пределами головных плиток выше. */}
      <Card view="filled" className="p-4">
        <Text variant="caption-2" color="secondary" className="block">
          Доход за сегодня
        </Text>
        <Text variant="display-1">{formatRub(overview.revenue_today_kopeks)}</Text>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--g-color-line-generic)] pt-3">
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              За 7 дн
            </Text>
            <Text variant="body-2" className="font-semibold">
              {formatRub(overview.revenue_7d_kopeks)}
            </Text>
          </div>
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              За 30 дн
            </Text>
            <Text variant="body-2" className="font-semibold">
              {formatRub(overview.revenue_30d_kopeks)}
            </Text>
          </div>
          <div>
            <Text variant="caption-2" color="secondary" className="block">
              Всего
            </Text>
            <Text variant="body-2" color="brand" className="font-semibold">
              {formatRub(overview.revenue_all_time_kopeks)}
            </Text>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Платящих подписок"
          value={String(overview.paying_subscriptions)}
          hint={overview.new_paying_subscriptions_today > 0 ? `+${overview.new_paying_subscriptions_today} сегодня` : undefined}
        />
        <KpiTile label="Новые за 7 дн" value={String(overview.new_users_7d)} />
        <KpiTile label="Конверсия в оплату" value={`${overview.conversion_percent}%`} />
        <KpiTile label="Средний чек" value={formatRub(overview.avg_check_kopeks)} />
        <KpiTile label="Churn за 30 дн" value={`${overview.churn_percent_30d}%`} />
      </div>
    </div>
  );
}

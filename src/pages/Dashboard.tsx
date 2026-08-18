import { useQuery } from '@tanstack/react-query';
import { Button, Caption, Cell } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getDashboard } from '../api/cabinet';
import AppSelect from '../components/AppSelect';
import IpCard from '../components/IpCard';
import PowerButton from '../components/PowerButton';
import SubscriptionLink from '../components/SubscriptionLink';
import TopBar from '../components/TopBar';
import { buildDeepLink, VPN_APPS } from '../lib/deeplink';
import { formatDate, formatTraffic } from '../lib/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(VPN_APPS[0]);
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  const subscription = data?.subscription ?? null;
  const isActive = subscription?.status === 'active';

  const handleConnect = () => {
    if (!subscription?.subscription_url) return;
    const link = buildDeepLink(selectedApp, subscription.subscription_url);
    if (link) {
      // Кастомная схема (happ://) — Telegram.WebApp.openLink() поддерживает
      // только http(s), поэтому триггерим её обычной навигацией, как и
      // обычный мобильный браузер (тот же способ, что уже проверен в боте).
      window.location.href = link;
    } else {
      window.alert(`Автоподключение для ${selectedApp.name} пока недоступно — скопируйте ссылку вручную.`);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen pb-8">
      <TopBar />
      <PowerButton connected={isActive} onClick={handleConnect} />

      <div className="flex flex-col gap-3 px-4">
        <div className="flex gap-3">
          <IpCard />
          <AppSelect selected={selectedApp} onSelect={setSelectedApp} />
        </div>

        {subscription?.subscription_url && <SubscriptionLink url={subscription.subscription_url} />}

        {subscription ? (
          <Cell
            className="rounded-2xl bg-surface"
            subtitle={<Caption>{formatTraffic(subscription.traffic_used_gb, subscription.traffic_limit_gb)}</Caption>}
            after={
              <div className="text-right">
                <Caption className="block text-muted">до {formatDate(subscription.end_date)}</Caption>
                <span className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-white/50'}`}>
                  {isActive ? 'Подписка активна' : 'Подписка истекла'}
                </span>
              </div>
            }
          >
            Трафик
          </Cell>
        ) : (
          <Cell className="rounded-2xl bg-surface text-muted">Подписка не оформлена</Cell>
        )}

        <Button
          mode="filled"
          size="l"
          stretched
          disabled={!subscription?.subscription_url}
          onClick={handleConnect}
          before={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-5" />
              <path d="M9 8V2" />
              <path d="M15 8V2" />
              <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
            </svg>
          }
        >
          Подключить VPN
        </Button>

        <Button mode="gray" size="l" stretched onClick={() => navigate('/payment')}>
          Продлить подписку
        </Button>
      </div>
    </div>
  );
}

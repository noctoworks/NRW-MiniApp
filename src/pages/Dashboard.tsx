import { useQuery } from '@tanstack/react-query';
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
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <div>
              <span className="block text-xs text-muted">Трафик</span>
              <span className="text-sm font-semibold">
                {formatTraffic(subscription.traffic_used_gb, subscription.traffic_limit_gb)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-muted">до {formatDate(subscription.end_date)}</span>
              <span className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-white/50'}`}>
                {isActive ? 'Подписка активна' : 'Подписка истекла'}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface px-4 py-3 text-center text-sm text-muted">
            Подписка не оформлена
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          disabled={!subscription?.subscription_url}
          className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-accent-text disabled:opacity-40"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6M12 17v6M4.2 4.2l4.2 4.2M15.5 15.5l4.3 4.3M1 12h6M17 12h6M4.2 19.8l4.2-4.2M15.5 8.5l4.3-4.3" />
          </svg>
          Подключить VPN
        </button>

        <button
          type="button"
          onClick={() => navigate('/payment')}
          className="rounded-2xl bg-surface py-3.5 text-sm font-semibold"
        >
          Продлить подписку
        </button>
      </div>
    </div>
  );
}

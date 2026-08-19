import { useQuery } from '@tanstack/react-query';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getDashboard } from '../api/cabinet';
import AppSelect from '../components/AppSelect';
import IpCard from '../components/IpCard';
import Loader from '../components/Loader';
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

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen pb-8">
      <TopBar />
      <PowerButton connected={isActive} onClick={handleConnect} />

      <div className="animate-fade-in flex flex-col gap-3 px-4">
        <div className="flex gap-3">
          <IpCard />
          <AppSelect selected={selectedApp} onSelect={setSelectedApp} />
        </div>

        <div className="card">
          {subscription?.subscription_url && (
            <div className="mb-3">
              <SubscriptionLink url={subscription.subscription_url} />
            </div>
          )}

          {subscription ? (
            <div className="flex items-center justify-between px-1 text-[15px] leading-6">
              <div>
                <div className="font-semibold">Трафик</div>
                <div className="text-[hsl(var(--subtitle-foreground))]">
                  {formatTraffic(subscription.traffic_used_gb, subscription.traffic_limit_gb)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">до {formatDate(subscription.end_date)}</div>
                <div className={`font-medium ${isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--subtitle-foreground))]'}`}>
                  {isActive ? 'Подписка активна' : 'Подписка истекла'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-[hsl(var(--subtitle-foreground))]">Подписка не оформлена</span>
          )}
        </div>

        <button
          type="button"
          className="btn-primary flex items-center justify-center gap-2"
          disabled={!subscription?.subscription_url}
          onClick={handleConnect}
        >
          <Settings2 size={17} strokeWidth={2} />
          Подключить VPN
        </button>

        <button type="button" className="btn-secondary" onClick={() => navigate('/payment')}>
          Продлить подписку
        </button>
      </div>
    </div>
  );
}

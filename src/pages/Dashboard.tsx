import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Settings2, Smartphone, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getConnectApps, getDashboard, getReferral } from '../api/cabinet';
import AppSelect from '../components/AppSelect';
import IpCard from '../components/IpCard';
import Loader from '../components/Loader';
import PowerButton from '../components/PowerButton';
import SubscriptionLink from '../components/SubscriptionLink';
import TopBar from '../components/TopBar';
import Tour, { type TourStep } from '../components/Tour';
import { formatDate, formatTraffic } from '../lib/format';
import { hapticImpact } from '../lib/haptics';
import { useOnboardingStore } from '../store/onboarding';

const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-power-button',
    title: 'Кнопка подключения',
    description: 'Нажмите, чтобы подключиться к VPN — откроется инструкция для вашего устройства.',
  },
  {
    targetId: 'tour-subscription-card',
    title: 'Ваша подписка',
    description: 'Здесь видно, сколько трафика израсходовано и до какой даты действует подписка.',
  },
  {
    targetId: 'tour-devices-row',
    title: 'Устройства',
    description: 'Список подключённых устройств — можно отключить любое или сбросить все сразу.',
  },
  {
    targetId: 'tour-connect-button',
    title: 'Подключить VPN',
    description: 'Выбор приложения по вашей платформе и готовая ссылка на подписку.',
  },
  {
    targetId: 'tour-renew-button',
    title: 'Продление',
    description: 'Продлите подписку на новый период здесь.',
  },
  {
    targetId: 'tour-referral-banner',
    title: 'Приглашайте друзей',
    description: 'Получайте % с каждой их оплаты — а друг по вашей ссылке получит бонусные дни триала.',
  },
  {
    targetId: 'tour-topbar-icons',
    title: 'Профиль и настройки',
    description: 'Здесь — профиль и баланс, приглашение друзей и настройки приложения.',
  },
];

/** Telegram.WebApp.platform — надёжнее UA-снифинга, доступен во всех клиентах. */
function detectPlatformKey(): string {
  const platform = window.Telegram?.WebApp?.platform;
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  if (platform === 'macos') return 'macos';
  return 'windows';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const subscription = data?.subscription ?? null;
  const isActive = subscription?.status === 'active';

  // Список приложений и их реальные deep-link'и берутся из Subpage Builder
  // панели Remnawave (см. app/cabinet/routes.py::connect_apps) — раньше здесь
  // был захардкожен один VPN-клиент с непроверенной схемой подключения.
  const { data: connectData } = useQuery({
    queryKey: ['connect-apps'],
    queryFn: getConnectApps,
    enabled: Boolean(subscription?.subscription_url),
  });

  // Только процент для баннера ниже — react-query кэширует по тому же ключу,
  // что и страница /referral, так что при переходе туда данные уже тёплые.
  const { data: referral } = useQuery({ queryKey: ['referral'], queryFn: getReferral });

  const platformKey = useMemo(() => detectPlatformKey(), []);
  const platformApps = useMemo(
    () => connectData?.platforms.find((p) => p.key === platformKey)?.apps ?? [],
    [connectData, platformKey],
  );

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAppId || platformApps.length === 0) return;
    setSelectedAppId(platformApps.find((a) => a.featured)?.id ?? platformApps[0].id);
  }, [platformApps, selectedAppId]);

  // PowerButton вибрирует сам (см. components/PowerButton.tsx) — здесь не
  // дублируем, чтобы тап по кругу не давал двойной отклик.
  const handleConnect = () => {
    if (!subscription?.subscription_url) return;
    navigate('/connect', { state: { platform: platformKey, appId: selectedAppId ?? undefined } });
  };

  // Обучалка (см. диалог) — подсветки поверх реальных кнопок, не слайды.
  // Показывается один раз новому пользователю; повторный запуск — из
  // Settings.tsx (сбрасывает hasSeenDashboardTour в сторе и возвращает сюда).
  // Ждём !isLoading, чтобы реальные DOM-элементы (карточка подписки, баннер
  // рефералки) уже существовали к моменту первого замера в Tour.
  const hasSeenTour = useOnboardingStore((s) => s.hasSeenDashboardTour);
  const tourHydrated = useOnboardingStore((s) => s.hydrated);
  const markTourSeen = useOnboardingStore((s) => s.markDashboardTourSeen);
  const [tourActive, setTourActive] = useState(false);
  const replayRequested = Boolean((location.state as { replayTour?: boolean } | null)?.replayTour);

  useEffect(() => {
    if (isLoading) return;
    // Ждём ответ CloudStorage — иначе на секунду мигнёт тур тому, кто уже
    // прошёл его на другом устройстве.
    if (!tourHydrated && !replayRequested) return;
    if (hasSeenTour && !replayRequested) return;
    setTourActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, tourHydrated, hasSeenTour, replayRequested]);

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen pb-8">
      <TopBar />
      <div id="tour-power-button">
        <PowerButton connected={isActive} onClick={handleConnect} />
      </div>

      <div className="animate-fade-in flex flex-col gap-3 px-4">
        <div className="flex gap-3">
          <IpCard />
          {platformApps.length > 0 && (
            <AppSelect options={platformApps} selectedId={selectedAppId} onSelect={setSelectedAppId} />
          )}
        </div>

        <div id="tour-subscription-card" className="card">
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

          {subscription && (
            <button
              id="tour-devices-row"
              type="button"
              onClick={() => {
                hapticImpact('light');
                navigate('/devices');
              }}
              className="mt-3 flex w-full items-center justify-between border-t border-white/5 pt-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-[hsl(var(--subtitle-foreground))]">
                <Smartphone size={16} strokeWidth={2} />
                Устройства · {subscription.device_limit > 0 ? `лимит ${subscription.device_limit}` : 'без лимита'}
              </span>
              <ChevronRight size={16} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
            </button>
          )}
        </div>

        <button
          id="tour-connect-button"
          type="button"
          className="btn-primary flex items-center justify-center gap-2"
          disabled={!subscription?.subscription_url}
          onClick={() => {
            hapticImpact('light');
            handleConnect();
          }}
        >
          <Settings2 size={17} strokeWidth={2} />
          Подключить VPN
        </button>

        <button
          id="tour-renew-button"
          type="button"
          className="btn-secondary"
          onClick={() => {
            hapticImpact('light');
            navigate('/payment');
          }}
        >
          Продлить подписку
        </button>

        {referral && (
          <button
            id="tour-referral-banner"
            type="button"
            className="card flex items-center justify-between !py-3"
            onClick={() => {
              hapticImpact('light');
              navigate('/referral');
            }}
          >
            <span className="flex items-center gap-2 text-sm text-white">
              <Users size={16} strokeWidth={2} className="text-[hsl(var(--primary))]" />
              Пригласи друга — получи {referral.percent}%
            </span>
            <ChevronRight size={16} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
          </button>
        )}
      </div>

      {tourActive && (
        <Tour
          steps={DASHBOARD_TOUR_STEPS}
          onFinish={() => {
            setTourActive(false);
            markTourSeen();
            if (replayRequested) navigate('.', { replace: true, state: {} });
          }}
        />
      )}
    </div>
  );
}

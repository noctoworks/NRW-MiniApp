import { useQuery } from '@tanstack/react-query';
import { Camera, Share2 } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getReferral } from '../api/cabinet';
import Loader from '../components/Loader';
import SubscriptionLink from '../components/SubscriptionLink';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { formatRub } from '../lib/format';
import { hapticImpact } from '../lib/haptics';

const SHARE_TEXT = 'Подключайся к VPN по моей ссылке — быстро и без блокировок 🚀';

export default function Referral() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  const { data, isLoading, isError } = useQuery({ queryKey: ['referral'], queryFn: getReferral });

  const handleShare = () => {
    if (!data?.referral_link) return;
    hapticImpact('light');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(data.referral_link)}&text=${encodeURIComponent(SHARE_TEXT)}`;
    const webApp = window.Telegram?.WebApp;
    if (webApp) webApp.openTelegramLink(shareUrl);
    else window.open(shareUrl, '_blank');
  };

  const handleShareToStory = () => {
    if (!data?.referral_link) return;
    hapticImpact('light');
    // widget_link (кликабельный стикер поверх Story) виден только у Telegram
    // Premium — поэтому саму ссылку кладём ещё и текстом в подпись, чтобы она
    // была доступна всем, кто увидит историю, а не только премиум-подписчикам.
    window.Telegram?.WebApp?.shareToStory?.(`${window.location.origin}/story-bg.jpg`, {
      text: `${SHARE_TEXT}\n${data.referral_link}`,
      widget_link: { url: data.referral_link, name: 'Подключиться' },
    });
  };

  const canShareToStory = typeof window.Telegram?.WebApp?.shareToStory === 'function';

  return (
    <main className="min-h-screen pb-10">
      <div
        className="px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">Пригласить друзей</h1>
      </div>

      {isLoading && <Loader inline label="Загружаем реферальную программу…" />}

      {isError && (
        <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
          Не удалось загрузить данные. Попробуйте открыть раздел ещё раз чуть позже.
        </p>
      )}

      {!isLoading && !isError && data && (
        <div className="animate-fade-in mt-4 flex flex-col gap-3 px-4">
          <div className="card flex flex-col items-center gap-2 py-6 text-center">
            <img src="/emoji/handshake.webp" alt="" aria-hidden className="h-14 w-14" />
            <p className="text-lg font-bold text-white">
              Получайте {data.percent}% с каждой оплаты друга
            </p>
            <p className="max-w-[26ch] text-sm text-[hsl(var(--subtitle-foreground))]">
              Приглашённый оформляет подписку — вам на баланс сразу зачисляется {data.percent}% от
              суммы. Без ограничений по числу друзей.
            </p>
          </div>

          {data.referral_link ? (
            <div className="card flex flex-col gap-3">
              <SubscriptionLink url={data.referral_link} />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-primary flex flex-1 items-center justify-center gap-2 !text-sm"
                  onClick={handleShare}
                >
                  <Share2 size={16} strokeWidth={2} />
                  В Telegram
                </button>
                {canShareToStory && (
                  <button
                    type="button"
                    className="btn-secondary flex flex-1 items-center justify-center gap-2 !text-sm"
                    onClick={handleShareToStory}
                  >
                    <Camera size={16} strokeWidth={2} />В Stories
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="card text-center text-sm text-[hsl(var(--subtitle-foreground))]">
              Реферальная ссылка временно недоступна — попробуйте позже.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="card flex flex-col gap-1">
              <span className="text-xs text-[hsl(var(--subtitle-foreground))]">Приглашено</span>
              <span className="text-xl font-bold text-white">{data.invited_count}</span>
            </div>
            <div className="card flex flex-col gap-1">
              <span className="text-xs text-[hsl(var(--subtitle-foreground))]">Заработано</span>
              <span className="text-xl font-bold text-white">{formatRub(data.earned_kopeks)}</span>
            </div>
          </div>

          <div className="card flex items-center justify-between gap-3">
            <span className="text-sm text-white">Друг зарегистрировался по ссылке</span>
            <span className="font-semibold text-[hsl(var(--primary))]">+{data.invite_bonus_days} дн. сразу</span>
          </div>
        </div>
      )}
    </main>
  );
}

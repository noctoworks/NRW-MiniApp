import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getConnectApps } from '../api/cabinet';
import Loader from '../components/Loader';
import PlatformPicker from '../components/PlatformPicker';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { resolveBlockColor, resolveBlockIcon } from '../lib/connectIcons';
import { hapticImpact, hapticSelection } from '../lib/haptics';
import type { ConnectApp } from '../types';

interface ConnectNavState {
  platform?: string;
  appId?: string;
}

/** Telegram.WebApp.platform — надёжнее UA-снифинга, доступен во всех клиентах. */
function detectPlatformKey(): string {
  const platform = window.Telegram?.WebApp?.platform;
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  if (platform === 'macos') return 'macos';
  return 'windows';
}

function openExternal(url: string) {
  const webApp = window.Telegram?.WebApp;
  if (webApp) webApp.openLink(url);
  else window.open(url, '_blank');
}

/** Открывает deep-link кастомной схемы (happ://, koala-clash://, v2rayng://...).
 *
 * Ни location.href, ни клик по <a>, ни Telegram.WebApp.openLink() с самой
 * кастомной схемой НЕ срабатывают изнутри WebView Telegram Mini App — это
 * задокументированное ограничение (проверено вживую, см. диалог). Рабочий
 * способ: открыть через Telegram.WebApp.openLink() СВОЮ же HTTPS-страницу
 * (/redirect, см. pages/Redirect.tsx) — Telegram гарантированно откроет её
 * во внешнем системном браузере (это уже НЕ WebView мини-аппа), а уже оттуда
 * страница сама редиректит на кастомную схему — системный браузер такие
 * переходы перехватывает штатно. */
function openDeepLink(url: string) {
  const redirectUrl = `${window.location.origin}/redirect?url=${encodeURIComponent(url)}`;
  const webApp = window.Telegram?.WebApp;
  if (webApp) webApp.openLink(redirectUrl);
  else window.location.href = url; // dev-превью вне Telegram
}

/** "Настройка VPN" — воссоздаёт страницу подписки Remnawave (Subpage Builder,
 * см. app/cabinet/routes.py::connect_apps) в дизайне Mini App: выбор платформы,
 * вкладки приложений, вертикальный таймлайн шагов подключения — 1-в-1 по
 * структуре с референсом (sub_page), а не список кнопок. */
export default function Connect() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as ConnectNavState | null) ?? null;

  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  const { data, isLoading, isError } = useQuery({ queryKey: ['connect-apps'], queryFn: getConnectApps });

  const [platformKey, setPlatformKey] = useState<string | null>(navState?.platform ?? null);
  const [appId, setAppId] = useState<string | null>(navState?.appId ?? null);

  useEffect(() => {
    if (!data || platformKey !== null) return;
    const detected = detectPlatformKey();
    const hasDetected = data.platforms.some((p) => p.key === detected);
    setPlatformKey(hasDetected ? detected : (data.platforms[0]?.key ?? null));
  }, [data, platformKey]);

  const platform = useMemo(() => data?.platforms.find((p) => p.key === platformKey) ?? null, [data, platformKey]);

  useEffect(() => {
    if (!platform) return;
    if (appId && platform.apps.some((a) => a.id === appId)) return;
    setAppId(platform.apps[0]?.id ?? null);
  }, [platform, appId]);

  const app: ConnectApp | null = useMemo(() => platform?.apps.find((a) => a.id === appId) ?? null, [platform, appId]);

  return (
    <main className="min-h-screen pb-10">
      <div
        className="flex items-center justify-between gap-3 px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">Настройка VPN</h1>
        {data && data.platforms.length > 0 && (
          <PlatformPicker
            options={data.platforms.map((p) => ({ key: p.key, label: p.label }))}
            selectedKey={platformKey}
            onSelect={(key) => {
              setPlatformKey(key);
              setAppId(null);
            }}
          />
        )}
      </div>

      {isLoading && <Loader inline label="Загружаем инструкцию подключения…" />}

      {isError && (
        <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
          Не удалось загрузить список приложений. Ссылку подписки можно скопировать вручную на
          главном экране.
        </p>
      )}

      {!isLoading && !isError && data && data.platforms.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-[hsl(var(--subtitle-foreground))]">
          Список приложений временно недоступен — скопируйте ссылку подписки вручную на главном
          экране.
        </p>
      )}

      {platform && platform.apps.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {platform.apps.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                if (a.id !== appId) hapticSelection();
                setAppId(a.id);
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                a.id === appId
                  ? 'border border-[hsl(var(--primary))] bg-[hsl(var(--card))] text-white'
                  : 'border border-transparent bg-[hsl(var(--card))] text-[hsl(var(--subtitle-foreground))]'
              }`}
            >
              {a.featured && <span className="h-1.5 w-1.5 rounded-full bg-[#f5b622]" />}
              {a.name}
            </button>
          ))}
        </div>
      )}

      {app && (
        <div className="mt-5 flex flex-col px-4">
          {app.blocks.map((block, index) => {
            const Icon = resolveBlockIcon(block.icon_key);
            const color = resolveBlockColor(block.icon_color);
            const isLast = index === app.blocks.length - 1;

            return (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
                  >
                    <Icon size={18} strokeWidth={2} style={{ color }} />
                  </span>
                  {!isLast && <span className="mt-1 w-px flex-1 bg-white/10" />}
                </div>

                <div className="flex-1 pb-6">
                  <div className="pt-1.5 font-semibold text-white">{block.title}</div>
                  {block.description && (
                    <p className="mt-1 text-sm leading-5 text-[hsl(var(--subtitle-foreground))]">
                      {block.description}
                    </p>
                  )}

                  {block.buttons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {block.buttons.map((button) =>
                        button.type === 'subscriptionLink' ? (
                          <button
                            key={button.url}
                            type="button"
                            className="btn-primary !min-h-[46px] w-full !text-sm"
                            onClick={() => {
                              hapticImpact('medium');
                              openDeepLink(button.url);
                            }}
                          >
                            {button.label}
                          </button>
                        ) : (
                          <button
                            key={button.url}
                            type="button"
                            className="btn-secondary !min-h-[46px] flex-1 basis-32 !text-sm"
                            onClick={() => {
                              hapticImpact('light');
                              openExternal(button.url);
                            }}
                          >
                            {button.label}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

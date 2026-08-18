import { useEffect, useState } from 'react';

const MOCK_TELEGRAM_USER: TelegramWebAppUser = {
  id: 1,
  first_name: 'Danil',
  last_name: 'Volkov',
  username: 'danilvolkov',
  language_code: 'ru',
};

export interface InitDataState {
  ready: boolean;
  initData: string | null;
  telegramUser: TelegramWebAppUser | null;
  isPreview: boolean;
}

/** Реальный Telegram WebApp — берём initData как есть. Вне Telegram (обычный
 * браузер), только в DEV-сборке — фоллбэк на мок-пользователя для визуального
 * превью без бэкенда (см. store/auth.ts::isPreview). В production-сборке вне
 * Telegram initData остаётся null (страница должна показать "откройте через Telegram"). */
export function useTelegramInitData(): InitDataState {
  const [state, setState] = useState<InitDataState>({
    ready: false,
    initData: null,
    telegramUser: null,
    isPreview: false,
  });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (webApp?.initData) {
      webApp.ready();
      webApp.expand();
      setState({
        ready: true,
        initData: webApp.initData,
        telegramUser: webApp.initDataUnsafe.user ?? null,
        isPreview: false,
      });
      return;
    }

    if (import.meta.env.DEV) {
      setState({ ready: true, initData: null, telegramUser: MOCK_TELEGRAM_USER, isPreview: true });
      return;
    }

    setState({ ready: true, initData: null, telegramUser: null, isPreview: false });
  }, []);

  return state;
}

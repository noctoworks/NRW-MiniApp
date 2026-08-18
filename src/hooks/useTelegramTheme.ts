import { useEffect } from 'react';
import { applyTelegramTheme } from '../lib/theme';

export function useTelegramTheme(): void {
  useEffect(() => {
    applyTelegramTheme();
    const webApp = window.Telegram?.WebApp;
    webApp?.onEvent('themeChanged', applyTelegramTheme);
    return () => webApp?.offEvent('themeChanged', applyTelegramTheme);
  }, []);
}

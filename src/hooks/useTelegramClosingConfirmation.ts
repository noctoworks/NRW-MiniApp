import { useEffect } from 'react';

/** Bot API 6.2+ — диалог "Закрыть приложение?" при попытке смахнуть/закрыть
 * Mini App, пока открыт хук (экран оплаты) — чтобы случайный свайп не сбросил
 * выбранный период/способ оплаты или не прервал уже создающийся платёж.
 * Включается на маунт, гарантированно выключается на анмаунт — иначе
 * подтверждение осталось бы висеть на всех остальных экранах. */
export function useTelegramClosingConfirmation(enabled = true): void {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp || !enabled) return;

    webApp.enableClosingConfirmation?.();
    return () => webApp.disableClosingConfirmation?.();
  }, [enabled]);
}

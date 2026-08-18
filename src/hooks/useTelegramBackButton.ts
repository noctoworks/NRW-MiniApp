import { useEffect } from 'react';

/** Нативная кнопка "Назад" Telegram Mini App вместо самодельной — так уже
 * решено в диалоге ("уже продумано в самом Телеграм Мини Апп"). Вне Telegram
 * (DEV-превью) BackButton недоступен — просто ничего не показываем. */
export function useTelegramBackButton(onBack: () => void): void {
  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;

    backButton.onClick(onBack);
    backButton.show();

    return () => {
      backButton.offClick(onBack);
      backButton.hide();
    };
  }, [onBack]);
}

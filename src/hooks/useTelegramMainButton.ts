import { useEffect } from 'react';

interface MainButtonOptions {
  text: string;
  onClick: () => void;
  /** По умолчанию true — кнопка видна, пока хук примонтирован. */
  visible?: boolean;
  /** По умолчанию true. */
  enabled?: boolean;
  /** Крутилка загрузки поверх кнопки (Bot API 6.1+, showProgress). */
  progress?: boolean;
  /** #RRGGBB — по умолчанию тема Telegram сама берёт button_color. */
  color?: string;
  textColor?: string;
}

/** Нативная MainButton (внизу экрана, вне DOM самого Mini App) вместо
 * кастомной .btn-primary — привычнее для пользователя Telegram (тот же
 * элемент, что и в других ботах/играх) и не требует верстать свой
 * safe-area/градиент под неё. Гарантированно прячется при размонтировании
 * экрана — иначе кнопка "прилипла" бы поверх других страниц Mini App. */
export function useTelegramMainButton({
  text,
  onClick,
  visible = true,
  enabled = true,
  progress = false,
  color,
  textColor,
}: MainButtonOptions): void {
  useEffect(() => {
    const mainButton = window.Telegram?.WebApp?.MainButton;
    if (!mainButton) return;

    mainButton.onClick(onClick);
    mainButton.setParams({
      text,
      is_active: enabled,
      is_visible: visible,
      ...(color ? { color } : {}),
      ...(textColor ? { text_color: textColor } : {}),
    });
    if (progress) mainButton.showProgress(true);
    else mainButton.hideProgress();

    return () => mainButton.offClick(onClick);
  }, [text, onClick, visible, enabled, progress, color, textColor]);

  useEffect(() => {
    return () => {
      window.Telegram?.WebApp?.MainButton?.hide();
    };
  }, []);
}

/** Тема берётся из Telegram.WebApp.themeParams (см. диалог: "гайдлайны Telegram
 * Mini App") — приложение подстраивается под тему клиента пользователя вместо
 * зашитой навигационной палитры. CSS-переменные объявлены с дефолтами в
 * globals.css (тёмный вариант, близкий к макету) — applyTelegramTheme()
 * переопределяет их, когда доступны реальные themeParams. */

const CSS_VAR_BY_PARAM: Record<string, string> = {
  bg_color: '--tg-bg',
  secondary_bg_color: '--tg-surface',
  section_bg_color: '--tg-surface',
  text_color: '--tg-text',
  hint_color: '--tg-hint',
  button_color: '--tg-accent',
  button_text_color: '--tg-accent-text',
};

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/** Осветляет hex-цвет на `amount` (0..255) — используется, чтобы получить
 * второй уровень поверхности (дропдауны, модалки) из surface, раз Telegram
 * даёт только один "secondary_bg_color". */
function lighten(hex: string, amount: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const num = Number.parseInt(match[1], 16);
  const r = clamp(((num >> 16) & 0xff) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function applyTelegramTheme(): void {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;

  const root = document.documentElement;
  const params = webApp.themeParams;

  for (const [param, cssVar] of Object.entries(CSS_VAR_BY_PARAM)) {
    const value = params[param];
    if (value) root.style.setProperty(cssVar, value);
  }

  const surface = params.secondary_bg_color ?? params.section_bg_color;
  if (surface) {
    root.style.setProperty('--tg-surface-2', lighten(surface, webApp.colorScheme === 'dark' ? 12 : -8));
  }

  root.dataset.tgColorScheme = webApp.colorScheme;
}

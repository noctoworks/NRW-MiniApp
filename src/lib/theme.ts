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

/** hex → "H S% L%" (без запятых) — формат, которого требует hsl(var(--x))
 * у shadcn-токенов (--card, --primary, ...). */
function hexToHslTriplet(hex: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;

  const num = Number.parseInt(match[1], 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Один параметр темы Telegram → несколько shadcn-токенов, которые должны
 * ехать вместе (иначе главный экран следует теме клиента, а админка — нет,
 * и интерфейс распадается на два разных стиля). */
const HSL_VARS_BY_PARAM: Record<string, string[]> = {
  bg_color: ['--background'],
  secondary_bg_color: ['--card', '--secondary'],
  section_bg_color: ['--card', '--secondary'],
  text_color: ['--foreground', '--card-foreground', '--secondary-foreground'],
  hint_color: ['--subtitle-foreground', '--muted-foreground'],
  button_color: ['--primary'],
  button_text_color: ['--primary-foreground'],
};

export function applyTelegramTheme(): void {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;

  const root = document.documentElement;
  const params = webApp.themeParams;

  for (const [param, cssVar] of Object.entries(CSS_VAR_BY_PARAM)) {
    const value = params[param];
    if (value) root.style.setProperty(cssVar, value);
  }

  for (const [param, cssVars] of Object.entries(HSL_VARS_BY_PARAM)) {
    const triplet = params[param] ? hexToHslTriplet(params[param]) : null;
    if (!triplet) continue;
    for (const cssVar of cssVars) root.style.setProperty(cssVar, triplet);
  }

  const surface = params.secondary_bg_color ?? params.section_bg_color;
  if (surface) {
    const surface2 = lighten(surface, webApp.colorScheme === 'dark' ? 12 : -8);
    root.style.setProperty('--tg-surface-2', surface2);
    const triplet = hexToHslTriplet(surface2);
    if (triplet) root.style.setProperty('--muted', triplet);
  }

  root.dataset.tgColorScheme = webApp.colorScheme;

  // В fullscreen (Bot API 8.0+) шапка Telegram становится прозрачной — доке
  // рекомендует явно задать setHeaderColor(), иначе цвет иконок статус-бара
  // может не совпасть с нашим тёмным фоном. 'bg_color' — не хардкод, а
  // ключевое слово темы Telegram: значение сихронизировано с тем же
  // themeParams.bg_color, что мы уже читаем выше.
  webApp.setHeaderColor?.('bg_color');
  webApp.setBackgroundColor?.('bg_color');
}

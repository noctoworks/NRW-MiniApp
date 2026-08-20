/** Оформление — фиксированная фирменная тёмная палитра (см. globals.css :root),
 * одинаковая для всех пользователей независимо от их личной темы в Telegram.
 *
 * Раньше цвета подтягивались из Telegram.WebApp.themeParams индивидуально под
 * каждого юзера — но разные клиенты Telegram присылают разные наборы полей
 * (где-то есть button_color, где-то нет), и получался разъехавшийся
 * интерфейс: фон один, акцент другой/не задан вовсе (см. диалог: "белый
 * экран без акцентов", "приведи к базовому, не бери тему от пользователей").
 *
 * Теперь применяем только нативную "обвязку" самого Telegram (цвет системной
 * шапки/статус-бара/нижней панели) под наш фиксированный бренд-цвет — сам
 * контент интерфейса всегда остаётся в одной, всегда цельной палитре из
 * globals.css, ничего в рантайме не подменяется. */

function brandBg(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--tg-bg').trim();
  return value || '#19242e';
}

export function applyTelegramTheme(): void {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;

  const bg = brandBg();
  webApp.setHeaderColor?.(bg);
  webApp.setBackgroundColor?.(bg);
  webApp.setBottomBarColor?.(bg);
}

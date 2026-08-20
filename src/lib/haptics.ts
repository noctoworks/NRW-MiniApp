/** Тонкая обёртка над Telegram.WebApp.HapticFeedback (Bot API 6.1+) — вибро-отклик
 * на действия пользователя. Каждая функция — no-op вне Telegram (dev-превью,
 * платформы без вибро вроде Desktop — сам Telegram там просто проигнорирует
 * вызов, но обёртка на всякий случай не падает, если HapticFeedback вообще
 * недоступен в объекте WebApp) и no-op, если пользователь выключил вибро в
 * /settings (см. store/settings.ts — локальная настройка устройства). */

import { useSettingsStore } from '../store/settings';

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

function haptic() {
  if (!useSettingsStore.getState().hapticsEnabled) return undefined;
  return window.Telegram?.WebApp?.HapticFeedback;
}

/** Обычное нажатие кнопки/переключателя — style подбирается по "весу" действия:
 * light — второстепенные тапы (выбор в списке), medium — основное действие
 * экрана (Оплатить, Подключить), heavy — редко, для по-настоящему крупных
 * необратимых действий. */
export function hapticImpact(style: ImpactStyle = 'light'): void {
  haptic()?.impactOccurred(style);
}

/** Результат операции — success/error/warning, отдельный паттерн вибрации
 * от обычного тапа (используется ПОСЛЕ ответа сервера, не на сам клик). */
export function hapticNotification(type: NotificationType): void {
  haptic()?.notificationOccurred(type);
}

/** Смена значения в сегмент-контроле/вкладках/пикере (лёгкий "тик", как
 * прокрутка колеса) — период подписки, способ оплаты, платформа/приложение
 * на экране подключения. */
export function hapticSelection(): void {
  haptic()?.selectionChanged();
}

/** sessionStorage/localStorage могут кинуть SecurityError синхронно (Telegram
 * Web в iframe, Safari private mode с заблокированным сторонним storage) —
 * без этой обёртки чтение прямо в module-init zustand-стора (store/auth.ts,
 * store/settings.ts, store/onboarding.ts) валит всё приложение в белый экран
 * ДО рендера чего бы то ни было — исключение вылетает раньше, чем появляется
 * хоть один React error boundary. См. ревью. */

export function safeGetItem(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // молча игнорируем — состояние всё равно обновится в памяти через zustand set()
  }
}

export function safeRemoveItem(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

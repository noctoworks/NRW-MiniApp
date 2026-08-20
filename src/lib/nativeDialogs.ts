/** Нативные диалоги Telegram (Bot API 6.2+) вместо browser-нативных
 * window.confirm/alert — те рендерятся системным браузерным попапом,
 * который в WebView выглядит чужеродно и не подхватывает тему Mini App.
 * Вне Telegram (dev-превью) — обычный фоллбэк на window.confirm/alert. */

export function confirmDialog(message: string): Promise<boolean> {
  const webApp = window.Telegram?.WebApp;
  if (webApp?.showConfirm) {
    return new Promise((resolve) => webApp.showConfirm!(message, (confirmed) => resolve(confirmed)));
  }
  return Promise.resolve(window.confirm(message));
}

export function alertDialog(message: string): Promise<void> {
  const webApp = window.Telegram?.WebApp;
  if (webApp?.showAlert) {
    return new Promise((resolve) => webApp.showAlert!(message, () => resolve()));
  }
  window.alert(message);
  return Promise.resolve();
}

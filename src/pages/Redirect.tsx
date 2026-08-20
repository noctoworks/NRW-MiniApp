import { useEffect, useState } from 'react';

/** Промежуточная страница для открытия deep-link кастомной схемы (happ://,
 * koala-clash://, v2rayng:// и т.п.) — см. диалог: WebView самого Telegram
 * Mini App блокирует переход на такие схемы (ни location.href, ни клик по
 * <a>, ни даже Telegram.WebApp.openLink() изнутри Mini App не срабатывают —
 * задокументированное ограничение). Решение: открыть ЭТУ страницу через
 * Telegram.WebApp.openLink() (http/https — Telegram гарантированно откроет
 * её во ВНЕШНЕМ системном браузере, а не в зажатом WebView мини-приложения),
 * и уже из настоящего браузера сделать редирект на кастомную схему —
 * системный браузер такие переходы перехватывает штатно.
 *
 * Рендерится в обход всего остального приложения (react-router, авторизация,
 * Telegram-контекст — см. main.tsx) — страница открывается вне Telegram,
 * в обычном браузере, где initData/Telegram.WebApp попросту недоступны. */
export default function Redirect() {
  const [url] = useState(() => new URLSearchParams(window.location.search).get('url'));
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!url) return;
    window.location.replace(url);
    const timer = setTimeout(() => setShowFallback(true), 2000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        background: '#19242e',
        color: '#ffffff',
      }}
    >
      {!url ? (
        <p>Некорректная ссылка.</p>
      ) : (
        <>
          <p>Открываем приложение…</p>
          {showFallback && (
            <>
              <p style={{ opacity: 0.6, fontSize: 14, maxWidth: 280 }}>
                Не открылось автоматически? Убедитесь, что приложение установлено, и нажмите кнопку
                ниже.
              </p>
              <a
                href={url}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  background: '#3da8f5',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Открыть приложение
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
}

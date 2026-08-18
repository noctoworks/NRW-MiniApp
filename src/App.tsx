import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { loginTelegram } from './api/auth';
import { useTelegramInitData } from './hooks/useTelegramInitData';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import { useAuthStore } from './store/auth';

export default function App() {
  useTelegramTheme();
  const { ready, initData, telegramUser, isPreview } = useTelegramInitData();
  const { token, setToken, setTelegramUser, setPreview } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || token) return;

    if (isPreview && telegramUser) {
      setPreview(telegramUser);
      return;
    }

    if (!initData) {
      setAuthError('Откройте приложение через кнопку в Telegram-боте.');
      return;
    }

    loginTelegram(initData)
      .then((accessToken) => {
        if (telegramUser) setTelegramUser(telegramUser);
        setToken(accessToken);
      })
      .catch(() => setAuthError('Не удалось авторизоваться. Попробуйте открыть приложение заново.'));
  }, [ready, initData, telegramUser, isPreview, token, setToken, setTelegramUser, setPreview]);

  if (!ready) return null;

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center text-sm text-muted">
        {authError}
      </div>
    );
  }

  if (!token && !useAuthStore.getState().isPreview) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Загрузка…</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
    </Routes>
  );
}

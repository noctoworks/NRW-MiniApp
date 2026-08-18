import { AppRoot } from '@telegram-apps/telegram-ui';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { loginTelegram } from './api/auth';
import AdminGuard from './components/admin/AdminGuard';
import { useIsDesktop } from './hooks/useIsDesktop';
import { useTelegramInitData } from './hooks/useTelegramInitData';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import { useAuthStore } from './store/auth';

// Ленивая загрузка — recharts (в admin-графиках) заметно раздувает бандл,
// обычным пользователям (не админам) он вообще не нужен.
const AdminDesktopLayout = lazy(() => import('./pages/admin/AdminDesktopLayout'));
const AdminMobileSummary = lazy(() => import('./pages/admin/AdminMobileSummary'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const AdminPromoGroups = lazy(() => import('./pages/admin/AdminPromoGroups'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminLtv = lazy(() => import('./pages/admin/AdminLtv'));
const AdminGrowth = lazy(() => import('./pages/admin/AdminGrowth'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));

function AdminLoading() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Загрузка…</div>;
}

function AdminEntry() {
  // Мобильный экран — только сводка (AdminMobileSummary), без вложенных
  // /admin/* маршрутов. Десктоп — полный layout с сайдбаром и <Outlet/>.
  const isDesktop = useIsDesktop();
  return (
    <Suspense fallback={<AdminLoading />}>{isDesktop ? <AdminDesktopLayout /> : <AdminMobileSummary />}</Suspense>
  );
}

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
      <AppRoot>
        <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center text-sm text-muted">
          {authError}
        </div>
      </AppRoot>
    );
  }

  if (!token && !useAuthStore.getState().isPreview) {
    return (
      <AppRoot>
        <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">Загрузка…</div>
      </AppRoot>
    );
  }

  return (
    <AppRoot>
      <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminEntry />
          </AdminGuard>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminOverview />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminUsers />
            </Suspense>
          }
        />
        <Route
          path="users/:id"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminUserDetail />
            </Suspense>
          }
        />
        <Route
          path="promo-groups"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminPromoGroups />
            </Suspense>
          }
        />
        <Route
          path="campaigns"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminCampaigns />
            </Suspense>
          }
        />
        <Route
          path="ltv"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminLtv />
            </Suspense>
          }
        />
        <Route
          path="growth"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminGrowth />
            </Suspense>
          }
        />
        <Route
          path="referrals"
          element={
            <Suspense fallback={<AdminLoading />}>
              <AdminReferrals />
            </Suspense>
          }
        />
      </Route>
      </Routes>
    </AppRoot>
  );
}

import { AppRoot } from '@telegram-apps/telegram-ui';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import { loginTelegram } from './api/auth';
import AdminGuard from './components/admin/AdminGuard';
import Loader from './components/Loader';
import { useIsDesktop } from './hooks/useIsDesktop';
import { useTelegramInitData } from './hooks/useTelegramInitData';
import { useTelegramTheme } from './hooks/useTelegramTheme';
import About from './pages/About';
import Connect from './pages/Connect';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Referral from './pages/Referral';
import Settings from './pages/Settings';
import { useAuthStore } from './store/auth';

// Ленивая загрузка — recharts (в admin-графиках) заметно раздувает бандл,
// обычным пользователям (не админам) он вообще не нужен.
const AdminDesktopLayout = lazy(() => import('./pages/admin/AdminDesktopLayout'));
const AdminMobileLayout = lazy(() => import('./pages/admin/AdminMobileLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const AdminPromoGroups = lazy(() => import('./pages/admin/AdminPromoGroups'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminLtv = lazy(() => import('./pages/admin/AdminLtv'));
const AdminGrowth = lazy(() => import('./pages/admin/AdminGrowth'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));

function AdminLoading() {
  return <Loader />;
}

// Манифест обязан быть публично доступен по https (проверяют сами кошельки при
// подключении) — файл лежит в public/, значит раздаётся с того же домена, что и
// сам Mini App (см. .env MINIAPP_URL/CABINET_ALLOWED_ORIGINS — mini.tinymini.online).
const TONCONNECT_MANIFEST_URL = `${window.location.origin}/tonconnect-manifest.json`;

function AdminEntry() {
  // Десктоп — сайдбар (AdminDesktopLayout), мобильный — горизонтальные вкладки
  // (AdminMobileLayout) — у обоих одинаковый набор разделов через <Outlet/>,
  // отличается только "рама" вокруг них.
  const isDesktop = useIsDesktop();
  return (
    <Suspense fallback={<AdminLoading />}>{isDesktop ? <AdminDesktopLayout /> : <AdminMobileLayout />}</Suspense>
  );
}

export default function App() {
  useTelegramTheme();
  const { ready, initData, telegramUser, isPreview } = useTelegramInitData();
  const { token, setToken, setTelegramUser, setPreview } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (isPreview && telegramUser) {
      setPreview(telegramUser);
      return;
    }

    // telegramUser (имя/аватар из initDataUnsafe.user) — ставим в стор ВСЕГДА,
    // как только он есть, независимо от того, есть ли уже token. Раньше это
    // было внутри `if (!ready || token) return`, поэтому при повторном
    // открытии Mini App в рамках того же Telegram-сеанса (token уже лежит в
    // sessionStorage — см. store/auth.ts) весь блок пропускался целиком, и
    // telegramUser в сторе так и оставался null — TopBar показывал фолбэк
    // «Пользователь» вместо реального имени. Именно поэтому баг был не
    // всегда, а «иногда».
    if (telegramUser) setTelegramUser(telegramUser);

    if (token) return; // уже авторизованы — повторный логин не нужен

    if (!initData) {
      setAuthError('Откройте приложение через кнопку в Telegram-боте.');
      return;
    }

    loginTelegram(initData)
      .then((accessToken) => setToken(accessToken))
      .catch(() => setAuthError('Не удалось авторизоваться. Попробуйте открыть приложение заново.'));
  }, [ready, initData, telegramUser, isPreview, token, setToken, setTelegramUser, setPreview]);

  if (!ready) return null;

  if (authError) {
    return (
      <AppRoot>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="card max-w-sm text-center text-sm text-[hsl(var(--subtitle-foreground))]">{authError}</div>
        </div>
      </AppRoot>
    );
  }

  if (!token && !useAuthStore.getState().isPreview) {
    return (
      <AppRoot>
        <Loader />
      </AppRoot>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl={TONCONNECT_MANIFEST_URL}>
      <AppRoot>
        <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/referral" element={<Referral />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/about" element={<About />} />
      <Route path="/settings" element={<Settings />} />
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
    </TonConnectUIProvider>
  );
}

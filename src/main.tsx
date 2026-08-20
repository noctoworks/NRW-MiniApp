import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Redirect from './pages/Redirect';
import '@telegram-apps/telegram-ui/dist/styles.css';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root')!);

// /redirect открывается ВНЕ Telegram, в системном браузере (см. pages/Redirect.tsx)
// — там нет initData/Telegram.WebApp, поэтому монтируем эту страницу в обход
// всего остального приложения (react-router, авторизация, QueryClientProvider
// ей не нужны), а не как обычный <Route> внутри <App/>.
if (window.location.pathname === '/redirect') {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Redirect />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

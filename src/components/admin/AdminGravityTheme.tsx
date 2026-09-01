import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import type { ReactNode } from 'react';

// Импортируется только из AdminDesktopLayout.tsx/AdminMobileLayout.tsx — оба
// уже ленивые чанки (см. App.tsx, lazy()), поэтому CSS/JS Gravity UI грузится
// только тем, кто реально открыл /admin, а не всем пользователям (см. диалог
// 2026-09-01 — подключение этих же стилей из НЕ-ленивого AdminGuard.tsx
// раздувало общий бандл всем посетителям).
//
// scoped=true рендерит собственный <div class="g-root g-root_theme_dark">
// вокруг детей вместо записи класса темы в document.body — иначе
// Gravity-токены/reset утекли бы на остальной Telegram-тёмный интерфейс
// (AppRoot из @telegram-apps/telegram-ui), который эту тему не использует.
export default function AdminGravityTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider scoped theme="dark">
      {children}
    </ThemeProvider>
  );
}

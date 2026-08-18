import { create } from 'zustand';
import type { TelegramUser } from '../types';

const TOKEN_STORAGE_KEY = 'bedolaga_cabinet_token';

interface AuthState {
  token: string | null;
  telegramUser: TelegramUser | null;
  /** Открыто не внутри Telegram (обычный браузер, `npm run dev`) — данные
   * подставляются моками из lib/previewData.ts, реальный бэкенд не дёргается.
   * Никогда не true в production-сборке, см. hooks/useTelegramInitData.ts. */
  isPreview: boolean;
  setToken: (token: string) => void;
  setTelegramUser: (user: TelegramUser) => void;
  setPreview: (user: TelegramUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem(TOKEN_STORAGE_KEY),
  telegramUser: null,
  isPreview: false,
  setToken: (token) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token });
  },
  setTelegramUser: (telegramUser) => set({ telegramUser }),
  setPreview: (telegramUser) => set({ isPreview: true, telegramUser }),
  logout: () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, isPreview: false });
  },
}));

import { create } from 'zustand';

const HAPTICS_STORAGE_KEY = 'nrw_haptics_enabled';

function readHapticsEnabled(): boolean {
  const stored = localStorage.getItem(HAPTICS_STORAGE_KEY);
  return stored === null ? true : stored === '1';
}

interface SettingsState {
  /** Локальная настройка устройства (не серверная — вибро зависит от того, на
   * каком телефоне сейчас открыт Mini App, а не от аккаунта Telegram). */
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: readHapticsEnabled(),
  setHapticsEnabled: (enabled) => {
    localStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? '1' : '0');
    set({ hapticsEnabled: enabled });
  },
}));

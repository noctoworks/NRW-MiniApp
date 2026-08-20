import { create } from 'zustand';
import { safeGetItem, safeSetItem } from '../lib/safeStorage';

const STORAGE_KEY = 'nrw_dashboard_tour_seen';

function getCloudStorage() {
  return window.Telegram?.WebApp?.CloudStorage;
}

interface OnboardingState {
  hasSeenDashboardTour: boolean;
  /** Пока CloudStorage не ответил — не знаем реальное значение (могли уже
   * пройти тур на другом устройстве), поэтому Dashboard ждёт hydrated,
   * прежде чем решать, показывать ли тур. */
  hydrated: boolean;
  markDashboardTourSeen: () => void;
  /** Для кнопки "Показать обучение ещё раз" в Settings — не трогает
   * сохранённое значение (следующий обычный визит на Dashboard всё равно не
   * должен снова запускать тур сам по себе), просто сбрасывает флаг в
   * памяти, чтобы Dashboard перезапустил показ по явному запросу. */
  resetForReplay: () => void;
}

function persistSeen(value: boolean) {
  const cloud = getCloudStorage();
  const raw = value ? '1' : '0';
  if (cloud) {
    cloud.setItem(STORAGE_KEY, raw);
  } else {
    safeSetItem(localStorage, STORAGE_KEY, raw);
  }
}

export const useOnboardingStore = create<OnboardingState>((set) => {
  const cloud = getCloudStorage();

  if (cloud) {
    cloud.getItem(STORAGE_KEY, (error, value) => {
      // Ошибка/старый клиент без реального CloudStorage — считаем,
      // что тур ещё не проходили, чем зря скрыть его от нового юзера.
      set({ hasSeenDashboardTour: !error && value === '1', hydrated: true });
    });
  }

  return {
    // Синхронный фолбэк для клиентов без CloudStorage вообще (десктоп/старые
    // версии) — используем localStorage как раньше, сразу hydrated.
    hasSeenDashboardTour: cloud ? false : safeGetItem(localStorage, STORAGE_KEY) === '1',
    hydrated: !cloud,
    markDashboardTourSeen: () => {
      persistSeen(true);
      set({ hasSeenDashboardTour: true });
    },
    resetForReplay: () => set({ hasSeenDashboardTour: false }),
  };
});

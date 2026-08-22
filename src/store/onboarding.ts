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
  try {
    if (cloud) {
      cloud.setItem(STORAGE_KEY, raw);
      return;
    }
  } catch {
    // Клиент отдаёт CloudStorage как объект, но реально не поддерживает его
    // методы (кидает WebAppMethodUnsupported синхронно, а не через error в
    // колбэке — поймано вживую, см. диалог "MiniApp не открывается") — просто
    // падаем на localStorage ниже, как и для клиентов без CloudStorage вообще.
  }
  safeSetItem(localStorage, STORAGE_KEY, raw);
}

export const useOnboardingStore = create<OnboardingState>((set) => {
  const cloud = getCloudStorage();
  // cloud.getItem может кинуть синхронно вместо колбэка с error — некоторые
  // клиенты выставляют WebApp.CloudStorage непустым объектом, но сами методы
  // не поддерживают (WebAppMethodUnsupported). Без try/catch это падает прямо
  // в конструкторе Zustand-стора, т.е. при самом первом импорте модуля — весь
  // React-дерево не монтируется, MiniApp остаётся пустым экраном.
  let cloudAvailable = false;
  if (cloud) {
    try {
      cloud.getItem(STORAGE_KEY, (error, value) => {
        // Ошибка/старый клиент без реального CloudStorage — считаем,
        // что тур ещё не проходили, чем зря скрыть его от нового юзера.
        set({ hasSeenDashboardTour: !error && value === '1', hydrated: true });
      });
      cloudAvailable = true;
    } catch {
      cloudAvailable = false;
    }
  }

  return {
    // Синхронный фолбэк для клиентов без CloudStorage вообще (десктоп/старые
    // версии) — используем localStorage как раньше, сразу hydrated.
    hasSeenDashboardTour: cloudAvailable ? false : safeGetItem(localStorage, STORAGE_KEY) === '1',
    hydrated: !cloudAvailable,
    markDashboardTourSeen: () => {
      persistSeen(true);
      set({ hasSeenDashboardTour: true });
    },
    resetForReplay: () => set({ hasSeenDashboardTour: false }),
  };
});

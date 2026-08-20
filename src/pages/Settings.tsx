import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Home, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getProfile, setLanguage } from '../api/cabinet';
import Loader from '../components/Loader';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { hapticImpact, hapticSelection } from '../lib/haptics';
import { useOnboardingStore } from '../store/onboarding';
import type { AppLanguage } from '../types';

type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed';

// Ссылка на канал — заполнить, когда пришлют URL (см. диалог: "не буду её
// придумывать"). Пустая строка = карточка не рендерится вообще, не показываем
// нерабочую ссылку.
const CHANNEL_URL = '';

const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

export default function Settings() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const resetTourForReplay = useOnboardingStore((s) => s.resetForReplay);

  const handleReplayTour = () => {
    hapticImpact('light');
    resetTourForReplay();
    navigate('/', { state: { replayTour: true } });
  };

  // 'unknown'/'missed' — можно предложить закрепить; 'added' — уже закреплён,
  // карточку прячем; 'unsupported' — старый клиент/десктоп без Bot API 8.0.
  const [homeScreenStatus, setHomeScreenStatus] = useState<HomeScreenStatus | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp?.checkHomeScreenStatus) {
      setHomeScreenStatus('unsupported');
      return;
    }
    webApp.checkHomeScreenStatus((status) => setHomeScreenStatus(status));
    // Синхронного ответа на addToHomeScreen() нет — статус меняем по событию.
    const handleAdded = () => setHomeScreenStatus('added');
    webApp.onEvent('homeScreenAdded', handleAdded);
    return () => webApp.offEvent('homeScreenAdded', handleAdded);
  }, []);

  const handleAddToHomeScreen = () => {
    hapticImpact('light');
    window.Telegram?.WebApp?.addToHomeScreen?.();
  };

  const [language, setLanguageLocal] = useState<AppLanguage | null>(null);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const currentLanguage = language ?? (profile?.language === 'en' ? 'en' : 'ru');

  const handleLanguageChange = async (code: AppLanguage) => {
    if (code === currentLanguage || savingLanguage) return;
    hapticSelection();
    setSavingLanguage(true);
    try {
      const saved = await setLanguage(code);
      setLanguageLocal(saved);
      // Локализация подписей на бэкенде (connect-apps/referral/транзакции)
      // зависит от User.language — перезапрашиваем всё разом, это редкое
      // действие, не жалко.
      await queryClient.invalidateQueries();
    } finally {
      setSavingLanguage(false);
    }
  };

  return (
    <main className="min-h-screen pb-10">
      <div
        className="px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">Настройки</h1>
      </div>

      {isLoading && <Loader inline label="Загружаем настройки…" />}

      {!isLoading && (
        <div className="animate-fade-in mt-4 flex flex-col gap-3 px-4">
          <div className="card">
            <div className="mb-3 text-sm font-semibold text-white">Язык интерфейса</div>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  disabled={savingLanguage}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                    currentLanguage === lang.code
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--subtitle-foreground))]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleReplayTour} className="card flex items-center gap-2.5 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]">
              <GraduationCap size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
            </span>
            <span className="text-sm font-semibold text-white">Показать обучение ещё раз</span>
          </button>

          {(homeScreenStatus === 'unknown' || homeScreenStatus === 'missed') && (
            <button
              type="button"
              onClick={handleAddToHomeScreen}
              className="card flex items-center gap-2.5 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]">
                <Home size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">Добавить на главный экран</div>
                <div className="text-xs text-[hsl(var(--subtitle-foreground))]">Быстрый доступ без поиска бота в чатах</div>
              </div>
            </button>
          )}

          {CHANNEL_URL && (
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => hapticImpact('light')}
              className="card flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]">
                <Send size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
              </span>
              <span className="text-sm font-semibold text-white">Наш канал в Telegram</span>
            </a>
          )}
        </div>
      )}
    </main>
  );
}

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';

/** Статичный экран — тот же текст, что и у кнопки "ℹ️ О сервисе" в самом боте
 * (handlers/start.py, TEXTS['ru']['about']). */
export default function About() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  return (
    <main className="min-h-screen pb-10">
      <div
        className="px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">О сервисе</h1>
      </div>

      <div className="animate-fade-in mt-4 flex flex-col gap-3 px-4">
        <div className="card text-[15px] leading-6 text-white">
          <p>Это сервис доступа к VPN по подписке.</p>
          <p className="mt-3">
            Здесь вы можете купить или продлить подписку, подарить её другу, приглашать друзей за
            бонусы и получать поддержку — всё через это меню.
          </p>
        </div>
      </div>
    </main>
  );
}

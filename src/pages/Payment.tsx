import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getTariff, purchaseSubscription } from '../api/cabinet';
import Loader from '../components/Loader';
import PaymentMethodRow from '../components/PaymentMethodRow';
import PeriodCard from '../components/PeriodCard';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { useTelegramClosingConfirmation } from '../hooks/useTelegramClosingConfirmation';
import { useTelegramMainButton } from '../hooks/useTelegramMainButton';
import { computeSavingsPercent, formatRub } from '../lib/format';
import { hapticImpact, hapticNotification, hapticSelection } from '../lib/haptics';

type Stage = 'idle' | 'submitting' | 'pending' | 'error';

// 3 месяца — как на макете (не эвристика "средний по списку": с добавлением
// 6-месячного периода средний индекс сместился бы на него).
const POPULAR_PERIOD_DAYS = 90;

export default function Payment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['tariff'], queryFn: getTariff });

  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);
  // Пока открыт экран оплаты — просим Telegram спросить подтверждение перед
  // закрытием/смахиванием Mini App (Bot API 6.2+), чтобы случайный свайп не
  // сбросил выбор периода/способа или не оборвал уже создающийся платёж.
  useTelegramClosingConfirmation();

  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    if (selectedDays === null) {
      const hasPopular = data.periods.some((p) => p.days === POPULAR_PERIOD_DAYS);
      setSelectedDays(hasPopular ? POPULAR_PERIOD_DAYS : data.periods[0]?.days);
    }
    if (selectedMethod === null) setSelectedMethod(data.payment_methods[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const selectedPeriod = data?.periods.find((p) => p.days === selectedDays) ?? data?.periods[0];
  const popularDays = data?.periods.some((p) => p.days === POPULAR_PERIOD_DAYS)
    ? POPULAR_PERIOD_DAYS
    : data?.periods[Math.floor((data?.periods.length ?? 1) / 2)]?.days;

  const handlePay = useCallback(async () => {
    if (!selectedPeriod || !selectedMethod) return;
    hapticImpact('medium');
    setStage('submitting');
    try {
      const result = await purchaseSubscription(selectedPeriod.days, selectedMethod);
      if (result.status === 'success') {
        hapticNotification('success');
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        navigate('/');
        return;
      }
      setPendingUrl(result.payment_url);
      setStage('pending');
      if (result.payment_url) {
        const webApp = window.Telegram?.WebApp;
        if (webApp) {
          webApp.openLink(result.payment_url);
        } else {
          window.open(result.payment_url, '_blank');
        }
      }
    } catch {
      hapticNotification('error');
      setStage('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedMethod]);

  const handleCheckStatus = useCallback(async () => {
    hapticImpact('light');
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Нативная MainButton (см. hooks/useTelegramMainButton.ts) вместо своей
  // .btn-primary внизу экрана — тот же элемент, что и в остальных Mini App
  // Telegram, плюс встроенный индикатор загрузки (showProgress) вместо
  // самодельного disabled-состояния.
  useTelegramMainButton({
    text:
      stage === 'submitting'
        ? 'Оформляем…'
        : stage === 'pending'
          ? 'Проверить'
          : `Оплатить ${selectedPeriod ? formatRub(selectedPeriod.price_kopeks) : ''}`,
    onClick: stage === 'pending' ? handleCheckStatus : handlePay,
    visible: Boolean(data),
    enabled: stage === 'pending' || (stage !== 'submitting' && Boolean(selectedPeriod) && Boolean(selectedMethod)),
    progress: stage === 'submitting',
  });

  if (isLoading || !data) return <Loader />;

  return (
    <main className="bg-gradient-mesh min-h-screen">
      <div
        className="animate-fade-in space-y-6 px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{
          paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))',
          paddingBottom: 'calc(24px + var(--tg-total-safe-bottom, 0px))',
        }}
      >
        <section>
          <h2 className="section-title">Выбор длительности</h2>
          <div className="space-y-3">
            {data.periods.map((period) => (
              <PeriodCard
                key={period.days}
                period={period}
                savingsPercent={computeSavingsPercent(data.periods, period.days, period.price_kopeks)}
                popular={period.days === popularDays}
                selected={period.days === selectedDays}
                onSelect={() => {
                  if (period.days !== selectedDays) hapticSelection();
                  setSelectedDays(period.days);
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Способ оплаты</h2>
          <div className="space-y-3">
            {data.payment_methods.map((method) => (
              <PaymentMethodRow
                key={method.id}
                method={method}
                selected={method.id === selectedMethod}
                onSelect={() => {
                  if (method.id !== selectedMethod) hapticSelection();
                  setSelectedMethod(method.id);
                }}
              />
            ))}
          </div>
        </section>

        {stage === 'pending' && (
          <p className="text-center text-sm text-[hsl(var(--subtitle-foreground))]">
            {pendingUrl
              ? 'Платёж создан. Завершите оплату по открывшейся ссылке, затем нажмите «Проверить».'
              : 'Платёж создан, ожидаем подтверждения.'}
          </p>
        )}

        {stage === 'error' && (
          <p className="text-center text-sm text-[hsl(var(--destructive))]">Не удалось оформить платёж, попробуйте ещё раз.</p>
        )}
      </div>
    </main>
  );
}

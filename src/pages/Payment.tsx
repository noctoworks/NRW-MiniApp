import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getTariff, purchaseSubscription } from '../api/cabinet';
import Loader from '../components/Loader';
import PaymentMethodRow from '../components/PaymentMethodRow';
import PeriodCard from '../components/PeriodCard';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { computeSavingsPercent, formatRub } from '../lib/format';

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

  if (isLoading || !data) return <Loader />;

  const selectedPeriod = data.periods.find((p) => p.days === selectedDays) ?? data.periods[0];
  const popularDays = data.periods.some((p) => p.days === POPULAR_PERIOD_DAYS)
    ? POPULAR_PERIOD_DAYS
    : data.periods[Math.floor(data.periods.length / 2)]?.days;

  const handlePay = async () => {
    if (!selectedPeriod || !selectedMethod) return;
    setStage('submitting');
    try {
      const result = await purchaseSubscription(selectedPeriod.days, selectedMethod);
      if (result.status === 'success') {
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
      setStage('error');
    }
  };

  const handleCheckStatus = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    navigate('/');
  };

  return (
    <main className="bg-gradient-mesh min-h-screen">
      <div className="flex min-h-screen flex-col pb-28">
        <div
          className="animate-fade-in flex-1 space-y-6 px-4"
          style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}
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
                  onSelect={() => setSelectedDays(period.days)}
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
                  onSelect={() => setSelectedMethod(method.id)}
                />
              ))}
            </div>
          </section>

          {stage === 'pending' && (
            <div className="card animate-fade-in">
              <p className="mb-3 text-sm text-[hsl(var(--subtitle-foreground))]">
                {pendingUrl
                  ? 'Платёж создан. Завершите оплату по открывшейся ссылке, затем нажмите «Проверить».'
                  : 'Платёж создан, ожидаем подтверждения.'}
              </p>
              <button type="button" className="btn-primary w-full" onClick={handleCheckStatus}>
                Проверить
              </button>
            </div>
          )}

          {stage === 'error' && (
            <p className="text-center text-sm text-[hsl(var(--destructive))]">Не удалось оформить платёж, попробуйте ещё раз.</p>
          )}
        </div>

        {stage !== 'pending' && (
          <div className="bottom-bar">
            <button
              type="button"
              className="btn-primary w-full disabled:opacity-60"
              disabled={stage === 'submitting' || !selectedPeriod || !selectedMethod}
              onClick={handlePay}
            >
              {stage === 'submitting' ? 'Оформляем…' : `Оплатить ${selectedPeriod ? formatRub(selectedPeriod.price_kopeks) : ''}`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

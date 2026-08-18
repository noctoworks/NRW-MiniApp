import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Placeholder, Subheadline } from '@telegram-apps/telegram-ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getTariff, purchaseSubscription } from '../api/cabinet';
import PaymentMethodRow from '../components/PaymentMethodRow';
import PeriodCard from '../components/PeriodCard';
import { computeSavingsPercent, formatRub } from '../lib/format';

type Stage = 'idle' | 'submitting' | 'pending' | 'error';

// 3 месяца — как на макете (не эвристика "средний по списку": с добавлением
// 6-месячного периода средний индекс сместился бы на него).
const POPULAR_PERIOD_DAYS = 90;

export default function Payment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['tariff'], queryFn: getTariff });

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

  if (isLoading || !data) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Загрузка…</div>;
  }

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
    <div className="min-h-screen px-4 pb-8 pt-6">
      <button type="button" onClick={() => navigate('/')} className="mb-4 text-sm text-muted">
        ← Назад
      </button>

      <Subheadline className="mb-3 text-muted">Выбор длительности</Subheadline>
      <div className="flex flex-col gap-3">
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

      <Subheadline className="mb-3 mt-6 text-muted">Способ оплаты</Subheadline>
      <div className="flex flex-col gap-3">
        {data.payment_methods.map((method) => (
          <PaymentMethodRow
            key={method.id}
            method={method}
            selected={method.id === selectedMethod}
            onSelect={() => setSelectedMethod(method.id)}
          />
        ))}
      </div>

      {stage === 'pending' ? (
        <Placeholder
          className="mt-6 rounded-2xl bg-surface"
          description={
            pendingUrl
              ? 'Платёж создан. Завершите оплату по открывшейся ссылке, затем нажмите «Проверить».'
              : 'Платёж создан, ожидаем подтверждения.'
          }
          action={
            <Button mode="filled" size="m" stretched onClick={handleCheckStatus}>
              Проверить
            </Button>
          }
        />
      ) : (
        <Button
          mode="filled"
          size="l"
          stretched
          className="mt-6"
          loading={stage === 'submitting'}
          disabled={stage === 'submitting' || !selectedPeriod || !selectedMethod}
          onClick={handlePay}
        >
          {stage === 'submitting' ? 'Оформляем…' : `Оплатить ${selectedPeriod ? formatRub(selectedPeriod.price_kopeks) : ''}`}
        </Button>
      )}

      {stage === 'error' && (
        <p className="mt-3 text-center text-sm text-red-400">Не удалось оформить платёж, попробуйте ещё раз.</p>
      )}
    </div>
  );
}

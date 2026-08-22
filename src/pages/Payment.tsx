import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import axios from 'axios';
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
import { alertDialog } from '../lib/nativeDialogs';
import { buildCommentPayload, parseTonTransferUrl } from '../lib/ton';

const GENERIC_PURCHASE_ERROR = 'Не удалось оформить платёж, попробуйте ещё раз.';

/** FastAPI отдаёт ошибку как {detail: "текст"} (см. cabinet/routes.py::purchase —
 * InsufficientBalanceError и общий except оба кладут понятный текст в detail).
 * Без этого юзер видел только общую фразу и не понимал, например, что не
 * хватает денег на балансе — см. диалог. */
function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return GENERIC_PURCHASE_ERROR;
}

type Stage = 'idle' | 'submitting' | 'pending' | 'success' | 'error';

// 3 месяца — как на макете (не эвристика "средний по списку": с добавлением
// 6-месячного периода средний индекс сместился бы на него).
const POPULAR_PERIOD_DAYS = 90;

export default function Payment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['tariff'], queryFn: getTariff });
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();

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
  const [errorMessage, setErrorMessage] = useState<string>(GENERIC_PURCHASE_ERROR);

  useEffect(() => {
    if (!data) return;
    if (selectedDays === null) {
      const hasPopular = data.periods.some((p) => p.days === POPULAR_PERIOD_DAYS);
      // ?? null, не undefined — иначе при пустом periods (например
      // рассинхронизированный тариф/промогруппа) selectedDays === null
      // перестаёт совпадать навсегда, и повторная инициализация не сработает
      // при следующем удачном фетче (см. ревью).
      setSelectedDays(hasPopular ? POPULAR_PERIOD_DAYS : (data.periods[0]?.days ?? null));
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

    // TON — единственный способ, где сначала нужен подключённый кошелёк (см.
    // lib/ton.ts): без него отправлять транзакцию нечем, а платёж на бэкенде
    // создавать раньше времени бессмысленно (повиснет в pending и уйдёт в
    // abandoned-напоминание просто потому, что юзер не успел подключиться).
    if (selectedMethod === 'ton' && !tonWallet) {
      hapticImpact('light');
      await tonConnectUI.openModal();
      return;
    }

    hapticImpact('medium');
    setStage('submitting');
    try {
      const result = await purchaseSubscription(selectedPeriod.days, selectedMethod);
      if (result.status === 'success') {
        hapticNotification('success');
        // Раньше сразу редиректило на главный экран — платёж проходил без
        // единого визуального подтверждения, только вибро. Короткая пауза с
        // анимацией даёт моменту оплаты "вес" вместо резкого перескока (см.
        // диалог: "приятно выглядело").
        setStage('success');
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        setTimeout(() => navigate('/'), 1400);
        return;
      }

      if (selectedMethod === 'ton' && result.payment_url) {
        // payment_url — ton://transfer/<address>?amount=<nanotons>&text=<comment>
        // (см. TonProvider.create_payment) — тот же deep-link, что и в кнопке
        // "Перейти к оплате" у бота, но здесь кошелёк уже подключён через TON
        // Connect, поэтому шлём транзакцию напрямую, а не открываем ссылку.
        const parsed = parseTonTransferUrl(result.payment_url);
        if (!parsed) {
          throw new Error('Не удалось разобрать адрес для перевода TON');
        }
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: parsed.address,
              amount: parsed.amountNanotons,
              payload: buildCommentPayload(parsed.comment),
            },
          ],
        });
        // Отправка транзакции кошельком — не то же самое, что её подтверждение
        // блокчейном (TonProvider.check_payment_status поллит TON Center и
        // финализирует по mc_block_seqno). Здесь только фиксируем сам факт
        // отправки — платёж остаётся pending до реального подтверждения.
      }

      setPendingUrl(result.payment_url);
      setStage('pending');
      if (selectedMethod !== 'ton' && result.payment_url) {
        const webApp = window.Telegram?.WebApp;
        if (webApp) {
          webApp.openLink(result.payment_url);
        } else {
          window.open(result.payment_url, '_blank');
        }
      }
    } catch (error) {
      hapticNotification('error');
      // Отказ подписать транзакцию в кошельке (UserRejectsError) — не системная
      // ошибка, а осознанный выбор юзера: Payment на бэкенде уже создан и
      // останется pending (тот же путь, что и "закрыл окно оплаты Platega, не
      // заплатив") — abandoned-напоминание подхватит его тем же общим циклом.
      const message =
        error instanceof Error && error.name === 'UserRejectsError'
          ? 'Перевод отменён в кошельке.'
          : extractErrorMessage(error);
      setErrorMessage(message);
      setStage('error');
      await alertDialog(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedMethod, tonWallet, tonConnectUI]);

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
  const tonNeedsConnect = selectedMethod === 'ton' && !tonWallet;

  useTelegramMainButton({
    text:
      stage === 'submitting'
        ? 'Оформляем…'
        : stage === 'pending'
          ? 'Проверить'
          : tonNeedsConnect
            ? 'Подключить кошелёк'
            : `Оплатить ${selectedPeriod ? formatRub(selectedPeriod.price_kopeks) : ''}`,
    onClick: stage === 'pending' ? handleCheckStatus : handlePay,
    visible: Boolean(data) && stage !== 'success',
    enabled: stage === 'pending' || (stage !== 'submitting' && Boolean(selectedPeriod) && Boolean(selectedMethod)),
    progress: stage === 'submitting',
  });

  if (isLoading) return <Loader />;

  if (stage === 'success') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <img src="/emoji/party-popper.webp" alt="" aria-hidden className="h-24 w-24" />
        <p className="text-lg font-bold text-white">Готово!</p>
        <p className="text-sm text-[hsl(var(--subtitle-foreground))]">Подписка активна</p>
      </main>
    );
  }

  if (isError || !data) {
    // Без этого фетч, упавший после isLoading, оставлял data===undefined
    // навсегда — экран замирал на спиннере без единого сообщения, купить
    // подписку было невозможно (см. ревью).
    return (
      <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
        Не удалось загрузить тарифы. Попробуйте открыть раздел ещё раз чуть позже.
      </p>
    );
  }

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

          {selectedMethod === 'ton' && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-subtitle2 text-[hsl(var(--subtitle-foreground))]">
                {tonWallet ? 'Кошелёк подключён' : 'Нужен кошелёк TON Connect'}
              </p>
              <TonConnectButton />
            </div>
          )}
        </section>

        {stage === 'pending' && (
          <p className="text-center text-sm text-[hsl(var(--subtitle-foreground))]">
            {selectedMethod === 'ton'
              ? 'Транзакция отправлена из кошелька. Подтверждение в блокчейне может занять пару минут — нажмите «Проверить».'
              : pendingUrl
                ? 'Платёж создан. Завершите оплату по открывшейся ссылке, затем нажмите «Проверить».'
                : 'Платёж создан, ожидаем подтверждения.'}
          </p>
        )}

        {stage === 'error' && (
          <p className="text-center text-sm text-[hsl(var(--destructive))]">{errorMessage}</p>
        )}
      </div>
    </main>
  );
}

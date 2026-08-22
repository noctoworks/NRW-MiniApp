import { useQuery } from '@tanstack/react-query';
import { TonConnectButton } from '@tonconnect/ui-react';
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, Users, Wallet } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { getProfile, getTransactions } from '../api/cabinet';
import Loader from '../components/Loader';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';
import { formatDate, formatRub } from '../lib/format';
import { hapticImpact } from '../lib/haptics';
import { isIncomeTransaction, transactionLabel, transactionStatusLabel } from '../lib/transactions';
import { useAuthStore } from '../store/auth';

/** Профиль — открывается тапом по имени/аватарке в TopBar. Показывает баланс
 * (важно при переносе пользователей со старого бота — у них уже есть ненулевой
 * balance_kopeks, и он не должен быть невидимым в новом интерфейсе) и историю
 * транзакций. Оплата/пополнение балансом пока не реализованы на бэкенде —
 * страница только отображает, ничего не тратит и не пополняет. */
export default function Profile() {
  const navigate = useNavigate();
  const goBack = useCallback(() => navigate('/'), [navigate]);
  useTelegramBackButton(goBack);

  const telegramUser = useAuthStore((s) => s.telegramUser);
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const [page, setPage] = useState(1);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useQuery({ queryKey: ['transactions', page], queryFn: () => getTransactions(page) });

  const name = profile?.full_name || (profile?.username ? `@${profile.username}` : null);
  const initial = (name ?? 'U').replace('@', '').charAt(0).toUpperCase();

  return (
    <main className="min-h-screen pb-10">
      <div
        className="px-4"
        // См. TopBar.tsx / globals.css — официальный --tg-total-safe-top.
        style={{ paddingTop: 'calc(12px + var(--tg-total-safe-top, 0px))' }}
      >
        <h1 className="text-xl font-bold text-white">Профиль</h1>
      </div>

      {profileLoading && <Loader inline label="Загружаем профиль…" />}

      {profileError && (
        <p className="px-4 py-10 text-center text-sm text-[hsl(var(--destructive))]">
          Не удалось загрузить профиль. Попробуйте открыть раздел ещё раз чуть позже.
        </p>
      )}

      {!profileLoading && !profileError && profile && (
        <div className="animate-fade-in mt-4 flex flex-col gap-3 px-4">
          <div className="card flex items-center gap-3">
            {telegramUser?.photo_url ? (
              <img src={telegramUser.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-lg font-semibold text-white">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate font-semibold text-white">{name ?? `id${profile.telegram_id}`}</div>
              <div className="text-xs text-[hsl(var(--subtitle-foreground))]">
                telegram_id {profile.telegram_id} · с нами с {formatDate(profile.created_at)}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="text-xs text-[hsl(var(--subtitle-foreground))]">Баланс</div>
            <div className="text-2xl font-bold text-white">{formatRub(profile.balance_kopeks)}</div>
          </div>

          <button
            type="button"
            className="card flex items-center justify-between text-left"
            onClick={() => {
              hapticImpact('light');
              navigate('/referral');
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.15)]">
                <Users size={18} strokeWidth={2} className="text-[hsl(var(--primary))]" />
              </span>
              <span className="text-sm font-semibold text-white">Пригласить друзей</span>
            </div>
            <ChevronRight size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
          </button>

          <div className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.15)]">
                <Wallet size={18} strokeWidth={2} className="text-[hsl(var(--primary))]" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white">TON-кошелёк</div>
                <div className="text-xs text-[hsl(var(--subtitle-foreground))]">Нужен для оплаты подписки в TON</div>
              </div>
            </div>
            {/* Официальный виджет TON Connect — сам показывает "Подключить"/адрес
             * подключённого кошелька и меню отключения, ничего переизобретать не
             * нужно. Разово настраивается здесь, а не на каждом чекапе (см.
             * диалог, "далеко надо разместить в профиле, как доп.опция") —
             * Payment.tsx только проверяет, подключён ли уже кошелёк. */}
            <TonConnectButton />
          </div>

          <section>
            <h2 className="section-title">История операций</h2>

            {transactionsLoading && (
              <div className="card">
                <Loader inline />
              </div>
            )}

            {transactionsError && (
              <p className="card text-center text-sm text-[hsl(var(--destructive))]">
                Не удалось загрузить историю операций.
              </p>
            )}

            {!transactionsLoading && !transactionsError && transactions && (
              <>
                {transactions.items.length === 0 ? (
                  <p className="card text-center text-sm text-[hsl(var(--subtitle-foreground))]">Операций пока нет</p>
                ) : (
                  <div className="card flex flex-col divide-y divide-white/5 !p-0">
                    {transactions.items.map((t) => {
                      const income = isIncomeTransaction(t.type);
                      const status = transactionStatusLabel(t.status);
                      return (
                        <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              income ? 'bg-[#21c45d]/15' : 'bg-white/5'
                            }`}
                          >
                            {income ? (
                              <ArrowDownCircle size={18} strokeWidth={2} className="text-[#21c45d]" />
                            ) : (
                              <ArrowUpCircle size={18} strokeWidth={2} className="text-[hsl(var(--subtitle-foreground))]" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-white">
                              {t.description || transactionLabel(t.type)}
                            </div>
                            <div className="text-xs text-[hsl(var(--subtitle-foreground))]">
                              {formatDate(t.created_at)}
                              {status && ` · ${status}`}
                            </div>
                          </div>
                          <span className={`shrink-0 font-semibold ${income ? 'text-[#21c45d]' : 'text-white'}`}>
                            {income ? '+' : '−'}
                            {formatRub(t.amount_kopeks)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {transactions.total_pages > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="icon-button disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => {
                        hapticImpact('light');
                        setPage((p) => p - 1);
                      }}
                      aria-label="Предыдущая страница"
                    >
                      <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <span className="text-sm text-[hsl(var(--subtitle-foreground))]">
                      {transactions.page} / {transactions.total_pages}
                    </span>
                    <button
                      type="button"
                      className="icon-button disabled:opacity-40"
                      disabled={page >= transactions.total_pages}
                      onClick={() => {
                        hapticImpact('light');
                        setPage((p) => p + 1);
                      }}
                      aria-label="Следующая страница"
                    >
                      <ChevronRight size={18} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

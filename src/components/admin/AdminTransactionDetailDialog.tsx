import { useQuery } from '@tanstack/react-query';
import { Card, Dialog, Text } from '@gravity-ui/uikit';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { getTransactionDetail } from '../../api/admin';
import { formatRub } from '../../lib/format';
import { isIncomeTransaction, transactionLabel, transactionStatusLabel } from '../../lib/transactions';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--g-color-line-generic)] py-2 first:border-t-0">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="body-1" className="text-right">
        {children}
      </Text>
    </div>
  );
}

function RawJsonBlock({ title, data }: { title: string; data: Record<string, unknown> }) {
  if (Object.keys(data).length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <Text variant="subheader-1">{title}</Text>
      <Card view="filled" className="overflow-x-auto p-3">
        <Text as="pre" variant="code-2" whiteSpace="break-spaces" className="m-0">
          {JSON.stringify(data, null, 2)}
        </Text>
      </Card>
    </div>
  );
}

interface AdminTransactionDetailDialogProps {
  transactionId: number | null;
  onClose: () => void;
}

/** «Тело транзакции» по клику на строку в /admin/transactions (см. диалог
 * 2026-09-01) — модалка вместо перехода на отдельную страницу, чтобы не
 * терять фильтры/страницу пагинации списка. Сырой ответ провайдера
 * (Payment.provider_raw_response) — то, ради чего изначально заводили это
 * поле при разборе расхождения с Platega в начале этого же разговора. */
export default function AdminTransactionDetailDialog({ transactionId, onClose }: AdminTransactionDetailDialogProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'transaction', transactionId],
    queryFn: () => getTransactionDetail(transactionId as number),
    enabled: transactionId !== null,
  });

  return (
    <Dialog open={transactionId !== null} onClose={onClose} maxWidth="m" hasCloseButton>
      <Dialog.Header caption={`Транзакция #${transactionId ?? ''}`} />
      <Dialog.Body className="flex flex-col gap-4 px-6 pb-6">
        {isLoading && (
          <Text variant="body-1" color="secondary">
            Загрузка…
          </Text>
        )}
        {isError && (
          <Text variant="body-1" color="danger">
            Не удалось загрузить транзакцию.
          </Text>
        )}
        {data && (
          <>
            <div className="flex flex-col">
              <InfoRow label="Пользователь">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/users/${data.user_id}`)}
                  className="text-[var(--g-color-text-link)] underline-offset-2 hover:underline"
                >
                  {data.full_name || (data.username ? `@${data.username}` : `id${data.telegram_id}`)}
                </button>
              </InfoRow>
              <InfoRow label="Тип">{transactionLabel(data.type)}</InfoRow>
              <InfoRow label="Сумма">
                <Text
                  as="span"
                  color={isIncomeTransaction(data.type) ? 'positive' : 'primary'}
                  className="font-semibold"
                >
                  {isIncomeTransaction(data.type) ? '+' : '−'}
                  {formatRub(data.amount_kopeks)}
                </Text>
              </InfoRow>
              <InfoRow label="Статус">{transactionStatusLabel(data.status) || 'Завершено'}</InfoRow>
              <InfoRow label="Дата">{formatDateTime(data.created_at)}</InfoRow>
              {data.description && <InfoRow label="Описание">{data.description}</InfoRow>}
              {data.payment_provider && (
                <>
                  <InfoRow label="Провайдер">{data.payment_provider}</InfoRow>
                  <InfoRow label="ID платежа у провайдера">{data.payment_external_id}</InfoRow>
                  <InfoRow label="Статус платежа у нас">{data.payment_status}</InfoRow>
                </>
              )}
            </div>

            {data.provider_raw_response && (
              <RawJsonBlock title="Сырой ответ провайдера" data={data.provider_raw_response} />
            )}
            {data.payment_raw_payload && <RawJsonBlock title="Служебный контекст платежа" data={data.payment_raw_payload} />}
          </>
        )}
      </Dialog.Body>
    </Dialog>
  );
}

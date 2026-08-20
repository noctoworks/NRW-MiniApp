/** Transaction.type — см. app/database/models.py (topup|subscription_payment|
 * referral_reward|refund|gift). amount_kopeks в БД всегда положительный —
 * знак/цвет в UI определяется исключительно по типу, а не по числу. */

const TYPE_LABELS: Record<string, string> = {
  topup: 'Пополнение баланса',
  subscription_payment: 'Оплата подписки',
  referral_reward: 'Реферальный бонус',
  refund: 'Возврат',
  gift: 'Подарок другу',
};

const INCOME_TYPES = new Set(['topup', 'referral_reward', 'refund']);

const STATUS_LABELS: Record<string, string> = {
  completed: '',
  pending: 'В обработке',
  failed: 'Не удалось',
};

export function transactionLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function isIncomeTransaction(type: string): boolean {
  return INCOME_TYPES.has(type);
}

export function transactionStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

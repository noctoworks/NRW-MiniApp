import { beginCell } from '@ton/core';

/** Распарсенный ton://transfer/<address>?amount=<nanotons>&text=<comment> —
 * бэкенд (app/services/payment/ton.py::TonProvider.create_payment) отдаёт этот
 * deep-link как payment_url ради паритета с Platega (кнопка "Перейти
 * к оплате" в боте открывает его напрямую). В Mini App деньги переводит
 * TON Connect (кошелёк пользователя уже подключён через провайдера), а не сама
 * ссылка — поэтому здесь достаём только address/amount/comment из неё. */
export interface TonTransferParams {
  address: string;
  amountNanotons: string;
  comment: string;
}

export function parseTonTransferUrl(url: string): TonTransferParams | null {
  try {
    // URL() не поддерживает нестандартные схемы вроде ton:// единообразно во
    // всех окружениях — надёжнее руками: ton://transfer/<address>?<query>.
    const withoutScheme = url.replace(/^ton:\/\/transfer\//, '');
    const [address, query] = withoutScheme.split('?');
    const params = new URLSearchParams(query ?? '');
    const amountNanotons = params.get('amount');
    const comment = params.get('text');
    if (!address || !amountNanotons || !comment) return null;
    return { address, amountNanotons, comment };
  } catch {
    return null;
  }
}

/** BOC-пейлоад текстового комментария (op=0 + UTF-8 текст) — единственный
 * способ приложить наш invoice-id к TON-переводу, который потом найдёт
 * TonProvider.check_payment_status при поллинге TON Center (см. диалог
 * 2026-08-21, схема ответа проверена вживую curl'ом против реального адреса). */
export function buildCommentPayload(comment: string): string {
  const cell = beginCell().storeUint(0, 32).storeStringTail(comment).endCell();
  return cell.toBoc().toString('base64');
}

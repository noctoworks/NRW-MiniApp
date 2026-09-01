export function formatRub(kopeks: number): string {
  return `${Math.round(kopeks / 100)} ₽`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** ISO country code -> флаг-эмодзи (regional indicator symbols, без внешних
 * данных/библиотек). Пустой/незнакомый код (например "XX", когда панель
 * Remnawave не заполнила регион ноды) — просто пустая строка, не мусор. */
export function countryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  // "XX" — реальное значение панели Remnawave для "регион не задан" (см.
  // диалог 2026-09-01), не настоящий ISO-код — не пытаться рисовать для него флаг.
  if (code.length !== 2 || code === 'XX' || !/^[A-Z]{2}$/.test(code)) return '';
  const REGIONAL_INDICATOR_OFFSET = 127397;
  return String.fromCodePoint(...[...code].map((c) => c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET));
}

/** ISO country code -> человекочитаемое название на русском. Intl.DisplayNames
 * (встроено в браузер, без стороннего справочника стран, который легко
 * забыть обновить/ошибиться руками) — если код невалиден/не распознан,
 * возвращает исходный код как есть. */
export function countryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (code.length !== 2 || code === 'XX' || !/^[A-Z]{2}$/.test(code)) return 'Регион не задан';
  try {
    return new Intl.DisplayNames(['ru'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Суммарный трафик (обычно уже в сотнях/тысячах ГБ на масштабе всего
 * сервиса) — TB читается быстрее, чем пятизначное число ГБ. */
export function formatTrafficGb(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
  return `${gb.toFixed(1)} GB`;
}

export function formatTraffic(usedGb: number, limitGb: number): string {
  const used = usedGb.toFixed(1);
  const limit = limitGb === 0 ? '∞' : String(limitGb);
  return `${used} из ${limit} Gb`;
}

/** "Выгода %" против цены за день самого короткого периода — как на макете. */
export function computeSavingsPercent(periods: { days: number; price_kopeks: number }[], days: number, priceKopeks: number): number {
  const shortest = periods.reduce((min, p) => (p.days < min.days ? p : min), periods[0]);
  if (!shortest || shortest.days === days) return 0;

  const basePerDay = shortest.price_kopeks / shortest.days;
  const thisPerDay = priceKopeks / days;
  const savings = 1 - thisPerDay / basePerDay;
  return Math.max(0, Math.round(savings * 100));
}

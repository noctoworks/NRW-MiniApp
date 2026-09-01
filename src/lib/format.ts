export function formatRub(kopeks: number): string {
  return `${Math.round(kopeks / 100)} ₽`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
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

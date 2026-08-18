import type { DashboardResponse, TariffResponse } from '../types';

/** Статичные данные для DEV-превью вне Telegram (см. store/auth.ts::isPreview) —
 * никогда не используется в production. */

export const PREVIEW_DASHBOARD: DashboardResponse = {
  balance_kopeks: 0,
  subscription: {
    status: 'active',
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    traffic_limit_gb: 15,
    traffic_used_gb: 0.8,
    device_limit: 5,
    subscription_url: 'https://my.gram.observer/xzjF41QC3gW',
  },
  // true, чтобы /admin был виден и кликабелен в DEV-превью без бэкенда.
  is_admin: true,
};

export const PREVIEW_TARIFF: TariffResponse = {
  name: 'Онлайн',
  periods: [
    { days: 30, label: '1 месяц', price_kopeks: 24900 },
    { days: 90, label: '3 месяца', price_kopeks: 66900 },
    { days: 180, label: '6 месяцев', price_kopeks: 115000 },
    { days: 360, label: '12 месяцев', price_kopeks: 239000 },
  ],
  payment_methods: [
    { id: 'platega', label: '🏦 Карты и СБП' },
    { id: 'cryptobot', label: '🪙 Криптовалюта' },
    { id: 'stars', label: '⭐️ Telegram Stars' },
  ],
};

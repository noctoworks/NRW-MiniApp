import type {
  ConnectAppsResponse,
  DashboardResponse,
  Device,
  PaginatedTransactionsResponse,
  ProfileResponse,
  ReferralResponse,
  TariffResponse,
} from '../types';

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
    { id: 'ton', label: '💎 TON' },
    { id: 'stars', label: '⭐️ Telegram Stars' },
  ],
};

function previewHappApp(installLabel: string, installUrl: string) {
  return {
    id: 'happ',
    name: 'Happ',
    featured: true,
    blocks: [
      {
        title: 'Установка приложения',
        description: 'Скачайте и установите приложение по кнопке ниже.',
        icon_key: 'DownloadIcon',
        icon_color: 'violet',
        buttons: [{ type: 'external', label: installLabel, url: installUrl }],
      },
      {
        title: 'Добавление подписки',
        description: 'Нажмите кнопку ниже, чтобы добавить подписку.',
        icon_key: 'CloudDownload',
        icon_color: 'cyan',
        buttons: [
          {
            type: 'subscriptionLink',
            label: 'Добавить подписку',
            url: 'happ://add/https://my.gram.observer/xzjF41QC3gW',
          },
        ],
      },
      {
        title: 'Подключение и использование',
        description: 'Включите VPN в приложении — готово.',
        icon_key: 'Check',
        icon_color: 'teal',
        buttons: [],
      },
    ],
  };
}

export const PREVIEW_CONNECT_APPS: ConnectAppsResponse = {
  platforms: [
    {
      key: 'android',
      label: 'Android',
      apps: [previewHappApp('Google Play', 'https://play.google.com/store/apps/details?id=com.happproxy')],
    },
    {
      key: 'ios',
      label: 'iOS',
      apps: [previewHappApp('App Store', 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215')],
    },
  ],
};

export const PREVIEW_REFERRAL: ReferralResponse = {
  referral_link: 'https://t.me/nocto_radarobot?start=ref_DEMO1234',
  percent: 25,
  invited_count: 3,
  earned_kopeks: 74700,
  invite_bonus_days: 3,
};

export const PREVIEW_PROFILE: ProfileResponse = {
  telegram_id: 1,
  username: 'danilvolkov',
  full_name: 'Danil Volkov',
  language: 'ru',
  balance_kopeks: 15000,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
};

export const PREVIEW_TRANSACTIONS: PaginatedTransactionsResponse = {
  items: [
    {
      id: 3,
      type: 'referral_reward',
      amount_kopeks: 6225,
      status: 'completed',
      description: 'Реферальный бонус',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 2,
      type: 'subscription_payment',
      amount_kopeks: 24900,
      status: 'completed',
      description: 'Подписка «Онлайн» на 30 дн.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    },
    {
      id: 1,
      type: 'topup',
      amount_kopeks: 30000,
      status: 'completed',
      description: 'Пополнение баланса',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    },
  ],
  total: 3,
  page: 1,
  total_pages: 1,
};

export const PREVIEW_DEVICES: Device[] = [
  {
    hwid: 'demo-iphone-1',
    platform: 'iOS',
    device_model: 'iPhone 15 Pro',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    hwid: 'demo-macbook-1',
    platform: 'macOS',
    device_model: 'MacBook Air',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

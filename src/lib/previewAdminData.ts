import type {
  AdminDevice,
  AdminUserDetail,
  AdminUserListResponse,
  Campaign,
  CampaignStats,
  CohortsResponse,
  LtvResponse,
  OverviewResponse,
  PaginatedTransactions,
  PromoGroup,
  ReferralFunnelResponse,
  RevenuePoint,
  SupportThread,
  SupportThreadDetail,
} from '../types';

/** Статичные данные для DEV-превью админки вне Telegram — никогда не
 * используется в production, см. store/auth.ts::isPreview. */

export const PREVIEW_OVERVIEW: OverviewResponse = {
  revenue_today_kopeks: 12400,
  revenue_7d_kopeks: 84300,
  revenue_30d_kopeks: 312000,
  revenue_all_time_kopeks: 3180000,
  active_subscriptions: 128,
  paying_subscriptions: 96,
  new_paying_subscriptions_today: 3,
  total_users: 540,
  new_users_7d: 31,
  conversion_percent: 23.7,
  avg_check_kopeks: 41200,
  mrr_kopeks: 312000,
  arr_kopeks: 3744000,
  churn_percent_30d: 8.2,
};

export const PREVIEW_REVENUE_TIMESERIES: RevenuePoint[] = Array.from({ length: 31 }, (_, i) => {
  const date = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
  return {
    date: date.toISOString().slice(0, 10),
    revenue_kopeks: Math.round(5000 + Math.random() * 15000),
    count: Math.round(1 + Math.random() * 6),
  };
});

export const PREVIEW_LTV: LtvResponse = {
  arpu_kopeks: 15200,
  avg_ltv_paying_kopeks: 64100,
  median_ltv_kopeks: 39900,
  paying_users_count: 128,
  top_payers: [
    { user_id: 1, telegram_id: 577437701, username: 'danilvolkov666', full_name: null, total_kopeks: 134300 },
    { user_id: 2, telegram_id: 6299028501, username: 'nocto_support', full_name: null, total_kopeks: 26000 },
    { user_id: 3, telegram_id: 1054309519, username: 'mistorid', full_name: null, total_kopeks: 10000 },
  ],
};

export const PREVIEW_COHORTS: CohortsResponse = {
  max_months: 6,
  cohorts: [
    { cohort_month: '2026-03', users_count: 40, revenue_per_user_by_month_offset: [4900, 3200, 2100, 1800, 900, 400, 200] },
    { cohort_month: '2026-04', users_count: 55, revenue_per_user_by_month_offset: [5100, 2900, 1700, 1200, 600, 0, 0] },
    { cohort_month: '2026-05', users_count: 62, revenue_per_user_by_month_offset: [4700, 2600, 1500, 0, 0, 0, 0] },
  ],
};

export const PREVIEW_REFERRAL_FUNNEL: ReferralFunnelResponse = {
  referred_users_count: 96,
  referred_paying_count: 22,
  conversion_percent: 22.9,
  total_earnings_kopeks: 45600,
  top_referrers: [{ user_id: 2, telegram_id: 6299028501, username: 'nocto_support', full_name: null, earnings_kopeks: 1500, referred_count: 1 }],
};

export const PREVIEW_USERS_LIST: AdminUserListResponse = {
  items: [
    {
      id: 1,
      telegram_id: 577437701,
      username: 'danilvolkov666',
      full_name: 'Данил Волков',
      is_blocked: false,
      has_active_subscription: true,
      is_trial: false,
      last_activity_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    },
  ],
  total: 1,
  page: 1,
  total_pages: 1,
};

export const PREVIEW_SUPPORT_THREADS: SupportThread[] = [
  {
    user_id: 1,
    telegram_id: 577437701,
    username: 'danilvolkov666',
    full_name: 'Данил Волков',
    last_message: 'Не подключается VPN на айфоне, помогите пожалуйста',
    last_message_at: new Date().toISOString(),
    unread: true,
  },
];

export const PREVIEW_SUPPORT_THREAD_DETAIL: SupportThreadDetail = {
  user_id: 1,
  telegram_id: 577437701,
  username: 'danilvolkov666',
  full_name: 'Данил Волков',
  messages: [
    {
      id: 1,
      direction: 'in',
      body: 'Не подключается VPN на айфоне, помогите пожалуйста',
      created_at: new Date().toISOString(),
    },
  ],
};

export const PREVIEW_USER_DETAIL: AdminUserDetail = {
  id: 1,
  telegram_id: 577437701,
  username: 'danilvolkov666',
  full_name: 'Данил Волков',
  language: 'ru',
  is_blocked: false,
  blocked_bot: false,
  balance_kopeks: 0,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
  last_activity_at: new Date().toISOString(),
  subscription: {
    status: 'active',
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    traffic_limit_gb: 15,
    traffic_used_gb: 0.8,
    device_limit: 5,
    is_trial: false,
  },
  transactions: [
    { id: 1, type: 'subscription_payment', amount_kopeks: 24900, status: 'completed', description: 'Подписка «Онлайн» на 30 дн.', created_at: new Date().toISOString() },
  ],
  referrals_invited_count: 3,
  referrals_earned_kopeks: 1500,
  referral_commission_percent: null,
  promo_group_id: null,
  promo_group_name: null,
};

export const PREVIEW_PROMO_GROUPS: PromoGroup[] = [
  { id: 1, name: 'VIP', discount_percent: 20, users_count: 4 },
  { id: 2, name: 'Партнёры', discount_percent: 10, users_count: 12 },
];

export const PREVIEW_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Instagram Jan',
    start_parameter: 'instagram_jan2026',
    bonus_type: 'balance',
    balance_bonus_kopeks: 10000,
    subscription_duration_days: null,
    is_active: true,
    deep_link: 'https://t.me/bot?start=instagram_jan2026',
  },
];

export const PREVIEW_CAMPAIGN_STATS: CampaignStats = {
  registrations_count: 34,
  paying_count: 9,
  conversion_percent: 26.5,
  revenue_kopeks: 89500,
};

export const PREVIEW_DEVICES: AdminDevice[] = [
  { hwid: 'ab12cd34ef56', platform: 'iOS', device_model: 'iPhone 15 Pro', created_at: new Date().toISOString() },
  { hwid: '11aa22bb33cc', platform: 'Android', device_model: 'Pixel 8', created_at: new Date().toISOString() },
];

export const PREVIEW_TRANSACTIONS: PaginatedTransactions = {
  items: PREVIEW_USER_DETAIL.transactions,
  total: 1,
  page: 1,
  total_pages: 1,
};

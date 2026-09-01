import type {
  Alert,
  AdminDevice,
  AdminUserDetail,
  AdminUserListResponse,
  Campaign,
  CampaignStats,
  CohortsResponse,
  LtvResponse,
  MonitoringResponse,
  Node,
  OverviewResponse,
  PaginatedTransactions,
  PlategaReconcileMap,
  PromoCode,
  PromoGroup,
  RecentPayment,
  ReferralFunnelResponse,
  RevenuePoint,
  SalesBreakdown,
  SubscriptionListResponse,
  SupportThread,
  SupportThreadDetail,
  TransactionListResponse,
  UserNodeTraffic,
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
  total_traffic_gb: 4820.5,
};

export const PREVIEW_RECENT_PAYMENTS: RecentPayment[] = [
  { user_id: 1, telegram_id: 577437701, username: 'danilvolkov666', full_name: 'Данил', amount_kopeks: 24900, type: 'subscription_payment', created_at: new Date().toISOString() },
  { user_id: 2, telegram_id: 100200300, username: null, full_name: 'user892', amount_kopeks: 69900, type: 'subscription_payment', created_at: new Date(Date.now() - 3600_000).toISOString() },
  { user_id: 3, telegram_id: 100200301, username: 'user321', full_name: null, amount_kopeks: 24900, type: 'subscription_payment', created_at: new Date(Date.now() - 7200_000).toISOString() },
];

export const PREVIEW_NODES: Node[] = [
  { uuid: 'de-01', name: 'DE-01', country_code: 'DE', is_connected: true, is_disabled: false, traffic_used_gb: 412.7 },
  { uuid: 'fi-01', name: 'FI-01', country_code: 'FI', is_connected: true, is_disabled: false, traffic_used_gb: 198.3 },
  { uuid: 'nl-01', name: 'NL-01', country_code: 'NL', is_connected: true, is_disabled: false, traffic_used_gb: 305.1 },
  { uuid: 'se-01', name: 'SE-01', country_code: 'SE', is_connected: false, is_disabled: false, traffic_used_gb: 89.4 },
];

export const PREVIEW_USER_NODE_TRAFFIC: UserNodeTraffic[] = [
  { node_uuid: 'de-01', node_name: 'DE-01', country_code: 'DE', total_bytes: 18_400_000_000 },
  { node_uuid: 'fi-01', node_name: 'FI-01', country_code: 'FI', total_bytes: 4_100_000_000 },
];

export const PREVIEW_ALERTS: Alert[] = [
  { id: 'subs-expiring-24h', severity: 'critical', title: 'Истекает в ближайшие 24 часа: 6', link: '/admin/subscriptions' },
  { id: 'nodes-disabled', severity: 'warning', title: 'Отключено вручную нод: 1', link: '/admin/nodes' },
  { id: 'support-unread', severity: 'info', title: 'Обращений без ответа: 2', link: '/admin/support' },
];

export const PREVIEW_SALES_BREAKDOWN: SalesBreakdown = {
  by_type: [
    { type: 'subscription_payment', revenue_kopeks: 268000 },
    { type: 'gift', revenue_kopeks: 44000 },
  ],
  by_provider: [
    { provider: 'platega', revenue_kopeks: 241000 },
    { provider: 'stars', revenue_kopeks: 58000 },
    { provider: 'ton', revenue_kopeks: 13000 },
  ],
  by_weekday: [
    { weekday: 0, revenue_kopeks: 41000 },
    { weekday: 1, revenue_kopeks: 38000 },
    { weekday: 2, revenue_kopeks: 52000 },
    { weekday: 3, revenue_kopeks: 45000 },
    { weekday: 4, revenue_kopeks: 61000 },
    { weekday: 5, revenue_kopeks: 39000 },
    { weekday: 6, revenue_kopeks: 36000 },
  ],
  active_subs_by_tariff: [
    { tariff_name: 'Онлайн', active_count: 84 },
    { tariff_name: 'VIP', active_count: 31 },
    { tariff_name: 'Максимум', active_count: 13 },
  ],
};

export const PREVIEW_MONITORING: MonitoringResponse = {
  panel: {
    cpu_cores: 2,
    memory_used_bytes: 1_200_000_000,
    memory_total_bytes: 4_000_000_000,
    uptime_seconds: 864_000,
    users_online_now: 18,
    users_online_last_day: 64,
    users_online_last_week: 112,
    users_never_online: 40,
    nodes_online: 3,
    nodes_total_bytes_lifetime: 1_200_000_000_000,
  },
  nodes: [
    {
      node_uuid: 'de-01',
      node_name: 'DE-01',
      users_online: 7,
      inbound_stats: [{ tag: 'VLESS_SELFSTEAL_WITH_NGINX', upload: '412.30 MiB', download: '3.12 GiB' }],
      outbound_stats: [{ tag: 'DIRECT', upload: '398.10 MiB', download: '3.05 GiB' }],
    },
    {
      node_uuid: 'fi-01',
      node_name: 'FI-01',
      users_online: 4,
      inbound_stats: [{ tag: 'VLESS_SELFSTEAL_WITH_NGINX', upload: '201.50 MiB', download: '1.44 GiB' }],
      outbound_stats: [{ tag: 'DIRECT', upload: '195.20 MiB', download: '1.40 GiB' }],
    },
  ],
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
    ticket_id: 1,
    status: 'open',
    assigned_admin_name: null,
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
  ticket_id: 1,
  status: 'open',
  assigned_admin_name: null,
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

export const PREVIEW_PROMO_CODES: PromoCode[] = [
  {
    id: 1,
    code: 'SUMMER2026',
    type: 'balance',
    value: 50000,
    max_activations: 100,
    activations_count: 12,
    expires_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    code: 'WELCOME7',
    type: 'days',
    value: 7,
    max_activations: 1000,
    activations_count: 340,
    expires_at: null,
    is_active: false,
    created_at: new Date().toISOString(),
  },
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

export const PREVIEW_SUBSCRIPTION_LIST: SubscriptionListResponse = {
  items: [
    {
      user_id: 1,
      telegram_id: 577437701,
      username: 'danilvolkov666',
      full_name: 'Данил',
      tariff_name: 'Онлайн',
      status: 'active',
      is_trial: false,
      end_date: new Date(Date.now() + 20 * 86400_000).toISOString(),
      traffic_used_gb: 12.4,
      traffic_limit_gb: 0,
      device_limit: 3,
      autopay_enabled: true,
    },
    {
      user_id: 2,
      telegram_id: 100200300,
      username: null,
      full_name: 'user892',
      tariff_name: 'Онлайн',
      status: 'expired',
      is_trial: false,
      end_date: new Date(Date.now() - 3 * 86400_000).toISOString(),
      traffic_used_gb: 48.1,
      traffic_limit_gb: 50,
      device_limit: 3,
      autopay_enabled: false,
    },
  ],
  total: 2,
  page: 1,
  total_pages: 1,
};

export const PREVIEW_TRANSACTIONS: PaginatedTransactions = {
  items: PREVIEW_USER_DETAIL.transactions,
  total: 1,
  page: 1,
  total_pages: 1,
};

export const PREVIEW_TRANSACTION_LIST: TransactionListResponse = {
  items: PREVIEW_USER_DETAIL.transactions.map((t, i) => ({
    ...t,
    user_id: PREVIEW_USER_DETAIL.id,
    telegram_id: PREVIEW_USER_DETAIL.telegram_id,
    username: PREVIEW_USER_DETAIL.username,
    full_name: PREVIEW_USER_DETAIL.full_name,
    payment_provider: t.type === 'subscription_payment' ? 'platega' : null,
    payment_external_id: t.type === 'subscription_payment' ? `preview-record-${i}` : null,
  })),
  total: PREVIEW_USER_DETAIL.transactions.length,
  page: 1,
  total_pages: 1,
};

export const PREVIEW_PLATEGA_RECONCILE: PlategaReconcileMap = { 'preview-record-0': 'CONFIRMED' };

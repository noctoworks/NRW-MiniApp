export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface SubscriptionOut {
  status: 'active' | 'expired' | 'disabled';
  end_date: string;
  traffic_limit_gb: number;
  traffic_used_gb: number;
  device_limit: number;
  subscription_url: string | null;
}

export interface DashboardResponse {
  balance_kopeks: number;
  subscription: SubscriptionOut | null;
  is_admin: boolean;
}

export interface PeriodOut {
  days: number;
  label: string;
  price_kopeks: number;
}

export interface PaymentMethodOut {
  id: string;
  label: string;
}

export interface TariffResponse {
  name: string;
  periods: PeriodOut[];
  payment_methods: PaymentMethodOut[];
}

export interface PurchaseResponse {
  status: 'success' | 'pending';
  payment_url: string | null;
  subscription: SubscriptionOut | null;
}

export interface ConnectButton {
  type: 'external' | 'subscriptionLink' | string;
  label: string;
  url: string;
}

export interface ConnectBlock {
  title: string;
  description: string;
  icon_key: string;
  icon_color: string;
  buttons: ConnectButton[];
}

export interface ConnectApp {
  id: string;
  name: string;
  featured: boolean;
  blocks: ConnectBlock[];
}

export interface ConnectPlatform {
  key: string;
  label: string;
  apps: ConnectApp[];
}

export interface ConnectAppsResponse {
  platforms: ConnectPlatform[];
}

export interface ReferralResponse {
  referral_link: string;
  percent: number;
  invited_count: number;
  earned_kopeks: number;
  invite_bonus_days: number;
}

export interface ProfileResponse {
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  language: string;
  balance_kopeks: number;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  type: string;
  amount_kopeks: number;
  status: string;
  description: string | null;
  created_at: string;
}

export interface PaginatedTransactionsResponse {
  items: TransactionItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface Device {
  hwid: string;
  platform: string;
  device_model: string;
  created_at: string | null;
}

export interface PromoCodeActivateResult {
  type: 'balance' | 'days' | string;
  value: number;
}

export interface GiftPurchaseResult {
  status: 'success' | 'pending';
  gift_link: string | null;
  payment_url: string | null;
}

export type AppLanguage = 'ru' | 'en';

// === Admin =====================================================================

export interface OverviewResponse {
  revenue_today_kopeks: number;
  revenue_7d_kopeks: number;
  revenue_30d_kopeks: number;
  revenue_all_time_kopeks: number;
  active_subscriptions: number;
  paying_subscriptions: number;
  new_paying_subscriptions_today: number;
  total_users: number;
  new_users_7d: number;
  conversion_percent: number;
  avg_check_kopeks: number;
  mrr_kopeks: number;
  arr_kopeks: number;
  churn_percent_30d: number;
  total_traffic_gb: number;
}

export interface Node {
  uuid: string;
  name: string;
  country_code: string;
  is_connected: boolean;
  is_disabled: boolean;
  traffic_used_gb: number;
}

export interface RecentPayment {
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  amount_kopeks: number;
  type: string;
  created_at: string;
}

export interface RevenuePoint {
  date: string;
  revenue_kopeks: number;
  count: number;
}

export interface TopPayer {
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  total_kopeks: number;
}

export interface LtvResponse {
  arpu_kopeks: number;
  avg_ltv_paying_kopeks: number;
  median_ltv_kopeks: number;
  paying_users_count: number;
  top_payers: TopPayer[];
}

export interface Cohort {
  cohort_month: string;
  users_count: number;
  revenue_per_user_by_month_offset: number[];
}

export interface CohortsResponse {
  max_months: number;
  cohorts: Cohort[];
}

export interface TopReferrer {
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  earnings_kopeks: number;
  referred_count: number;
}

export interface ReferralFunnelResponse {
  referred_users_count: number;
  referred_paying_count: number;
  conversion_percent: number;
  total_earnings_kopeks: number;
  top_referrers: TopReferrer[];
}

export interface AdminUserListItem {
  id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  is_blocked: boolean;
  has_active_subscription: boolean;
  is_trial: boolean;
  last_activity_at: string | null;
  created_at: string;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface AdminSubscription {
  status: string;
  end_date: string;
  traffic_limit_gb: number;
  traffic_used_gb: number;
  device_limit: number;
  is_trial: boolean;
}

export interface AdminTransaction {
  id: number;
  type: string;
  amount_kopeks: number;
  status: string;
  description: string | null;
  created_at: string;
}

export interface AdminUserDetail {
  id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  language: string;
  is_blocked: boolean;
  blocked_bot: boolean;
  balance_kopeks: number;
  created_at: string;
  last_activity_at: string | null;
  subscription: AdminSubscription | null;
  transactions: AdminTransaction[];
  referrals_invited_count: number;
  referrals_earned_kopeks: number;
  referral_commission_percent: number | null;
  promo_group_id: number | null;
  promo_group_name: string | null;
}

export type AdminUserFilter = 'all' | 'no_sub' | 'blocked' | 'blocked_bot';

export type SupportTicketStatus = 'open' | 'closed';

export interface SupportThread {
  ticket_id: number;
  status: SupportTicketStatus;
  assigned_admin_name: string | null;
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  last_message: string;
  last_message_at: string;
  unread: boolean;
}

export interface SupportMessage {
  id: number;
  direction: 'in' | 'out';
  body: string;
  created_at: string;
}

export interface SupportThreadDetail {
  ticket_id: number;
  status: SupportTicketStatus;
  assigned_admin_name: string | null;
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  messages: SupportMessage[];
}

export interface PromoGroup {
  id: number;
  name: string;
  discount_percent: number;
  users_count: number;
}

export type CampaignBonusType = 'balance' | 'subscription' | 'none';

export interface Campaign {
  id: number;
  name: string;
  start_parameter: string;
  bonus_type: CampaignBonusType;
  balance_bonus_kopeks: number;
  subscription_duration_days: number | null;
  is_active: boolean;
  deep_link: string;
}

export interface CampaignStats {
  registrations_count: number;
  paying_count: number;
  conversion_percent: number;
  revenue_kopeks: number;
}

export interface AdminDevice {
  hwid: string;
  platform: string;
  device_model: string;
  created_at: string | null;
}

export interface SyncResult {
  status: string;
  subscription: AdminSubscription | null;
}

export interface PaginatedTransactions {
  items: AdminTransaction[];
  total: number;
  page: number;
  total_pages: number;
}

export interface AdminTransactionListItem extends AdminTransaction {
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  payment_provider: string | null;
  payment_external_id: string | null;
}

/** recordId (== AdminTransactionListItem.payment_external_id для provider
 * 'platega') -> статус транзакции по версии Platega. */
export type PlategaReconcileMap = Record<string, string>;

export interface TransactionListResponse {
  items: AdminTransactionListItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface AdminTransactionDetail extends AdminTransactionListItem {
  payment_status: string | null;
  payment_raw_payload: Record<string, unknown> | null;
  provider_raw_response: Record<string, unknown> | null;
}

export type TransactionType = 'topup' | 'subscription_payment' | 'referral_reward' | 'refund' | 'gift';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type SubscriptionStatus = 'active' | 'expired' | 'disabled';

export type PromoCodeType = 'balance' | 'days';

export interface PromoCode {
  id: number;
  code: string;
  type: PromoCodeType;
  value: number;
  max_activations: number;
  activations_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminSubscriptionListItem {
  user_id: number;
  telegram_id: number;
  username: string | null;
  full_name: string | null;
  tariff_name: string;
  status: SubscriptionStatus;
  is_trial: boolean;
  end_date: string;
  traffic_used_gb: number;
  traffic_limit_gb: number;
  device_limit: number;
  autopay_enabled: boolean;
}

export interface SubscriptionListResponse {
  items: AdminSubscriptionListItem[];
  total: number;
  page: number;
  total_pages: number;
}

export interface PanelStats {
  cpu_cores: number;
  memory_used_bytes: number;
  memory_total_bytes: number;
  uptime_seconds: number;
  users_online_now: number;
  users_online_last_day: number;
  users_online_last_week: number;
  users_never_online: number;
  nodes_online: number;
  nodes_total_bytes_lifetime: number;
}

export interface NodeMetricStat {
  tag: string;
  upload: string;
  download: string;
}

export interface NodeMetric {
  node_uuid: string;
  node_name: string;
  users_online: number;
  inbound_stats: NodeMetricStat[];
  outbound_stats: NodeMetricStat[];
}

export interface MonitoringResponse {
  panel: PanelStats;
  nodes: NodeMetric[];
}

export interface UserNodeTraffic {
  node_uuid: string;
  node_name: string;
  country_code: string;
  total_bytes: number;
}

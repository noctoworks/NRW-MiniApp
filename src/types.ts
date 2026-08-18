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

// === Admin =====================================================================

export interface OverviewResponse {
  revenue_today_kopeks: number;
  revenue_7d_kopeks: number;
  revenue_30d_kopeks: number;
  active_subscriptions: number;
  total_users: number;
  new_users_7d: number;
  conversion_percent: number;
  avg_check_kopeks: number;
  mrr_kopeks: number;
  arr_kopeks: number;
  churn_percent_30d: number;
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
  is_blocked: boolean;
  has_active_subscription: boolean;
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

export interface PromoGroup {
  id: number;
  name: string;
  discount_percent: number;
  users_count: number;
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

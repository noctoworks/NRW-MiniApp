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

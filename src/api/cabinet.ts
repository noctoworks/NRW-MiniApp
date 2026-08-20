import { apiClient } from './client';
import {
  PREVIEW_CONNECT_APPS,
  PREVIEW_DASHBOARD,
  PREVIEW_DEVICES,
  PREVIEW_PROFILE,
  PREVIEW_REFERRAL,
  PREVIEW_TARIFF,
  PREVIEW_TRANSACTIONS,
} from '../lib/previewData';
import { useAuthStore } from '../store/auth';
import type {
  AppLanguage,
  ConnectAppsResponse,
  DashboardResponse,
  Device,
  GiftPurchaseResult,
  PaginatedTransactionsResponse,
  ProfileResponse,
  PromoCodeActivateResult,
  PurchaseResponse,
  ReferralResponse,
  TariffResponse,
} from '../types';

export async function getDashboard(): Promise<DashboardResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_DASHBOARD;
  const response = await apiClient.get<DashboardResponse>('/cabinet/dashboard');
  return response.data;
}

export async function getTariff(): Promise<TariffResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_TARIFF;
  const response = await apiClient.get<TariffResponse>('/cabinet/tariff');
  return response.data;
}

export async function purchaseSubscription(periodDays: number, method: string): Promise<PurchaseResponse> {
  if (useAuthStore.getState().isPreview) {
    return { status: 'success', payment_url: null, subscription: PREVIEW_DASHBOARD.subscription };
  }
  const response = await apiClient.post<PurchaseResponse>('/cabinet/subscription/purchase', {
    period_days: periodDays,
    method,
  });
  return response.data;
}

export async function getConnectApps(): Promise<ConnectAppsResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_CONNECT_APPS;
  const response = await apiClient.get<ConnectAppsResponse>('/cabinet/connect-apps');
  return response.data;
}

export async function getReferral(): Promise<ReferralResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_REFERRAL;
  const response = await apiClient.get<ReferralResponse>('/cabinet/referral');
  return response.data;
}

export async function getProfile(): Promise<ProfileResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_PROFILE;
  const response = await apiClient.get<ProfileResponse>('/cabinet/profile');
  return response.data;
}

export async function getTransactions(page: number): Promise<PaginatedTransactionsResponse> {
  if (useAuthStore.getState().isPreview) return PREVIEW_TRANSACTIONS;
  const response = await apiClient.get<PaginatedTransactionsResponse>('/cabinet/transactions', { params: { page } });
  return response.data;
}

export async function getDevices(): Promise<Device[]> {
  if (useAuthStore.getState().isPreview) return PREVIEW_DEVICES;
  const response = await apiClient.get<Device[]>('/cabinet/devices');
  return response.data;
}

export async function removeDevice(hwid: string): Promise<void> {
  if (useAuthStore.getState().isPreview) return;
  await apiClient.delete(`/cabinet/devices/${encodeURIComponent(hwid)}`);
}

export async function resetDevices(): Promise<void> {
  if (useAuthStore.getState().isPreview) return;
  await apiClient.delete('/cabinet/devices');
}

export async function activatePromoCode(code: string): Promise<PromoCodeActivateResult> {
  if (useAuthStore.getState().isPreview) return { type: 'balance', value: 10000 };
  const response = await apiClient.post<PromoCodeActivateResult>('/cabinet/promocode/activate', { code });
  return response.data;
}

export async function purchaseGift(periodDays: number, method: string): Promise<GiftPurchaseResult> {
  if (useAuthStore.getState().isPreview) {
    return { status: 'success', gift_link: 'https://t.me/nocto_radarobot?start=gift_DEMO1234', payment_url: null };
  }
  const response = await apiClient.post<GiftPurchaseResult>('/cabinet/gift/purchase', {
    period_days: periodDays,
    method,
  });
  return response.data;
}

export async function setLanguage(language: AppLanguage): Promise<AppLanguage> {
  if (useAuthStore.getState().isPreview) return language;
  const response = await apiClient.post<{ language: AppLanguage }>('/cabinet/settings/language', { language });
  return response.data.language;
}

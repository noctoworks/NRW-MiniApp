import { apiClient } from './client';
import { PREVIEW_DASHBOARD, PREVIEW_TARIFF } from '../lib/previewData';
import { useAuthStore } from '../store/auth';
import type { DashboardResponse, PurchaseResponse, TariffResponse } from '../types';

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

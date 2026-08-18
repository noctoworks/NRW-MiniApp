import { apiClient } from './client';
import {
  PREVIEW_COHORTS,
  PREVIEW_LTV,
  PREVIEW_OVERVIEW,
  PREVIEW_REFERRAL_FUNNEL,
  PREVIEW_REVENUE_TIMESERIES,
  PREVIEW_USER_DETAIL,
  PREVIEW_USERS_LIST,
} from '../lib/previewAdminData';
import { useAuthStore } from '../store/auth';
import type {
  AdminUserDetail,
  AdminUserFilter,
  AdminUserListResponse,
  CohortsResponse,
  LtvResponse,
  OverviewResponse,
  ReferralFunnelResponse,
  RevenuePoint,
} from '../types';

function isPreview(): boolean {
  return useAuthStore.getState().isPreview;
}

export async function getOverview(): Promise<OverviewResponse> {
  if (isPreview()) return PREVIEW_OVERVIEW;
  return (await apiClient.get<OverviewResponse>('/cabinet/admin/overview')).data;
}

export async function getRevenueTimeseries(days = 30): Promise<RevenuePoint[]> {
  if (isPreview()) return PREVIEW_REVENUE_TIMESERIES;
  return (await apiClient.get<RevenuePoint[]>('/cabinet/admin/revenue-timeseries', { params: { days } })).data;
}

export async function getLtv(): Promise<LtvResponse> {
  if (isPreview()) return PREVIEW_LTV;
  return (await apiClient.get<LtvResponse>('/cabinet/admin/ltv')).data;
}

export async function getCohorts(): Promise<CohortsResponse> {
  if (isPreview()) return PREVIEW_COHORTS;
  return (await apiClient.get<CohortsResponse>('/cabinet/admin/cohorts')).data;
}

export async function getReferralFunnel(): Promise<ReferralFunnelResponse> {
  if (isPreview()) return PREVIEW_REFERRAL_FUNNEL;
  return (await apiClient.get<ReferralFunnelResponse>('/cabinet/admin/referrals')).data;
}

export async function listUsers(params: {
  query?: string;
  filter?: AdminUserFilter;
  page?: number;
}): Promise<AdminUserListResponse> {
  if (isPreview()) return PREVIEW_USERS_LIST;
  return (await apiClient.get<AdminUserListResponse>('/cabinet/admin/users', { params })).data;
}

export async function getUserDetail(id: number): Promise<AdminUserDetail> {
  if (isPreview()) return PREVIEW_USER_DETAIL;
  return (await apiClient.get<AdminUserDetail>(`/cabinet/admin/users/${id}`)).data;
}

export async function adjustBalance(id: number, amountRub: number): Promise<AdminUserDetail> {
  if (isPreview()) return PREVIEW_USER_DETAIL;
  return (await apiClient.post<AdminUserDetail>(`/cabinet/admin/users/${id}/balance`, { amount_rub: amountRub })).data;
}

export async function toggleBlock(id: number, blocked: boolean): Promise<AdminUserDetail> {
  if (isPreview()) return { ...PREVIEW_USER_DETAIL, is_blocked: blocked };
  return (await apiClient.post<AdminUserDetail>(`/cabinet/admin/users/${id}/block`, { blocked })).data;
}

export async function messageUser(id: number, text: string): Promise<{ status: string }> {
  if (isPreview()) return { status: 'sent' };
  return (await apiClient.post<{ status: string }>(`/cabinet/admin/users/${id}/message`, { text })).data;
}

export async function massban(telegramIds: number[]): Promise<{ blocked_count: number; requested_count: number }> {
  if (isPreview()) return { blocked_count: telegramIds.length, requested_count: telegramIds.length };
  return (
    await apiClient.post<{ blocked_count: number; requested_count: number }>('/cabinet/admin/users/massban', {
      telegram_ids: telegramIds,
    })
  ).data;
}

export async function deleteUser(id: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'anonymized' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/users/${id}`)).data;
}

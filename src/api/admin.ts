import { apiClient } from './client';
import {
  PREVIEW_CAMPAIGN_STATS,
  PREVIEW_CAMPAIGNS,
  PREVIEW_COHORTS,
  PREVIEW_DEVICES,
  PREVIEW_LTV,
  PREVIEW_OVERVIEW,
  PREVIEW_PROMO_GROUPS,
  PREVIEW_REFERRAL_FUNNEL,
  PREVIEW_REVENUE_TIMESERIES,
  PREVIEW_TRANSACTIONS,
  PREVIEW_USER_DETAIL,
  PREVIEW_USERS_LIST,
} from '../lib/previewAdminData';
import { useAuthStore } from '../store/auth';
import type {
  AdminDevice,
  AdminUserDetail,
  AdminUserFilter,
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
  SyncResult,
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

export async function adjustSubscriptionDays(id: number, days: number): Promise<AdminUserDetail> {
  if (isPreview()) return PREVIEW_USER_DETAIL;
  return (await apiClient.post<AdminUserDetail>(`/cabinet/admin/users/${id}/subscription-days`, { days })).data;
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

export async function getUserTransactions(id: number, page: number): Promise<PaginatedTransactions> {
  if (isPreview()) return PREVIEW_TRANSACTIONS;
  return (await apiClient.get<PaginatedTransactions>(`/cabinet/admin/users/${id}/transactions`, { params: { page } })).data;
}

export async function setReferralCommission(id: number, commissionPercent: number | null): Promise<AdminUserDetail> {
  if (isPreview()) return { ...PREVIEW_USER_DETAIL, referral_commission_percent: commissionPercent };
  return (
    await apiClient.post<AdminUserDetail>(`/cabinet/admin/users/${id}/referral-commission`, {
      commission_percent: commissionPercent,
    })
  ).data;
}

export async function getUserDevices(id: number): Promise<AdminDevice[]> {
  if (isPreview()) return PREVIEW_DEVICES;
  return (await apiClient.get<AdminDevice[]>(`/cabinet/admin/users/${id}/devices`)).data;
}

export async function removeDevice(id: number, hwid: string): Promise<{ status: string }> {
  if (isPreview()) return { status: 'removed' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/users/${id}/devices/${hwid}`)).data;
}

export async function resetDevices(id: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'reset' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/users/${id}/devices`)).data;
}

export async function syncFromPanel(id: number): Promise<SyncResult> {
  if (isPreview()) return { status: 'synced', subscription: PREVIEW_USER_DETAIL.subscription };
  return (await apiClient.post<SyncResult>(`/cabinet/admin/users/${id}/sync/from-panel`)).data;
}

export async function syncToPanel(id: number): Promise<SyncResult> {
  if (isPreview()) return { status: 'synced', subscription: PREVIEW_USER_DETAIL.subscription };
  return (await apiClient.post<SyncResult>(`/cabinet/admin/users/${id}/sync/to-panel`)).data;
}

export async function listPromoGroups(): Promise<PromoGroup[]> {
  if (isPreview()) return PREVIEW_PROMO_GROUPS;
  return (await apiClient.get<PromoGroup[]>('/cabinet/admin/promo-groups')).data;
}

export async function createPromoGroup(name: string, discountPercent: number): Promise<PromoGroup> {
  if (isPreview()) return { id: Date.now(), name, discount_percent: discountPercent, users_count: 0 };
  return (
    await apiClient.post<PromoGroup>('/cabinet/admin/promo-groups', { name, discount_percent: discountPercent })
  ).data;
}

export async function updatePromoGroup(
  id: number,
  payload: { name?: string; discount_percent?: number },
): Promise<PromoGroup> {
  if (isPreview()) return { id, name: payload.name ?? 'Группа', discount_percent: payload.discount_percent ?? 0, users_count: 0 };
  return (await apiClient.patch<PromoGroup>(`/cabinet/admin/promo-groups/${id}`, payload)).data;
}

export async function deletePromoGroup(id: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'deleted' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/promo-groups/${id}`)).data;
}

export async function setUserPromoGroup(userId: number, promoGroupId: number | null): Promise<AdminUserDetail> {
  if (isPreview()) return { ...PREVIEW_USER_DETAIL, promo_group_id: promoGroupId };
  return (
    await apiClient.post<AdminUserDetail>(`/cabinet/admin/users/${userId}/promo-group`, {
      promo_group_id: promoGroupId,
    })
  ).data;
}

export async function listCampaigns(): Promise<Campaign[]> {
  if (isPreview()) return PREVIEW_CAMPAIGNS;
  return (await apiClient.get<Campaign[]>('/cabinet/admin/campaigns')).data;
}

export async function createCampaign(payload: {
  name: string;
  start_parameter: string;
  bonus_type: string;
  balance_bonus_kopeks?: number;
  subscription_duration_days?: number | null;
}): Promise<Campaign> {
  if (isPreview()) return { ...PREVIEW_CAMPAIGNS[0], ...payload, id: Date.now() } as Campaign;
  return (await apiClient.post<Campaign>('/cabinet/admin/campaigns', payload)).data;
}

export async function updateCampaign(
  id: number,
  payload: { name?: string; is_active?: boolean; balance_bonus_kopeks?: number; subscription_duration_days?: number | null },
): Promise<Campaign> {
  if (isPreview()) return { ...PREVIEW_CAMPAIGNS[0], ...payload };
  return (await apiClient.patch<Campaign>(`/cabinet/admin/campaigns/${id}`, payload)).data;
}

export async function deleteCampaign(id: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'deleted' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/campaigns/${id}`)).data;
}

export async function getCampaignStats(id: number): Promise<CampaignStats> {
  if (isPreview()) return PREVIEW_CAMPAIGN_STATS;
  return (await apiClient.get<CampaignStats>(`/cabinet/admin/campaigns/${id}/stats`)).data;
}

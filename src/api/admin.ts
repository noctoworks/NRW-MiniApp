import { apiClient } from './client';
import {
  PREVIEW_ALERTS,
  PREVIEW_CAMPAIGN_STATS,
  PREVIEW_CAMPAIGNS,
  PREVIEW_COHORTS,
  PREVIEW_DEVICES,
  PREVIEW_INFRA_BILLING,
  PREVIEW_LTV,
  PREVIEW_MONITORING,
  PREVIEW_NET_PROFIT,
  PREVIEW_OVERVIEW,
  PREVIEW_NODES,
  PREVIEW_PLATEGA_RECONCILE,
  PREVIEW_PROMO_CODES,
  PREVIEW_PROMO_GROUPS,
  PREVIEW_RECENT_PAYMENTS,
  PREVIEW_REFERRAL_FUNNEL,
  PREVIEW_REVENUE_TIMESERIES,
  PREVIEW_SALES_BREAKDOWN,
  PREVIEW_SUBSCRIPTION_LIST,
  PREVIEW_SUBSCRIPTION_PULSE,
  PREVIEW_SUPPORT_THREAD_DETAIL,
  PREVIEW_SUPPORT_THREADS,
  PREVIEW_TRANSACTION_LIST,
  PREVIEW_USER_NODE_TRAFFIC,
  PREVIEW_TRANSACTIONS,
  PREVIEW_USER_DETAIL,
  PREVIEW_USERS_LIST,
} from '../lib/previewAdminData';
import { useAuthStore } from '../store/auth';
import type {
  Alert,
  AdminDevice,
  AdminTransactionDetail,
  AdminUserDetail,
  AdminUserFilter,
  AdminUserListResponse,
  Campaign,
  CampaignStats,
  CohortsResponse,
  InfraBilling,
  LtvResponse,
  MonitoringResponse,
  NetProfit,
  Node,
  OverviewResponse,
  PaginatedTransactions,
  PlategaReconcileMap,
  PromoCode,
  PromoCodeType,
  PromoGroup,
  RecentPayment,
  ReferralFunnelResponse,
  RevenuePoint,
  SalesBreakdown,
  SubscriptionListResponse,
  SubscriptionPulse,
  SubscriptionStatus,
  SupportThread,
  SupportThreadDetail,
  SyncResult,
  TransactionListResponse,
  TransactionStatus,
  TransactionType,
  UserNodeTraffic,
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

export async function getRecentPayments(limit = 10): Promise<RecentPayment[]> {
  if (isPreview()) return PREVIEW_RECENT_PAYMENTS;
  return (await apiClient.get<RecentPayment[]>('/cabinet/admin/recent-payments', { params: { limit } })).data;
}

export async function getNodes(): Promise<Node[]> {
  if (isPreview()) return PREVIEW_NODES;
  return (await apiClient.get<Node[]>('/cabinet/admin/nodes')).data;
}

export async function enableNode(uuid: string): Promise<Node> {
  if (isPreview()) return { ...(PREVIEW_NODES.find((n) => n.uuid === uuid) ?? PREVIEW_NODES[0]), is_disabled: false };
  return (await apiClient.post<Node>(`/cabinet/admin/nodes/${uuid}/enable`)).data;
}

export async function disableNode(uuid: string): Promise<Node> {
  if (isPreview()) return { ...(PREVIEW_NODES.find((n) => n.uuid === uuid) ?? PREVIEW_NODES[0]), is_disabled: true };
  return (await apiClient.post<Node>(`/cabinet/admin/nodes/${uuid}/disable`)).data;
}

export async function restartNode(uuid: string): Promise<{ status: string }> {
  if (isPreview()) return { status: 'accepted' };
  return (await apiClient.post<{ status: string }>(`/cabinet/admin/nodes/${uuid}/restart`)).data;
}

export async function getInfraBilling(): Promise<InfraBilling> {
  if (isPreview()) return PREVIEW_INFRA_BILLING;
  return (await apiClient.get<InfraBilling>('/cabinet/admin/infra-billing')).data;
}

export async function getNetProfit(): Promise<NetProfit> {
  if (isPreview()) return PREVIEW_NET_PROFIT;
  return (await apiClient.get<NetProfit>('/cabinet/admin/net-profit')).data;
}

export async function getMonitoring(): Promise<MonitoringResponse> {
  if (isPreview()) return PREVIEW_MONITORING;
  return (await apiClient.get<MonitoringResponse>('/cabinet/admin/monitoring')).data;
}

export async function getSalesBreakdown(): Promise<SalesBreakdown> {
  if (isPreview()) return PREVIEW_SALES_BREAKDOWN;
  return (await apiClient.get<SalesBreakdown>('/cabinet/admin/sales-breakdown')).data;
}

export async function getAlerts(): Promise<Alert[]> {
  if (isPreview()) return PREVIEW_ALERTS;
  return (await apiClient.get<Alert[]>('/cabinet/admin/alerts')).data;
}

export async function getSubscriptionPulse(): Promise<SubscriptionPulse> {
  if (isPreview()) return PREVIEW_SUBSCRIPTION_PULSE;
  return (await apiClient.get<SubscriptionPulse>('/cabinet/admin/subscription-pulse')).data;
}

export async function listTransactions(params: {
  query?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
}): Promise<TransactionListResponse> {
  if (isPreview()) return PREVIEW_TRANSACTION_LIST;
  return (await apiClient.get<TransactionListResponse>('/cabinet/admin/transactions', { params })).data;
}

export async function getTransactionDetail(id: number): Promise<AdminTransactionDetail> {
  if (isPreview()) return { ...PREVIEW_TRANSACTION_LIST.items[0], payment_status: 'success', payment_raw_payload: null, provider_raw_response: { status: 'CONFIRMED', id: 'preview-record-0' } };
  return (await apiClient.get<AdminTransactionDetail>(`/cabinet/admin/transactions/${id}`)).data;
}

export async function getPlategaReconcile(days = 7): Promise<PlategaReconcileMap> {
  if (isPreview()) return PREVIEW_PLATEGA_RECONCILE;
  return (await apiClient.get<PlategaReconcileMap>('/cabinet/admin/transactions/platega-reconcile', { params: { days } })).data;
}

export async function listSubscriptions(params: {
  query?: string;
  status?: SubscriptionStatus;
  page?: number;
}): Promise<SubscriptionListResponse> {
  if (isPreview()) return PREVIEW_SUBSCRIPTION_LIST;
  return (await apiClient.get<SubscriptionListResponse>('/cabinet/admin/subscriptions', { params })).data;
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

export async function listSupportThreads(): Promise<SupportThread[]> {
  if (isPreview()) return PREVIEW_SUPPORT_THREADS;
  return (await apiClient.get<SupportThread[]>('/cabinet/admin/support/threads')).data;
}

export async function getSupportThread(ticketId: number): Promise<SupportThreadDetail> {
  if (isPreview()) return PREVIEW_SUPPORT_THREAD_DETAIL;
  return (await apiClient.get<SupportThreadDetail>(`/cabinet/admin/support/threads/${ticketId}`)).data;
}

export async function replySupportThread(ticketId: number, text: string): Promise<{ status: string }> {
  if (isPreview()) return { status: 'sent' };
  return (
    await apiClient.post<{ status: string }>(`/cabinet/admin/support/threads/${ticketId}/reply`, { text })
  ).data;
}

export async function closeSupportTicket(ticketId: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'closed' };
  return (await apiClient.post<{ status: string }>(`/cabinet/admin/support/threads/${ticketId}/close`)).data;
}

export async function reopenSupportTicket(ticketId: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'open' };
  return (await apiClient.post<{ status: string }>(`/cabinet/admin/support/threads/${ticketId}/reopen`)).data;
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

export async function getUserTrafficByNode(id: number, days = 30): Promise<UserNodeTraffic[]> {
  if (isPreview()) return PREVIEW_USER_NODE_TRAFFIC;
  return (await apiClient.get<UserNodeTraffic[]>(`/cabinet/admin/users/${id}/traffic-by-node`, { params: { days } })).data;
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

export async function listPromoCodes(): Promise<PromoCode[]> {
  if (isPreview()) return PREVIEW_PROMO_CODES;
  return (await apiClient.get<PromoCode[]>('/cabinet/admin/promo-codes')).data;
}

export async function createPromoCode(payload: {
  code: string;
  type: PromoCodeType;
  value: number;
  max_activations: number;
}): Promise<PromoCode> {
  if (isPreview()) {
    return { id: Date.now(), activations_count: 0, expires_at: null, is_active: true, created_at: new Date().toISOString(), ...payload };
  }
  return (await apiClient.post<PromoCode>('/cabinet/admin/promo-codes', payload)).data;
}

export async function updatePromoCode(id: number, payload: { is_active: boolean }): Promise<PromoCode> {
  if (isPreview()) return { ...PREVIEW_PROMO_CODES[0], ...payload };
  return (await apiClient.patch<PromoCode>(`/cabinet/admin/promo-codes/${id}`, payload)).data;
}

export async function deletePromoCode(id: number): Promise<{ status: string }> {
  if (isPreview()) return { status: 'deleted' };
  return (await apiClient.delete<{ status: string }>(`/cabinet/admin/promo-codes/${id}`)).data;
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

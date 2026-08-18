import { apiClient } from './client';

export async function loginTelegram(initData: string): Promise<string> {
  const response = await apiClient.post<{ access_token: string }>('/cabinet/auth/telegram', {
    init_data: initData,
  });
  return response.data.access_token;
}

import { apiClient } from '../lib/api';
import { Proxy } from '../types';
import { API_ENDPOINTS } from '../config/constants';

export const proxyService = {
  async getProxies(): Promise<Proxy[]> {
    const result = await apiClient.get<Proxy[]>(API_ENDPOINTS.PROXIES.LIST);
    return result.data || [];
  },

  async createProxy(data: Omit<Proxy, 'id'>): Promise<Proxy> {
    const result = await apiClient.post<Proxy>(API_ENDPOINTS.PROXIES.CREATE, data);
    if (result.error) throw new Error(result.error);
    return result.data!;
  },

  async updateProxy(id: string, data: Partial<Proxy>): Promise<Proxy> {
    const result = await apiClient.put<Proxy>(API_ENDPOINTS.PROXIES.UPDATE(id), data);
    if (result.error) throw new Error(result.error);
    return result.data!;
  },

  async deleteProxy(id: string): Promise<void> {
    const result = await apiClient.delete(API_ENDPOINTS.PROXIES.DELETE(id));
    if (result.error) throw new Error(result.error);
  },

  async testProxy(id: string): Promise<{ status: string; latency: number }> {
    const result = await apiClient.get(API_ENDPOINTS.PROXIES.TEST(id));
    if (result.error) throw new Error(result.error);
    return result.data!;
  }
};

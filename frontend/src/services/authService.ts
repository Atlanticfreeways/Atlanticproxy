import { apiClient } from '../lib/api';
import { User } from '../types';
import { API_ENDPOINTS } from '../config/constants';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const result = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (result.error) throw new Error(result.error);
    return result.data!;
  },

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const result = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, password, name });
    if (result.error) throw new Error(result.error);
    return result.data!;
  },

  async logout(): Promise<void> {
    const result = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    if (result.error) throw new Error(result.error);
  },

  async refreshToken(): Promise<{ token: string }> {
    const result = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {});
    if (result.error) throw new Error(result.error);
    return result.data!;
  }
};

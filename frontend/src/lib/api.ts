const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company?: string;
  }) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async getProfile() {
    return this.request('/api/users/profile');
  }

  async getDashboardStats() {
    return this.request('/api/users/dashboard-stats');
  }

  async getProxies() {
    return this.request('/api/proxies');
  }

  async createProxy(proxyData: { type: string; country?: string; city?: string }) {
    return this.request('/api/proxies', {
      method: 'POST',
      body: JSON.stringify(proxyData),
    });
  }

  async deleteProxy(id: number) {
    return this.request(`/api/proxies/${id}`, {
      method: 'DELETE',
    });
  }

  async getReferralStats() {
    return this.request('/api/referrals/stats');
  }

  async generateReferralCode() {
    return this.request('/api/referrals/generate-code', {
      method: 'POST',
    });
  }

  async getBillingOverview() {
    return this.request('/api/billing/overview');
  }

  async getPlans() {
    return this.request('/api/billing/plans');
  }

  async subscribe(planName: string) {
    return this.request('/api/billing/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planName }),
    });
  }

  async cancelSubscription() {
    return this.request('/api/billing/cancel', {
      method: 'POST',
    });
  }

  async payInvoice(invoiceId: number) {
    return this.request(`/api/billing/invoices/${invoiceId}/pay`, {
      method: 'POST',
    });
  }

  async getSupportTickets() {
    return this.request('/api/support/tickets');
  }

  async createSupportTicket(ticketData: { subject: string; message: string; priority: string }) {
    return this.request('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async getAdminUsers(params?: { role?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/admin/users${query ? '?' + query : ''}`);
  }

  async updateUserRole(userId: number, role: string) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async applyForReseller(applicationData: any) {
    return this.request('/api/reseller/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getResellerApplication() {
    return this.request('/api/reseller/application');
  }

  async getResellerDashboard() {
    return this.request('/api/reseller/dashboard');
  }

  async getResellerCustomers(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/reseller/customers${query}`);
  }

  async getMarketingMaterials(type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/reseller/marketing-materials${query}`);
  }

  async getUsageAnalytics(period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/analytics/usage${query}`);
  }

  async getEnterpriseDashboard() {
    return this.request('/api/enterprise/dashboard');
  }

  async getSLAMetrics(period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/enterprise/sla-metrics${query}`);
  }

  async getPerformanceMetrics(period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/enterprise/performance-metrics${query}`);
  }

  async getWhiteLabelConfig() {
    return this.request('/api/whitelabel/config');
  }

  async saveWhiteLabelConfig(config: any) {
    return this.request('/api/whitelabel/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async activateWhiteLabel() {
    return this.request('/api/whitelabel/config/activate', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
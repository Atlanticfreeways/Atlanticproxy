/**
 * Proxy API Client
 * Handles all API calls for proxy-related operations
 */

import { ProxyProtocol, ISPTier } from '@/components/billing/types/ProxyCustomization';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface CustomizationRequest {
  planId: string;
  protocol: ProxyProtocol;
  ispTier: ISPTier;
  billingCycle: 'monthly' | 'annual';
}

export interface CheckoutRequest {
  planId: string;
  protocol: ProxyProtocol;
  ispTier: ISPTier;
  billingCycle: 'monthly' | 'annual';
  paymentMethodId: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'crypto';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl: string;
}

export interface ProxyLocation {
  id: string;
  country: string;
  city: string;
  region: string;
  servers: number;
  latency: number;
  uptime: number;
  available: boolean;
}

export interface NotificationSettings {
  emailNotifications: {
    dailyReport: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    usageAlerts: boolean;
    billingAlerts: boolean;
    securityAlerts: boolean;
    maintenanceNotices: boolean;
    newFeatures: boolean;
    reportTime: string;
  };
  pushNotifications: {
    enabled: boolean;
    connectionStatus: boolean;
    usageAlerts: boolean;
    billingAlerts: boolean;
    securityAlerts: boolean;
    sound: boolean;
    badge: boolean;
  };
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Billing API
export const billingApi = {
  // Get pricing for customization
  calculatePrice: async (customization: CustomizationRequest) => {
    return apiCall<{ totalPrice: number; breakdown: Record<string, number> }>(
      '/billing/calculate-price',
      {
        method: 'POST',
        body: JSON.stringify(customization),
      }
    );
  },

  // Process checkout
  checkout: async (request: CheckoutRequest) => {
    return apiCall<{ orderId: string; status: string }>(
      '/billing/checkout',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  },

  // Get payment methods
  getPaymentMethods: async () => {
    return apiCall<PaymentMethod[]>('/billing/payment-methods');
  },

  // Add payment method
  addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>) => {
    return apiCall<PaymentMethod>('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify(method),
    });
  },

  // Delete payment method
  deletePaymentMethod: async (id: string) => {
    return apiCall<{ success: boolean }>(
      `/billing/payment-methods/${id}`,
      { method: 'DELETE' }
    );
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string) => {
    return apiCall<{ success: boolean }>(
      `/billing/payment-methods/${id}/default`,
      { method: 'PUT' }
    );
  },

  // Get invoices
  getInvoices: async (filters?: { status?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiCall<Invoice[]>(
      `/billing/invoices?${params.toString()}`
    );
  },

  // Download invoice
  downloadInvoice: async (id: string) => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/billing/invoices/${id}/download`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  },

  // Get cost analysis
  getCostAnalysis: async (period: 'week' | 'month' | 'year') => {
    return apiCall<{
      totalCost: number;
      avgCost: number;
      maxCost: number;
      data: Array<{ date: string; cost: number; bandwidth: number }>;
    }>(`/billing/cost-analysis?period=${period}`);
  },
};

// Proxy Configuration API
export const proxyApi = {
  // Get proxy locations
  getLocations: async () => {
    return apiCall<ProxyLocation[]>('/proxy/locations');
  },

  // Get location by region
  getLocationsByRegion: async (region: string) => {
    return apiCall<ProxyLocation[]>(
      `/proxy/locations?region=${region}`
    );
  },

  // Save proxy configuration
  saveConfiguration: async (config: {
    protocol: ProxyProtocol;
    ispTier: ISPTier;
    locations: string[];
    loadBalancingMode: string;
  }) => {
    return apiCall<{ success: boolean; configId: string }>(
      '/proxy/configuration',
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  },

  // Get proxy configuration
  getConfiguration: async () => {
    return apiCall<any>('/proxy/configuration');
  },

  // Update session settings
  updateSessionSettings: async (settings: {
    enabled: boolean;
    sessionDuration: number;
    sessionTimeout: number;
    ipStickiness: boolean;
    cookiePreservation: boolean;
    headerPreservation: boolean;
  }) => {
    return apiCall<{ success: boolean }>(
      '/proxy/session-settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
  },

  // Update custom headers
  updateCustomHeaders: async (headers: Array<{ name: string; value: string; enabled: boolean }>) => {
    return apiCall<{ success: boolean }>(
      '/proxy/custom-headers',
      {
        method: 'PUT',
        body: JSON.stringify({ headers }),
      }
    );
  },

  // Update throttling settings
  updateThrottlingSettings: async (settings: {
    enabled: boolean;
    requestsPerSecond: number;
    burstSize: number;
    delayBetweenRequests: number;
    connectionLimit: number;
    bandwidthLimit: number;
  }) => {
    return apiCall<{ success: boolean }>(
      '/proxy/throttling-settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
  },

  // Update proxy authentication
  updateProxyAuth: async (credentials: {
    username: string;
    password: string;
    authMethod: 'basic' | 'digest' | 'bearer';
  }) => {
    return apiCall<{ success: boolean }>(
      '/proxy/authentication',
      {
        method: 'PUT',
        body: JSON.stringify(credentials),
      }
    );
  },
};

// Account API
export const accountApi = {
  // Get account security info
  getSecurityInfo: async () => {
    return apiCall<{
      lastLogin: string;
      lastLoginIP: string;
      lastPasswordChange: string;
      twoFactorEnabled: boolean;
      activeDevices: number;
      loginAttempts: number;
    }>('/account/security');
  },

  // Get active sessions
  getActiveSessions: async () => {
    return apiCall<Array<{
      device: string;
      ip: string;
      lastActive: string;
      current: boolean;
    }>>('/account/sessions');
  },

  // Logout device
  logoutDevice: async (sessionId: string) => {
    return apiCall<{ success: boolean }>(
      `/account/sessions/${sessionId}`,
      { method: 'DELETE' }
    );
  },

  // Logout all devices
  logoutAllDevices: async () => {
    return apiCall<{ success: boolean }>(
      '/account/sessions/logout-all',
      { method: 'POST' }
    );
  },

  // Delete account
  deleteAccount: async (password: string) => {
    return apiCall<{ success: boolean }>(
      '/account/delete',
      {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      }
    );
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiCall<{ success: boolean }>(
      '/account/change-password',
      {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      }
    );
  },
};

// Notifications API
export const notificationsApi = {
  // Get notification settings
  getSettings: async () => {
    return apiCall<NotificationSettings>(
      '/notifications/settings'
    );
  },

  // Update notification settings
  updateSettings: async (settings: NotificationSettings) => {
    return apiCall<{ success: boolean }>(
      '/notifications/settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
  },

  // Update email settings
  updateEmailSettings: async (settings: NotificationSettings['emailNotifications']) => {
    return apiCall<{ success: boolean }>(
      '/notifications/email-settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
  },

  // Update push settings
  updatePushSettings: async (settings: NotificationSettings['pushNotifications']) => {
    return apiCall<{ success: boolean }>(
      '/notifications/push-settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      }
    );
  },

  // Request push permission
  requestPushPermission: async () => {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return 'denied';
  },
};

// Analytics API
export const analyticsApi = {
  // Export data
  exportData: async (options: {
    format: 'csv' | 'json' | 'pdf';
    dateRange: 'week' | 'month' | 'year' | 'custom';
    includeMetrics: boolean;
    includeBilling: boolean;
    includeConnections: boolean;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await fetch(
      `${API_BASE_URL}/analytics/export`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Get usage trends
  getUsageTrends: async (period: 'week' | 'month' | 'year') => {
    return apiCall<Array<{
      date: string;
      bandwidth: number;
      requests: number;
      avgLatency: number;
    }>>(`/analytics/usage-trends?period=${period}`);
  },

  // Get connection metrics
  getConnectionMetrics: async () => {
    return apiCall<{
      totalConnections: number;
      activeConnections: number;
      avgLatency: number;
      successRate: number;
    }>('/analytics/connection-metrics');
  },
};

export default {
  billing: billingApi,
  proxy: proxyApi,
  account: accountApi,
  notifications: notificationsApi,
  analytics: analyticsApi,
};

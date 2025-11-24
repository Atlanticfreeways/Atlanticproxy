const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_live_8343a640da758f9d4780b509513a5f3f131071a3';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const message = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, data);
  }
  
  return data;
}

// Retry logic for failed requests
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0 && (error instanceof TypeError || error instanceof Error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export const api = {
  async register(email: string, password: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Network error. Please check if the backend is running.');
    }
  },

  async login(email: string, password: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Invalid email or password');
        throw error;
      }
      throw new Error('Network error. Please check if the backend is running.');
    }
  },

  async getMe(token: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Session expired. Please login again.');
        throw error;
      }
      throw new Error('Failed to authenticate. Please login again.');
    }
  },

  async connectProxy(token: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/proxy/connect`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Session expired. Please login again.');
        if (error.status === 429) throw new Error('Too many connection attempts. Please wait.');
        throw error;
      }
      throw new Error('Failed to connect to proxy. Please try again.');
    }
  },

  async getProxyStatus(token: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/proxy/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Session expired. Please login again.');
        throw error;
      }
      throw new Error('Failed to get proxy status.');
    }
  },

  async disconnectProxy(token: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/proxy/disconnect`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Session expired. Please login again.');
        throw error;
      }
      throw new Error('Failed to disconnect from proxy.');
    }
  },

  async getUsageStats(token: string) {
    try {
      const res = await fetchWithRetry(`${API_URL}/usage/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Session expired. Please login again.');
        throw error;
      }
      throw new Error('Failed to get usage stats.');
    }
  },

  async healthCheck() {
    try {
      const res = await fetch(`${API_URL}/health`);
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Backend is not responding.');
    }
  },

  // Billing endpoints
  async getPlans() {
    try {
      const res = await fetch(`${API_URL}/billing/plans`);
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get plans.');
    }
  },

  async subscribe(planId: string) {
    try {
      const res = await fetch(`${API_URL}/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to subscribe.');
    }
  },

  async getInvoices(token: string) {
    try {
      const res = await fetch(`${API_URL}/billing/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get invoices.');
    }
  },

  async addPaymentMethod(token: string, method: any) {
    try {
      const res = await fetch(`${API_URL}/billing/payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(method),
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to add payment method.');
    }
  },

  async getPaymentMethods(token: string) {
    try {
      const res = await fetch(`${API_URL}/billing/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get payment methods.');
    }
  },

  // Notifications endpoints
  async getNotificationSettings(token: string) {
    try {
      const res = await fetch(`${API_URL}/notifications/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get notification settings.');
    }
  },

  async updateNotificationSettings(token: string, settings: any) {
    try {
      const res = await fetch(`${API_URL}/notifications/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to update notification settings.');
    }
  },

  async sendTestEmail(token: string) {
    try {
      const res = await fetch(`${API_URL}/notifications/test-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to send test email.');
    }
  },

  // Analytics endpoints
  async getUsageTrends(token: string, period: string = 'month') {
    try {
      const res = await fetch(`${API_URL}/analytics/usage-trends?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get usage trends.');
    }
  },

  async getCostAnalysis(token: string) {
    try {
      const res = await fetch(`${API_URL}/analytics/cost-analysis`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get cost analysis.');
    }
  },

  async exportData(token: string, format: string = 'csv') {
    try {
      const res = await fetch(`${API_URL}/analytics/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to export data.');
    }
  },

  // Account endpoints
  async getSecurityInfo(token: string) {
    try {
      const res = await fetch(`${API_URL}/account/security`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get security info.');
    }
  },

  async changePassword(token: string, oldPassword: string, newPassword: string) {
    try {
      const res = await fetch(`${API_URL}/account/password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to change password.');
    }
  },

  async enable2FA(token: string) {
    try {
      const res = await fetch(`${API_URL}/account/2fa/enable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to enable 2FA.');
    }
  },

  async deleteAccount(token: string) {
    try {
      const res = await fetch(`${API_URL}/account/delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to delete account.');
    }
  },

  // Referral endpoints
  async getReferralCode(token: string) {
    try {
      const res = await fetch(`${API_URL}/referrals/code`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get referral code.');
    }
  },

  async getReferralHistory(token: string) {
    try {
      const res = await fetch(`${API_URL}/referrals/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to get referral history.');
    }
  },

  async claimPayout(token: string) {
    try {
      const res = await fetch(`${API_URL}/referrals/claim-payout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await handleResponse(res);
    } catch (error) {
      throw new Error('Failed to claim payout.');
    }
  },
};

// Paystack payment methods
export const paystack = {
  async initializePayment(email: string, amount: number, planId: string) {
    try {
      const res = await fetch(`${API_URL}/billing/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId, amount }),
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Failed to initialize payment.');
    }
  },

  async verifyPayment(reference: string) {
    try {
      const res = await fetch(`${API_URL}/billing/verify?reference=${reference}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error('Failed to verify payment.');
    }
  },

  async openPaymentModal(email: string, amount: number, planId: string, onSuccess: (ref: string) => void) {
    // Initialize payment to get reference
    const initResponse = await this.initializePayment(email, amount, planId);
    const reference = initResponse.data.reference;

    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount * 100, // Convert to kobo
        ref: reference,
        onClose: () => {
          console.log('Payment window closed');
        },
        onSuccess: (response: any) => {
          onSuccess(response.reference);
        },
      });
      handler.openIframe();
    };
    document.body.appendChild(script);
  },
};

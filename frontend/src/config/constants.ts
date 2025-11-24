export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  PROXIES: {
    LIST: '/proxies',
    CREATE: '/proxies',
    UPDATE: (id: string) => `/proxies/${id}`,
    DELETE: (id: string) => `/proxies/${id}`,
    TEST: (id: string) => `/proxies/${id}/test`
  },
  BILLING: {
    INVOICES: '/billing/invoices',
    SUBSCRIPTIONS: '/billing/subscriptions',
    PAYMENTS: '/billing/payments'
  },
  ACCOUNT: {
    PROFILE: '/account/profile',
    SETTINGS: '/account/settings',
    DELETE: '/account/delete'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2
};

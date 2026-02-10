export interface ProxyStatus {
    connected: boolean;
    location?: string;
    ip_address?: string;
    lat?: number;
    lon?: number;
    latency?: number;
    killSwitch?: boolean;
    last_check?: string;
    error?: string;
}


export interface Statistics {
    dataTransferred: number;
    requestsBlocked: number;
    uptime: number;
    connectionHistory: Array<{
        timestamp: string;
        location: string;
        duration: number;
    }>;
}

export interface RotationConfig {
    mode: 'per-request' | 'sticky-1min' | 'sticky-10min' | 'sticky-30min';
    country: string;
    city?: string;
    state?: string;
}

export interface Session {
    id: string;
    created_at: string;
    expires_at: string;
    duration: number;
    ip?: string;
    location?: string;
}

export interface RotationStats {
    total_rotations: number;
    success_count: number;
    failure_count: number;
    success_rate: number;
    geo_stats: Record<string, number>;
    hourly_stats: Record<string, number>;
    recent_events: Array<{
        Timestamp: string;
        SessionID: string;
        Reason: string;
        Mode: string;
        Country: string;
    }>;
}

export interface Location {
    country_code: string;
    country_name: string;
    cities: string[];
    available: boolean;
}

export interface SecurityStatus {
    anonymity_score: number;
    ip_leak_detected: boolean;
    dns_leak_detected: boolean;
    webrtc_leak_detected: boolean;
    strict_killswitch: boolean;
    detected_dns: string[];
    message: string;
}

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

class ApiClient {
    private baseUrl: string;
    private wsUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string = 'http://localhost:8082') {
        this.baseUrl = baseUrl;
        this.wsUrl = baseUrl.replace('http', 'ws');
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }

        return response;
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    logout() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    async login(email: string, password: string): Promise<User> {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Login failed');
        }

        const data: AuthResponse = await response.json();
        this.setToken(data.token);
        return data.user;
    }

    async register(email: string, password: string): Promise<User> {
        const response = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Registration failed');
        }

        const data: AuthResponse = await response.json();
        this.setToken(data.token);
        return data.user;
    }

    async getMe(): Promise<User> {
        const response = await this.request('/api/auth/me');
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        return response.json();
    }

    async getStatus(): Promise<ProxyStatus> {
        const response = await this.request('/status');
        if (!response.ok) {
            throw new Error('Failed to fetch status');
        }
        return response.json();
    }

    async getStatistics(): Promise<Statistics> {
        const response = await this.request('/api/statistics');
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }
        return response.json();
    }

    async toggleKillSwitch(): Promise<void> {
        const response = await this.request('/killswitch?enabled=true', {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to toggle kill switch');
        }
    }

    async getWhitelist(): Promise<string[]> {
        const response = await this.request('/adblock/whitelist');
        if (!response.ok) {
            throw new Error('Failed to fetch whitelist');
        }
        const data = await response.json();
        return data.whitelist;
    }

    async addToWhitelist(domain: string): Promise<void> {
        const response = await this.request('/adblock/whitelist', {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
        if (!response.ok) {
            throw new Error('Failed to add to whitelist');
        }
    }

    async removeFromWhitelist(domain: string): Promise<void> {
        const response = await this.request(`/adblock/whitelist?domain=${domain}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove from whitelist');
        }
    }

    subscribeToStatus(callback: (status: ProxyStatus) => void): () => void {
        let ws: WebSocket | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;
        const reconnectDelay = 2000;
        let heartbeatInterval: NodeJS.Timeout | null = null;
        let isClosed = false;

        const connect = () => {
            if (isClosed) return;

            ws = new WebSocket(`${this.wsUrl}/ws`);

            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                
                // Start heartbeat
                heartbeatInterval = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'pong') {
                        // Heartbeat response, ignore
                        return;
                    }
                    if (data.type === 'killswitch') {
                        // Handle killswitch event
                    } else {
                        callback(data);
                    }
                } catch (error) {
                    console.error('Failed to parse websocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('Websocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                    heartbeatInterval = null;
                }

                // Attempt reconnection
                if (!isClosed && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`);
                    setTimeout(connect, reconnectDelay);
                }
            };
        };

        connect();

        return () => {
            isClosed = true;
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
            if (ws) {
                ws.close();
            }
        };
    }

    async getRotationConfig(): Promise<RotationConfig> {
        const response = await this.request('/api/rotation/config');
        if (!response.ok) {
            throw new Error('Failed to fetch rotation config');
        }
        return response.json();
    }

    async setRotationConfig(config: RotationConfig): Promise<void> {
        const response = await this.request('/api/rotation/config', {
            method: 'POST',
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            throw new Error('Failed to update rotation config');
        }
    }

    async getCurrentSession(): Promise<Session> {
        const response = await this.request('/api/rotation/session/current');
        if (!response.ok) {
            throw new Error('Failed to fetch current session');
        }
        return response.json();
    }

    async forceRotation(): Promise<Session> {
        const response = await this.request('/api/rotation/session/new', {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to force rotation');
        }
        const data = await response.json();
        return data.session;
    }

    async getRotationStats(): Promise<RotationStats> {
        const response = await this.request('/api/rotation/stats');
        if (!response.ok) {
            throw new Error('Failed to fetch rotation stats');
        }
        return response.json();
    }

    async setGeoTargeting(config: { country: string, city?: string, state?: string }): Promise<void> {
        const response = await this.request('/api/rotation/geo', {
            method: 'POST',
            body: JSON.stringify(config),
        });
        if (!response.ok) {
            throw new Error('Failed to update geo targeting');
        }
    }

    // Billing API

    async getPlans(): Promise<Array<Plan>> {
        const response = await this.request('/api/billing/plans');
        if (!response.ok) {
            throw new Error('Failed to fetch plans');
        }
        const data = await response.json();
        return data.plans;
    }

    async getSubscription(): Promise<{ subscription: Subscription, plan: Plan }> {
        const response = await this.request('/api/billing/subscription');
        if (!response.ok) {
            throw new Error('Failed to fetch subscription');
        }
        return response.json();
    }

    async subscribe(planID: string): Promise<Subscription> {
        const response = await this.request('/api/billing/subscribe', {
            method: 'POST',
            body: JSON.stringify({ plan_id: planID }),
        });
        if (!response.ok) {
            throw new Error('Failed to subscribe');
        }
        const data = await response.json();
        return data.subscription;
    }

    async getUsage(): Promise<UsageStats> {
        const response = await this.request('/api/billing/usage');
        if (!response.ok) {
            throw new Error('Failed to fetch usage stats');
        }
        return response.json();
    }

    async createCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
        const response = await this.request('/api/billing/checkout', {
            method: 'POST',
            body: JSON.stringify(req),
        });
        if (!response.ok) {
            throw new Error('Failed to create checkout');
        }
        return response.json();
    }

    // Ad-Blocking Advanced API

    async refreshAdblock(): Promise<void> {
        const response = await this.request('/adblock/refresh', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to refresh blocklists');
    }

    async getAdblockStats(): Promise<AdblockStats> {
        const response = await this.request('/adblock/stats');
        if (!response.ok) throw new Error('Failed to fetch adblock stats');
        return response.json();
    }

    async getCustomRules(): Promise<string[]> {
        const response = await this.request('/adblock/custom');
        if (!response.ok) throw new Error('Failed to fetch custom rules');
        const data = await response.json();
        return data.rules || [];
    }

    async setCustomRules(rules: string[]): Promise<void> {
        const response = await this.request('/adblock/custom', {
            method: 'POST',
            body: JSON.stringify({ rules }),
        });
        if (!response.ok) throw new Error('Failed to update custom rules');
    }

    async createCheckoutSession(data: { plan_id: string, email: string, method: string, currency: string }): Promise<CheckoutResponse> {
        const response = await this.request('/api/billing/checkout', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to create checkout session');
        }
        return response.json();
    }

    async getLocations(): Promise<Location[]> {
        const response = await this.request('/api/locations/available');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        return data.locations;
    }

    async getSecurityStatus(): Promise<SecurityStatus> {
        const response = await this.request('/api/security/status');
        if (!response.ok) throw new Error('Failed to fetch security status');
        return response.json();
    }
}

export interface Plan {
    id: string;
    name: string;
    price_monthly: number;
    price_annual: number;
    data_limit_mb: number;
    request_limit: number;
    concurrent_conns: number;
    features: string[];
}

export interface Subscription {
    id: string;
    plan_id: string;
    status: string;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
}

export interface UsageStats {
    period_start: string;
    period_end: string;
    data_transferred_bytes: number;
    requests_made: number;
    ads_blocked: number;
    threats_blocked: number;
    active_connections: number;
}

export interface CheckoutRequest {
    plan_id: string;
    email: string;
    method: 'paystack' | 'crypto';
    currency?: string;
}

export interface CheckoutResponse {
    url?: string;
    payment_id?: string;
    address?: string;
    amount?: string;
    currency?: string;
}

export interface AdblockStats {
    rules_count: number;
    last_updated: string;
    [key: string]: number | string;
}

export const apiClient = new ApiClient();


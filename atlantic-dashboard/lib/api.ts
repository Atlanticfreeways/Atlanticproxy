export interface ProxyStatus {
    connected: boolean;
    location?: string;
    ip_address?: string;
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
    ID: string;
    CreatedAt: string;
    ExpiresAt: string;
    Duration: number;
    IP?: string;
    Location?: string;
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

class ApiClient {
    private baseUrl: string;
    private wsUrl: string;

    constructor(baseUrl: string = 'http://localhost:8082') {
        this.baseUrl = baseUrl;
        this.wsUrl = baseUrl.replace('http', 'ws');
    }

    async getStatus(): Promise<ProxyStatus> {
        const response = await fetch(`${this.baseUrl}/status`);
        if (!response.ok) {
            throw new Error('Failed to fetch status');
        }
        return response.json();
    }

    async getStatistics(): Promise<Statistics> {
        const response = await fetch(`${this.baseUrl}/api/statistics`);
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }
        return response.json();
    }

    async toggleKillSwitch(): Promise<void> {
        const response = await fetch(`${this.baseUrl}/killswitch?enabled=true`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to toggle kill switch');
        }
    }


    async getWhitelist(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/adblock/whitelist`);
        if (!response.ok) {
            throw new Error('Failed to fetch whitelist');
        }
        const data = await response.json();
        return data.whitelist;
    }

    async addToWhitelist(domain: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/adblock/whitelist`, {
            method: 'POST',
            body: JSON.stringify({ domain }),
        });
        if (!response.ok) {
            throw new Error('Failed to add to whitelist');
        }
    }

    async removeFromWhitelist(domain: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/adblock/whitelist?domain=${domain}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove from whitelist');
        }
    }

    subscribeToStatus(callback: (status: ProxyStatus) => void): () => void {

        const ws = new WebSocket(`${this.wsUrl}/ws`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Handle complex payloads or direct status updates
                if (data.type === 'killswitch') {
                    // Update specific field if needed, but usually we just broadcast full status
                    // For now, let's assume if it's not a full status we might need to handle it
                    // But our backend broadcast full status on connect/disconnect
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

        return () => {
            ws.close();
        };
    }

    async getRotationConfig(): Promise<RotationConfig> {
        const response = await fetch(`${this.baseUrl}/api/rotation/config`);
        if (!response.ok) {
            throw new Error('Failed to fetch rotation config');
        }
        return response.json();
    }

    async setRotationConfig(config: RotationConfig): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/rotation/config`, {
            method: 'POST',
            body: JSON.stringify(config),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to update rotation config');
        }
    }

    async getCurrentSession(): Promise<Session> {
        const response = await fetch(`${this.baseUrl}/api/rotation/session/current`);
        if (!response.ok) {
            throw new Error('Failed to fetch current session');
        }
        return response.json();
    }

    async forceRotation(): Promise<Session> {
        const response = await fetch(`${this.baseUrl}/api/rotation/session/new`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to force rotation');
        }
        const data = await response.json();
        return data.session;
    }

    async getRotationStats(): Promise<RotationStats> {
        const response = await fetch(`${this.baseUrl}/api/rotation/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch rotation stats');
        }
        return response.json();
    }

    async setGeoTargeting(config: { country: string, city?: string, state?: string }): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/rotation/geo`, {
            method: 'POST',
            body: JSON.stringify(config),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to update geo targeting');
        }
    }

    // Billing API

    async getPlans(): Promise<Array<Plan>> {
        const response = await fetch(`${this.baseUrl}/api/billing/plans`);
        if (!response.ok) {
            throw new Error('Failed to fetch plans');
        }
        const data = await response.json();
        return data.plans;
    }

    async getSubscription(): Promise<{ subscription: Subscription, plan: Plan }> {
        const response = await fetch(`${this.baseUrl}/api/billing/subscription`);
        if (!response.ok) {
            throw new Error('Failed to fetch subscription');
        }
        return response.json();
    }

    async subscribe(planID: string): Promise<Subscription> {
        const response = await fetch(`${this.baseUrl}/api/billing/subscribe`, {
            method: 'POST',
            body: JSON.stringify({ plan_id: planID }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to subscribe');
        }
        const data = await response.json();
        return data.subscription;
    }

    async getUsage(): Promise<UsageStats> {
        const response = await fetch(`${this.baseUrl}/api/billing/usage`);
        if (!response.ok) {
            throw new Error('Failed to fetch usage stats');
        }
        return response.json();
    }

    // Ad-Blocking Advanced API

    async refreshAdblock(): Promise<void> {
        const response = await fetch(`${this.baseUrl}/adblock/refresh`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to refresh blocklists');
    }

    async getAdblockStats(): Promise<AdblockStats> {
        const response = await fetch(`${this.baseUrl}/adblock/stats`);
        if (!response.ok) throw new Error('Failed to fetch adblock stats');
        return response.json();
    }

    async getCustomRules(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/adblock/custom`);
        if (!response.ok) throw new Error('Failed to fetch custom rules');
        const data = await response.json();
        return data.rules || [];
    }

    async setCustomRules(rules: string[]): Promise<void> {
        const response = await fetch(`${this.baseUrl}/adblock/custom`, {
            method: 'POST',
            body: JSON.stringify({ rules }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to update custom rules');
    }
}

export interface Plan {
    ID: string;
    Name: string;
    PriceMonthly: number;
    PriceAnnual: number;
    DataLimitMB: number;
    RequestLimit: number;
    ConcurrentConns: number;
    Features: string[];
}

export interface Subscription {
    ID: string;
    PlanID: string;
    Status: string;
    StartDate: string;
    EndDate: string;
    AutoRenew: boolean;
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

export interface AdblockStats {
    rules_count: number;
    last_updated: string;
    [key: string]: number | string;
}

export const apiClient = new ApiClient();


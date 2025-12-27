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
}

export const apiClient = new ApiClient();


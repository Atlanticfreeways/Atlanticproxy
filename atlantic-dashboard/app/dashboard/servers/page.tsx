'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ServerList } from './components/ServerList';

interface Server {
    id: string;
    name: string;
    location: string;
    status: 'online' | 'offline' | 'maintenance';
    latency: number;
    load: number;
    users: number;
}

export default function ServersPage() {
    const [loading, setLoading] = useState(true);
    const [servers, setServers] = useState<Server[]>([]);

    useEffect(() => {
        // TODO: Fetch from /api/servers/list
        setServers([
            { id: '1', name: 'US East', location: 'New York, USA', status: 'online', latency: 15, load: 45, users: 234 },
            { id: '2', name: 'US West', location: 'Los Angeles, USA', status: 'online', latency: 28, load: 62, users: 189 },
            { id: '3', name: 'EU West', location: 'London, UK', status: 'online', latency: 42, load: 38, users: 156 },
            { id: '4', name: 'EU Central', location: 'Frankfurt, Germany', status: 'online', latency: 35, load: 51, users: 201 },
            { id: '5', name: 'Asia Pacific', location: 'Singapore', status: 'online', latency: 78, load: 29, users: 98 },
            { id: '6', name: 'Asia East', location: 'Tokyo, Japan', status: 'maintenance', latency: 0, load: 0, users: 0 },
        ]);
        setLoading(false);
    }, []);

    const handleConnect = async (serverId: string) => {
        console.log('Connecting to server:', serverId);
        // TODO: Implement connection logic
    };

    const handleRefresh = async () => {
        setLoading(true);
        // TODO: Fetch fresh server status
        setTimeout(() => setLoading(false), 1000);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Proxy Servers</h1>
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-neutral-800 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Proxy Servers</h1>
                <Button onClick={handleRefresh} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Status'}
                </Button>
            </div>

            <ServerList servers={servers} onConnect={handleConnect} />
        </div>
    );
}

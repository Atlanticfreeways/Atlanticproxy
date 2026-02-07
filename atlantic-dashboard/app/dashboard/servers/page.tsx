'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ServersPage() {
    const servers = [
        { id: 1, name: 'US East', location: 'New York', status: 'online', latency: 15, load: 45 },
        { id: 2, name: 'US West', location: 'Los Angeles', status: 'online', latency: 28, load: 62 },
        { id: 3, name: 'EU West', location: 'London', status: 'online', latency: 42, load: 38 },
        { id: 4, name: 'EU Central', location: 'Frankfurt', status: 'online', latency: 35, load: 51 },
        { id: 5, name: 'Asia Pacific', location: 'Singapore', status: 'online', latency: 78, load: 29 },
        { id: 6, name: 'Asia East', location: 'Tokyo', status: 'maintenance', latency: 0, load: 0 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-400';
            case 'maintenance': return 'text-yellow-400';
            case 'offline': return 'text-red-400';
            default: return 'text-neutral-400';
        }
    };

    const getLoadColor = (load: number) => {
        if (load < 40) return 'bg-green-500';
        if (load < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Proxy Servers</h1>
                <Button className="bg-sky-500 hover:bg-sky-600">Refresh Status</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                    <Card key={server.id} className="bg-neutral-800 border-neutral-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                                <p className="text-sm text-neutral-400">{server.location}</p>
                            </div>
                            <div className={`text-sm font-medium capitalize ${getStatusColor(server.status)}`}>
                                {server.status}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-neutral-400">Latency</span>
                                    <span className="text-white">{server.latency}ms</span>
                                </div>
                            </div>

                            {server.status === 'online' && (
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-neutral-400">Load</span>
                                        <span className="text-white">{server.load}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getLoadColor(server.load)}`}
                                            style={{ width: `${server.load}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full mt-4 bg-neutral-700 hover:bg-neutral-600"
                            disabled={server.status !== 'online'}
                        >
                            {server.status === 'online' ? 'Connect' : 'Unavailable'}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

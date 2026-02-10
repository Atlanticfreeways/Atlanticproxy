'use client';

import { Button } from '@/components/ui/button';

interface Server {
    id: string;
    name: string;
    location: string;
    status: 'online' | 'offline' | 'maintenance';
    latency: number;
    load: number;
    users: number;
}

interface ServerCardProps {
    server: Server;
    onConnect: (serverId: string) => void;
}

export function ServerCard({ server, onConnect }: ServerCardProps) {
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-red-500',
        maintenance: 'bg-yellow-500',
    };

    const loadColor = server.load > 80 ? 'text-red-500' : server.load > 60 ? 'text-yellow-500' : 'text-green-500';

    return (
        <div className="bg-card rounded-lg p-4 border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-lg">{server.name}</h3>
                    <p className="text-sm text-muted-foreground">{server.location}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[server.status]}`} />
                    <span className="text-xs capitalize">{server.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <div className="text-xs text-muted-foreground">Latency</div>
                    <div className="text-sm font-semibold">{server.latency}ms</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Load</div>
                    <div className={`text-sm font-semibold ${loadColor}`}>{server.load}%</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Users</div>
                    <div className="text-sm font-semibold">{server.users}</div>
                </div>
            </div>

            <Button 
                onClick={() => onConnect(server.id)}
                disabled={server.status !== 'online'}
                className="w-full"
                size="sm"
            >
                {server.status === 'online' ? 'Connect' : server.status === 'maintenance' ? 'Maintenance' : 'Offline'}
            </Button>
        </div>
    );
}

interface ServerListProps {
    servers: Server[];
    onConnect: (serverId: string) => void;
}

export function ServerList({ servers, onConnect }: ServerListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map(server => (
                <ServerCard key={server.id} server={server} onConnect={onConnect} />
            ))}
        </div>
    );
}

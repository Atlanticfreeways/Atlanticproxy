'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Lightning, Star } from '@phosphor-icons/react';

interface Server {
    id: string;
    name: string;
    country: string;
    flag: string;
    latency: number;
    load: number;
    online: boolean;
    favorite: boolean;
}

export default function ServersPage() {
    const [autoSelect, setAutoSelect] = useState(true);
    const [selectedServer, setSelectedServer] = useState('us-east');

    const servers: Server[] = [
        { id: 'us-east', name: 'US East', country: 'United States', flag: '🇺🇸', latency: 42, load: 45, online: true, favorite: true },
        { id: 'us-west', name: 'US West', country: 'United States', flag: '🇺🇸', latency: 65, load: 62, online: true, favorite: false },
        { id: 'uk', name: 'London', country: 'United Kingdom', flag: '🇬🇧', latency: 88, load: 38, online: true, favorite: true },
        { id: 'de', name: 'Frankfurt', country: 'Germany', flag: '🇩🇪', latency: 95, load: 52, online: true, favorite: false },
        { id: 'jp', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', latency: 145, load: 28, online: true, favorite: false },
        { id: 'sg', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', latency: 168, load: 41, online: true, favorite: false },
    ];

    const toggleFavorite = (serverId: string) => {
        // TODO: Implement favorite toggle
        console.log('Toggle favorite:', serverId);
    };

    const connectToServer = (serverId: string) => {
        setSelectedServer(serverId);
        // TODO: Implement server connection
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Server Selection</h1>
                <p className="text-neutral-400">Choose your preferred proxy server location</p>
            </div>

            {/* Auto-Select Toggle */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lightning size={24} className="text-yellow-500" weight="fill" />
                            <div>
                                <p className="text-white font-medium">Auto-Select Best Server</p>
                                <p className="text-sm text-neutral-400">Automatically connect to the fastest server</p>
                            </div>
                        </div>
                        <Switch checked={autoSelect} onCheckedChange={setAutoSelect} />
                    </div>
                </CardContent>
            </Card>

            {/* Server List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servers.map((server) => (
                    <Card
                        key={server.id}
                        className={`bg-neutral-900 border-neutral-800 transition-all cursor-pointer hover:border-blue-500/50 ${selectedServer === server.id ? 'border-blue-500' : ''
                            }`}
                        onClick={() => !autoSelect && connectToServer(server.id)}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{server.flag}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{server.name}</h3>
                                            {selectedServer === server.id && (
                                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Connected</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-400">{server.country}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(server.id);
                                    }}
                                    className="text-neutral-400 hover:text-yellow-500 transition-colors"
                                >
                                    <Star size={20} weight={server.favorite ? 'fill' : 'regular'} className={server.favorite ? 'text-yellow-500' : ''} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-400">Latency</span>
                                    <span className={`text-sm font-medium ${server.latency < 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {server.latency}ms
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-400">Server Load</span>
                                        <span className="text-sm font-medium text-white">{server.load}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-800 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${server.load < 50 ? 'bg-green-500' : server.load < 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${server.load}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-400">Status</span>
                                    <Badge className={server.online ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                                        {server.online ? 'Online' : 'Offline'}
                                    </Badge>
                                </div>
                            </div>

                            {selectedServer !== server.id && !autoSelect && (
                                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                                    <Globe size={20} className="mr-2" />
                                    Connect
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

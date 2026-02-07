'use client';

import { Card } from '@/components/ui/card';

export default function UsagePage() {
    const usage = {
        current: 2.5,
        limit: 10,
        percent: 25,
        daily: [
            { day: 'Mon', data: 0.3 },
            { day: 'Tue', data: 0.5 },
            { day: 'Wed', data: 0.4 },
            { day: 'Thu', data: 0.6 },
            { day: 'Fri', data: 0.4 },
            { day: 'Sat', data: 0.2 },
            { day: 'Sun', data: 0.1 },
        ],
        byProtocol: [
            { name: 'HTTPS', data: 1.8, percent: 72 },
            { name: 'SOCKS5', data: 0.5, percent: 20 },
            { name: 'Shadowsocks', data: 0.2, percent: 8 },
        ],
        topDomains: [
            { domain: 'api.example.com', requests: 3421, data: 0.8 },
            { domain: 'cdn.example.com', requests: 2156, data: 0.6 },
            { domain: 'app.example.com', requests: 1823, data: 0.4 },
            { domain: 'static.example.com', requests: 1234, data: 0.3 },
            { domain: 'images.example.com', requests: 987, data: 0.2 },
        ],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Usage</h1>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Period</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-4xl font-bold text-white">{usage.current} GB</div>
                            <div className="text-sm text-neutral-400">of {usage.limit} GB used</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-sky-400">{usage.percent}%</div>
                            <div className="text-sm text-neutral-400">remaining</div>
                        </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-3">
                        <div
                            className="bg-sky-500 h-3 rounded-full transition-all"
                            style={{ width: `${usage.percent}%` }}
                        />
                    </div>
                    <div className="text-sm text-neutral-400">
                        Resets in 5 days • {usage.limit - usage.current} GB remaining
                    </div>
                </div>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Daily Usage (Last 7 Days)</h3>
                <div className="flex items-end gap-4 h-48">
                    {usage.daily.map((day) => (
                        <div key={day.day} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-sky-500 rounded-t transition-all hover:bg-sky-400"
                                style={{ height: `${(day.data / 0.6) * 100}%` }}
                            />
                            <div className="text-xs text-neutral-400 mt-2">{day.day}</div>
                            <div className="text-xs text-white">{day.data}GB</div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">By Protocol</h3>
                    <div className="space-y-4">
                        {usage.byProtocol.map((protocol) => (
                            <div key={protocol.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white">{protocol.name}</span>
                                    <span className="text-neutral-400">{protocol.data} GB ({protocol.percent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-700 rounded-full h-2">
                                    <div
                                        className="bg-sky-500 h-2 rounded-full"
                                        style={{ width: `${protocol.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Domains</h3>
                    <div className="space-y-3">
                        {usage.topDomains.map((domain, i) => (
                            <div key={domain.domain} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-neutral-400 text-sm w-4">{i + 1}</div>
                                    <div>
                                        <div className="text-white text-sm">{domain.domain}</div>
                                        <div className="text-neutral-400 text-xs">{domain.requests.toLocaleString()} requests</div>
                                    </div>
                                </div>
                                <div className="text-white text-sm">{domain.data} GB</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

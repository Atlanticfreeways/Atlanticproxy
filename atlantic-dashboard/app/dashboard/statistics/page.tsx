'use client';

import { Card } from '@/components/ui/card';

export default function StatisticsPage() {
    const stats = {
        totalRequests: 15234,
        totalData: 45.2,
        avgLatency: 28,
        successRate: 99.8,
        topCountries: [
            { code: 'US', name: 'United States', requests: 5234, percent: 34 },
            { code: 'GB', name: 'United Kingdom', requests: 3421, percent: 22 },
            { code: 'DE', name: 'Germany', requests: 2156, percent: 14 },
            { code: 'FR', name: 'France', requests: 1823, percent: 12 },
            { code: 'CA', name: 'Canada', requests: 1600, percent: 10 },
        ],
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            requests: Math.floor(Math.random() * 1000) + 200,
        })),
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="text-sm text-neutral-400 mb-1">Total Requests</div>
                    <div className="text-3xl font-bold text-white">{stats.totalRequests.toLocaleString()}</div>
                </Card>
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="text-sm text-neutral-400 mb-1">Data Used</div>
                    <div className="text-3xl font-bold text-white">{stats.totalData} GB</div>
                </Card>
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="text-sm text-neutral-400 mb-1">Avg Latency</div>
                    <div className="text-3xl font-bold text-white">{stats.avgLatency}ms</div>
                </Card>
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="text-sm text-neutral-400 mb-1">Success Rate</div>
                    <div className="text-3xl font-bold text-green-400">{stats.successRate}%</div>
                </Card>
            </div>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Requests by Hour (Last 24h)</h3>
                <div className="flex items-end gap-1 h-48">
                    {stats.hourlyData.map((data) => (
                        <div key={data.hour} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-sky-500 rounded-t transition-all hover:bg-sky-400"
                                style={{ height: `${(data.requests / 1200) * 100}%` }}
                            />
                            {data.hour % 4 === 0 && (
                                <div className="text-xs text-neutral-500 mt-2">{data.hour}h</div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                <div className="space-y-4">
                    {stats.topCountries.map((country) => (
                        <div key={country.code}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white">{country.name}</span>
                                <span className="text-neutral-400">{country.requests.toLocaleString()} ({country.percent}%)</span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-2">
                                <div
                                    className="bg-sky-500 h-2 rounded-full"
                                    style={{ width: `${country.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

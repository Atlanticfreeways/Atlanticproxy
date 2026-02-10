'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataUsageChart } from './components/DataUsageChart';
import { TopCountriesChart } from './components/TopCountriesChart';
import { ProtocolBreakdown } from './components/ProtocolBreakdown';
import { apiClient } from '@/lib/api';

export default function StatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRequests: 0,
        totalData: 0,
        avgLatency: 0,
        successRate: 0,
        hourlyData: [] as Array<{ time: string; usage: number }>,
        topCountries: [] as Array<{ country: string; requests: number }>,
        protocols: [] as Array<{ name: string; value: number }>,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.getStatistics();
                setStats({
                    totalRequests: data.requestsMade || 0,
                    totalData: (data.dataTransferredBytes / (1024 * 1024 * 1024)).toFixed(2) as any,
                    avgLatency: 28, // TODO: Get from backend
                    successRate: 99.8, // TODO: Get from backend
                    hourlyData: generateHourlyData(),
                    topCountries: generateTopCountries(),
                    protocols: generateProtocolData(),
                });
            } catch (error) {
                console.error('Failed to fetch statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const generateHourlyData = () => {
        return Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            usage: Math.floor(Math.random() * 500) + 100,
        }));
    };

    const generateTopCountries = () => {
        return [
            { country: 'US', requests: 5234 },
            { country: 'GB', requests: 3421 },
            { country: 'DE', requests: 2156 },
            { country: 'FR', requests: 1823 },
            { country: 'CA', requests: 1600 },
        ];
    };

    const generateProtocolData = () => {
        return [
            { name: 'HTTPS', value: 45 },
            { name: 'SOCKS5', value: 30 },
            { name: 'HTTP', value: 15 },
            { name: 'Shadowsocks', value: 10 },
        ];
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Statistics</h1>
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-neutral-800 rounded-lg" />
                        ))}
                    </div>
                    <div className="h-96 bg-neutral-800 rounded-lg" />
                </div>
            </div>
        );
    }

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataUsageChart data={stats.hourlyData} />
                <TopCountriesChart data={stats.topCountries} />
            </div>

            <ProtocolBreakdown data={stats.protocols} />
        </div>
    );
}

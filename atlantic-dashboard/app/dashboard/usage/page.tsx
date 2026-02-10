'use client';

import { useEffect, useState } from 'react';
import { UsageOverview } from './components/UsageOverview';
import { UsageGraph } from './components/UsageGraph';
import { ProtocolUsage } from './components/ProtocolUsage';
import { apiClient } from '@/lib/api';

export default function UsagePage() {
    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState({
        current: 0,
        limit: 10,
        dailyData: [] as Array<{ date: string; usage: number }>,
        weeklyData: [] as Array<{ week: string; usage: number }>,
        monthlyData: [] as Array<{ month: string; usage: number }>,
        protocolData: [] as Array<{ protocol: string; usage: number; color: string }>,
    });

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const data = await apiClient.getUsage();
                const usedGB = data.data_transferred_bytes / (1024 * 1024 * 1024);
                
                setUsage({
                    current: usedGB,
                    limit: 10, // TODO: Get from subscription
                    dailyData: generateDailyData(),
                    weeklyData: generateWeeklyData(),
                    monthlyData: generateMonthlyData(),
                    protocolData: [
                        { protocol: 'HTTPS', usage: usedGB * 0.6, color: '#3b82f6' },
                        { protocol: 'SOCKS5', usage: usedGB * 0.25, color: '#10b981' },
                        { protocol: 'HTTP', usage: usedGB * 0.1, color: '#f59e0b' },
                        { protocol: 'Shadowsocks', usage: usedGB * 0.05, color: '#ef4444' },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, []);

    const generateDailyData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            date: day,
            usage: Math.random() * 0.5 + 0.1,
        }));
    };

    const generateWeeklyData = () => {
        return Array.from({ length: 4 }, (_, i) => ({
            week: `Week ${i + 1}`,
            usage: Math.random() * 2 + 1,
        }));
    };

    const generateMonthlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
            month,
            usage: Math.random() * 5 + 2,
        }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Usage</h1>
                <div className="animate-pulse space-y-6">
                    <div className="h-48 bg-neutral-800 rounded-lg" />
                    <div className="h-96 bg-neutral-800 rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Usage</h1>

            <UsageOverview used={usage.current} limit={usage.limit} />
            
            <UsageGraph 
                dailyData={usage.dailyData}
                weeklyData={usage.weeklyData}
                monthlyData={usage.monthlyData}
            />

            <ProtocolUsage data={usage.protocolData} />
        </div>
    );
}

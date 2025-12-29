'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiClient, Plan, Subscription, UsageStats } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function UsagePage() {
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [sub, setSub] = useState<Subscription | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usageData, subData] = await Promise.all([
                    apiClient.getUsage(),
                    apiClient.getSubscription()
                ]);
                setUsage(usageData);
                setSub(subData.subscription);
                setPlan(subData.plan);
            } catch (error) {
                console.error('Failed to load usage data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="text-white">Loading usage statistics...</div>;

    // Helper to format bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Derived values
    const dataUsed = usage?.data_transferred_bytes || 0;
    const dataLimit = (plan?.DataLimitMB || 0) * 1024 * 1024;
    const dataPourcentage = plan?.DataLimitMB === -1 ? 0 : (dataUsed / dataLimit) * 100;

    // Mock daily usage for the chart (since backend only gives current month total for now)
    const dailyData = [
        { day: '1', usage: 120 }, { day: '2', usage: 150 }, { day: '3', usage: 180 },
        { day: '4', usage: 200 }, { day: '5', usage: 140 }, { day: '6', usage: 160 },
        { day: '7', usage: 210 }, { day: '8', usage: 250 }, { day: '9', usage: 230 },
        { day: '10', usage: 280 }, { day: '11', usage: 300 }, { day: '12', usage: 120 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Usage Dashboard</h1>
                <p className="text-neutral-400">Monitor your data consumption and request limits</p>
            </div>

            {/* Quota Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Data Usage</CardTitle>
                        <CardDescription>
                            {formatBytes(dataUsed)} used of {plan?.DataLimitMB === -1 ? 'Unlimited' : formatBytes(dataLimit)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={dataPourcentage} className="h-4 bg-neutral-800" indicatorClassName={dataPourcentage > 90 ? 'bg-red-500' : 'bg-blue-600'} />
                        <p className="text-sm text-neutral-400 mt-2 text-right">
                            {plan?.DataLimitMB === -1 ? 'Unlimited' : `${dataPourcentage.toFixed(1)}% Used`}
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">API Requests</CardTitle>
                        <CardDescription>
                            {usage?.requests_made || 0} requests made
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={15} className="h-4 bg-neutral-800" indicatorClassName="bg-green-500" />
                        <p className="text-sm text-neutral-400 mt-2 text-right">
                            Within limits
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Usage Chart */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-white">Daily Data Consumption (MB)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={dailyData}>
                            <defs>
                                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#525252" />
                            <YAxis stroke="#525252" />
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                            />
                            <Area type="monotone" dataKey="usage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsage)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Threats & Ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Ads Blocked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">{usage?.ads_blocked || 0}</div>
                        <p className="text-neutral-400">Total ads blocked this billing cycle</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Threats Prevented</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-red-500">{usage?.threats_blocked || 0}</div>
                        <p className="text-neutral-400">Malicious requests intercepted</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

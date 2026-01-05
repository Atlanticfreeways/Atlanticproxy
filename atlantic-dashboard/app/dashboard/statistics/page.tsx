'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from '@phosphor-icons/react';
import { apiClient, RotationStats, UsageStats } from '@/lib/api';

export default function StatisticsPage() {
    const [rotationStats, setRotationStats] = useState<RotationStats | null>(null);
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [stats, usage, status] = await Promise.all([
                apiClient.getRotationStats(),
                apiClient.getUsage(),
                apiClient.getStatus()
            ]);
            setRotationStats(stats);
            setUsageStats(usage);
            if (status.latency) setLatency(status.latency);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const dataUsage = [
        { day: 'Mon', upload: 0, download: 0 },
        { day: 'Tue', upload: 0, download: 0 },
        { day: 'Wed', upload: 0, download: 0 },
        { day: 'Thu', upload: 0, download: 0 },
        { day: 'Fri', upload: 0, download: 0 },
        { day: 'Sat', upload: 0, download: 0 },
        { day: 'Sun', upload: 0, download: 0 },
    ];

    // Process Geo Data for Pie Chart
    const geoData = rotationStats?.geo_stats ? Object.entries(rotationStats.geo_stats).map(([name, value]) => ({ name, value })) : [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
                    <p className="text-neutral-400">View your usage and connection history</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download size={20} className="mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Rotation Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Total Rotations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">{rotationStats?.total_rotations || 0}</p>
                        <p className="text-sm text-neutral-500 mt-1">Lifetime</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-400">{(rotationStats?.success_rate ?? 0).toFixed(1)}%</p>
                        <p className="text-sm text-neutral-500 mt-1">Connection Health</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Successful</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-400">{rotationStats?.success_count || 0}</p>
                        <p className="text-sm text-neutral-500 mt-1">Sessions</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-400">{rotationStats?.failure_count || 0}</p>
                        <p className="text-sm text-neutral-500 mt-1">Retries</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Usage Chart */}
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Data Usage (MB)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataUsage}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                                <XAxis dataKey="day" stroke="#a3a3a3" />
                                <YAxis stroke="#a3a3a3" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#171717',
                                        border: '1px solid #404040',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="upload" fill="#3b82f6" />
                                <Bar dataKey="download" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Geo Distribution */}
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Geographic Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={geoData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {geoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#171717',
                                        border: '1px solid #404040',
                                        borderRadius: '8px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics Grid (Real/Usage) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Combined Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">{formatBytes(usageStats?.data_transferred_bytes || 0)}</p>
                        <p className="text-sm text-neutral-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">{(usageStats?.requests_made || 0).toLocaleString()}</p>
                        <p className="text-sm text-neutral-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Current Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">{latency ? `${latency}ms` : '--'}</p>
                        <p className="text-sm text-neutral-500 mt-1">Realtime Check</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

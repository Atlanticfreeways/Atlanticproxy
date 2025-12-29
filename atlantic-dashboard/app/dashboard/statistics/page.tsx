'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from '@phosphor-icons/react';
import { apiClient, RotationStats } from '@/lib/api';

export default function StatisticsPage() {
    const [rotationStats, setRotationStats] = useState<RotationStats | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stats = await apiClient.getRotationStats();
            setRotationStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const dataUsage = [
        { day: 'Mon', upload: 120, download: 450 },
        { day: 'Tue', upload: 150, download: 520 },
        { day: 'Wed', upload: 180, download: 600 },
        { day: 'Thu', upload: 140, download: 480 },
        { day: 'Fri', upload: 200, download: 720 },
        { day: 'Sat', upload: 250, download: 850 },
        { day: 'Sun', upload: 180, download: 640 },
    ];

    // Process Geo Data for Pie Chart
    const geoData = rotationStats ? Object.entries(rotationStats.geo_stats).map(([name, value]) => ({ name, value })) : [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
                        <p className="text-3xl font-bold text-green-400">{rotationStats?.success_rate.toFixed(1) || 0}%</p>
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

            {/* Statistics Grid (Legacy/General) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Combined Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">12.4 GB</p>
                        <p className="text-sm text-neutral-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">45,231</p>
                        <p className="text-sm text-neutral-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Avg. Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-white">42ms</p>
                        <p className="text-sm text-green-500 mt-1">↓ 12% from last month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { apiClient, ProxyStatus } from '@/lib/api';
import { ShieldCheck, Globe, Timer, ArrowsDownUp } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [status, setStatus] = useState<ProxyStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await apiClient.getStatus();
                setStatus(data);
            } catch (error) {
                console.error('Failed to fetch status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        // Subscribe to real-time updates
        const unsubscribe = apiClient.subscribeToStatus((data) => {
            setStatus(data);
        });

        return () => unsubscribe();
    }, []);


    // Mock performance data
    const performanceData = [
        { time: '00:00', latency: 45 },
        { time: '00:05', latency: 42 },
        { time: '00:10', latency: 48 },
        { time: '00:15', latency: 44 },
        { time: '00:20', latency: 46 },
        { time: '00:25', latency: 43 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-neutral-400">Monitor your proxy connection and performance</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard
                    icon={<ShieldCheck size={24} />}
                    title="Connection"
                    value={status?.connected ? 'Connected' : 'Disconnected'}
                    status={status?.connected ? 'success' : 'error'}
                />
                <StatusCard
                    icon={<Globe size={24} />}
                    title="Location"
                    value={status?.location || 'Unknown'}
                    subtitle={status?.ip_address || 'No IP'}
                />

                <StatusCard
                    icon={<Timer size={24} />}
                    title="Latency"
                    value={`${status?.latency || 0}ms`}
                    status={status && (status.latency || 0) < 100 ? 'success' : 'warning'}
                />
                <StatusCard
                    icon={<ArrowsDownUp size={24} />}
                    title="Data Transferred"
                    value="2.4 GB"
                    subtitle="This session"
                />
            </div>

            {/* Performance Chart */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                            <XAxis dataKey="time" stroke="#a3a3a3" />
                            <YAxis stroke="#a3a3a3" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#171717',
                                    border: '1px solid #404040',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                            <div>
                                <p className="text-white font-medium">Connected to US East</p>
                                <p className="text-sm text-neutral-400">2 minutes ago</p>
                            </div>
                            <div className="text-green-500">✓</div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                            <div>
                                <p className="text-white font-medium">Kill switch activated</p>
                                <p className="text-sm text-neutral-400">15 minutes ago</p>
                            </div>
                            <div className="text-blue-500">🛡️</div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-white font-medium">Leak test passed</p>
                                <p className="text-sm text-neutral-400">1 hour ago</p>
                            </div>
                            <div className="text-green-500">✓</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

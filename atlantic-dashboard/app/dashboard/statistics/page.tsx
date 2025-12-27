'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from '@phosphor-icons/react';

export default function StatisticsPage() {
    const dataUsage = [
        { day: 'Mon', upload: 120, download: 450 },
        { day: 'Tue', upload: 150, download: 520 },
        { day: 'Wed', upload: 180, download: 600 },
        { day: 'Thu', upload: 140, download: 480 },
        { day: 'Fri', upload: 200, download: 720 },
        { day: 'Sat', upload: 250, download: 850 },
        { day: 'Sun', upload: 180, download: 640 },
    ];

    return (
        <div className="space-y-8">
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

            {/* Data Usage Chart */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Data Usage (MB)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
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

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-neutral-400 text-sm">Total Data</CardTitle>
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

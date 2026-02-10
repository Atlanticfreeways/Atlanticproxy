'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UsageGraphProps {
    dailyData: Array<{ date: string; usage: number }>;
    weeklyData: Array<{ week: string; usage: number }>;
    monthlyData: Array<{ month: string; usage: number }>;
}

export function UsageGraph({ dailyData, weeklyData, monthlyData }: UsageGraphProps) {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const data = period === 'daily' ? dailyData : period === 'weekly' ? weeklyData : monthlyData;
    const dataKey = period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month';

    return (
        <div className="bg-card rounded-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Usage Over Time</h3>
                <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <TabsList>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey={dataKey} stroke="#888" />
                    <YAxis stroke="#888" label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

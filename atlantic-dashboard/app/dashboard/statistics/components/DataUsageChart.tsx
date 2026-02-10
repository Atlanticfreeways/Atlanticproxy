'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataUsageChartProps {
    data: Array<{ time: string; usage: number }>;
}

export function DataUsageChart({ data }: DataUsageChartProps) {
    return (
        <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Data Usage (Last 24 Hours)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis stroke="#888" />
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

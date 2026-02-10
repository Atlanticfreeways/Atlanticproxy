'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopCountriesChartProps {
    data: Array<{ country: string; requests: number }>;
}

export function TopCountriesChart({ data }: TopCountriesChartProps) {
    return (
        <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="country" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="requests" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

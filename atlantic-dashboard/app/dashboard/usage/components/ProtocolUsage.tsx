'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProtocolUsageProps {
    data: Array<{ protocol: string; usage: number; color: string }>;
}

export function ProtocolUsage({ data }: ProtocolUsageProps) {
    const total = data.reduce((sum, item) => sum + item.usage, 0);

    return (
        <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Usage by Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ protocol, usage }) => `${protocol} ${((usage / total) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="usage"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                            formatter={(value: number) => `${value.toFixed(2)} GB`}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                    {data.map((item) => (
                        <div key={item.protocol} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-medium">{item.protocol}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{item.usage.toFixed(2)} GB</div>
                                <div className="text-sm text-muted-foreground">
                                    {((item.usage / total) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface StatusCardProps {
    icon: ReactNode;
    title: string;
    value: string;
    status?: 'success' | 'warning' | 'error' | 'neutral';
    subtitle?: string;
}

export function StatusCard({ icon, title, value, status = 'neutral', subtitle }: StatusCardProps) {
    const statusColors = {
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-500 border-red-500/20',
        neutral: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    };

    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
                <div className="text-neutral-400">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {subtitle && (
                    <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
                )}
                {status !== 'neutral' && (
                    <Badge className={`mt-2 ${statusColors[status]}`}>
                        {status === 'success' && '✓ Active'}
                        {status === 'warning' && '⚠ Warning'}
                        {status === 'error' && '✗ Error'}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}

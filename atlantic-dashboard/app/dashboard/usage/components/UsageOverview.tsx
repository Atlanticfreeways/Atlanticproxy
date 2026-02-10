'use client';

import { Progress } from '@/components/ui/progress';

interface UsageOverviewProps {
    used: number;
    limit: number;
    unit?: string;
}

export function UsageOverview({ used, limit, unit = 'GB' }: UsageOverviewProps) {
    const percentage = (used / limit) * 100;
    const isWarning = percentage >= 80;
    const isCritical = percentage >= 90;

    return (
        <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Data Usage</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-bold">{used.toFixed(2)} {unit}</span>
                    <span className="text-muted-foreground">of {limit} {unit}</span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="flex justify-between text-sm">
                    <span className={isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}>
                        {percentage.toFixed(1)}% used
                    </span>
                    <span className="text-muted-foreground">{(limit - used).toFixed(2)} {unit} remaining</span>
                </div>
                {isWarning && (
                    <div className={`p-3 rounded-lg ${isCritical ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {isCritical ? '⚠️ Critical: Approaching data limit!' : '⚠️ Warning: 80% of data used'}
                    </div>
                )}
            </div>
        </div>
    );
}

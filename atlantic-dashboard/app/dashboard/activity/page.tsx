'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ActivityLog, ActivityFilters } from './components/ActivityLog';

export default function ActivityPage() {
    const [page, setPage] = useState(1);
    const [activities] = useState([
        { id: '1', type: 'connection' as const, description: 'Connected to US East (New York)', timestamp: '2 min ago', status: 'success' as const },
        { id: '2', type: 'rotation' as const, description: 'IP rotated automatically', timestamp: '15 min ago', status: 'success' as const },
        { id: '3', type: 'security' as const, description: 'Kill switch activated', timestamp: '32 min ago', status: 'warning' as const },
        { id: '4', type: 'connection' as const, description: 'Connected to EU West (London)', timestamp: '1 hour ago', status: 'success' as const },
        { id: '5', type: 'billing' as const, description: 'Payment processed successfully', timestamp: '2 hours ago', status: 'success' as const },
        { id: '6', type: 'connection' as const, description: 'Connection failed - retrying', timestamp: '3 hours ago', status: 'error' as const },
        { id: '7', type: 'rotation' as const, description: 'Manual IP rotation requested', timestamp: '4 hours ago', status: 'success' as const },
        { id: '8', type: 'security' as const, description: 'Leak test passed', timestamp: '5 hours ago', status: 'success' as const },
    ]);

    const handleFilterChange = (type: string, dateRange: string) => {
        console.log('Filter changed:', type, dateRange);
        // TODO: Implement filtering
    };

    const handleExport = () => {
        const csv = activities.map(a => `${a.timestamp},${a.type},${a.description},${a.status}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity-log.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Activity Log</h1>
                    <p className="text-muted-foreground mt-1">Recent proxy activity and events</p>
                </div>
                <ActivityFilters onFilterChange={handleFilterChange} />
            </div>

            <ActivityLog activities={activities} onExport={handleExport} />

            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Showing {activities.length} activities
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

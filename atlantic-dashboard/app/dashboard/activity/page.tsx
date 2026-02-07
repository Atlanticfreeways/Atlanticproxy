'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ActivityPage() {
    const [filter, setFilter] = useState('');

    const activities = [
        { id: 1, time: '2 min ago', action: 'Connected', location: 'United States', ip: '192.168.1.1', status: 'success' },
        { id: 2, time: '15 min ago', action: 'IP Rotated', location: 'United Kingdom', ip: '192.168.1.2', status: 'success' },
        { id: 3, time: '32 min ago', action: 'Protocol Changed', location: 'Germany', ip: '192.168.1.3', status: 'success' },
        { id: 4, time: '1 hour ago', action: 'Connected', location: 'France', ip: '192.168.1.4', status: 'success' },
        { id: 5, time: '2 hours ago', action: 'Disconnected', location: 'Canada', ip: '192.168.1.5', status: 'info' },
        { id: 6, time: '3 hours ago', action: 'Connection Failed', location: 'Australia', ip: '192.168.1.6', status: 'error' },
        { id: 7, time: '4 hours ago', action: 'Connected', location: 'Japan', ip: '192.168.1.7', status: 'success' },
        { id: 8, time: '5 hours ago', action: 'IP Rotated', location: 'Singapore', ip: '192.168.1.8', status: 'success' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'info': return 'bg-blue-500';
            default: return 'bg-neutral-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'info': return 'ℹ';
            default: return '•';
        }
    };

    const filtered = activities.filter(
        (a) =>
            a.action.toLowerCase().includes(filter.toLowerCase()) ||
            a.location.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Activity Log</h1>
                <p className="text-neutral-400 mt-1">Recent proxy activity and events</p>
            </div>

            <Input
                placeholder="Filter by action or location..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-md bg-neutral-800 border-neutral-700 text-white"
            />

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <div className="space-y-4">
                    {filtered.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center gap-4 p-4 bg-neutral-900 rounded-lg hover:bg-neutral-850 transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-full ${getStatusColor(activity.status)} flex items-center justify-center text-white font-bold`}>
                                {getStatusIcon(activity.status)}
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-medium">{activity.action}</div>
                                <div className="text-sm text-neutral-400">
                                    {activity.location} • {activity.ip}
                                </div>
                            </div>
                            <div className="text-sm text-neutral-400">{activity.time}</div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">
                        No activities found matching your filter
                    </div>
                )}
            </Card>

            <div className="flex justify-between items-center">
                <div className="text-sm text-neutral-400">
                    Showing {filtered.length} of {activities.length} activities
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 disabled:opacity-50" disabled>
                        Previous
                    </button>
                    <button className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

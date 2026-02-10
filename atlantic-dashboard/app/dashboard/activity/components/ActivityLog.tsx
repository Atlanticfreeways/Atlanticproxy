'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Activity {
    id: string;
    type: 'connection' | 'rotation' | 'security' | 'billing';
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
}

interface ActivityFiltersProps {
    onFilterChange: (type: string, dateRange: string) => void;
}

export function ActivityFilters({ onFilterChange }: ActivityFiltersProps) {
    const [type, setType] = useState('all');
    const [dateRange, setDateRange] = useState('7d');

    const handleTypeChange = (value: string) => {
        setType(value);
        onFilterChange(value, dateRange);
    };

    const handleDateChange = (value: string) => {
        setDateRange(value);
        onFilterChange(type, value);
    };

    return (
        <div className="flex gap-4">
            <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="connection">Connection</SelectItem>
                    <SelectItem value="rotation">Rotation</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={handleDateChange}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

interface ActivityLogProps {
    activities: Activity[];
    onExport: () => void;
}

export function ActivityLog({ activities, onExport }: ActivityLogProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'connection': return 'bg-blue-500/20 text-blue-500';
            case 'rotation': return 'bg-green-500/20 text-green-500';
            case 'security': return 'bg-yellow-500/20 text-yellow-500';
            case 'billing': return 'bg-purple-500/20 text-purple-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return '✓';
            case 'warning': return '⚠';
            case 'error': return '✕';
            default: return '•';
        }
    };

    return (
        <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Activity Log</h3>
                <Button onClick={onExport} size="sm" variant="outline">
                    Export CSV
                </Button>
            </div>
            <div className="divide-y">
                {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <span className="text-lg">{getStatusIcon(activity.status)}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(activity.type)}`}>
                                        {activity.type}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                                </div>
                                <p className="text-sm">{activity.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

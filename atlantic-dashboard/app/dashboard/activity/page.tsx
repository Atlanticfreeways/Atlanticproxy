'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from '@phosphor-icons/react';

export default function ActivityLogsPage() {
    const logs = [
        { id: 1, timestamp: '2025-12-27 03:05:23', level: 'info', message: 'Connected to US East server', category: 'Connection' },
        { id: 2, timestamp: '2025-12-27 03:04:15', level: 'success', message: 'Leak test passed successfully', category: 'Security' },
        { id: 3, timestamp: '2025-12-27 03:02:45', level: 'info', message: 'Kill switch activated', category: 'Security' },
        { id: 4, timestamp: '2025-12-27 02:58:12', level: 'warning', message: 'High server load detected', category: 'Performance' },
        { id: 5, timestamp: '2025-12-27 02:55:33', level: 'info', message: 'Blocked 50 ads in the last hour', category: 'Ad-Blocking' },
        { id: 6, timestamp: '2025-12-27 02:50:01', level: 'error', message: 'Connection attempt failed, retrying...', category: 'Connection' },
        { id: 7, timestamp: '2025-12-27 02:45:22', level: 'success', message: 'Successfully reconnected', category: 'Connection' },
    ];

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'success':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'warning':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'error':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Activity Logs</h1>
                    <p className="text-neutral-400">View system logs and activity history</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download size={20} className="mr-2" />
                    Export Logs
                </Button>
            </div>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 py-3 border-b border-neutral-800 last:border-0">
                                <Badge className={getLevelColor(log.level)}>
                                    {log.level.toUpperCase()}
                                </Badge>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-white font-medium">{log.message}</p>
                                        <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                                            {log.category}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-neutral-500">{log.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

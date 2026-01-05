import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface ActivityItem {
    id: string
    type: 'connection' | 'rotation' | 'error'
    description: string
    timestamp: string // ISO string
}

interface RecentActivityCardProps {
    activities: ActivityItem[]
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString)
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } catch (e) {
            return isoString
        }
    }

    const getStatusColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'connection': return 'bg-green-500'
            case 'rotation': return 'bg-blue-500'
            case 'error': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ${getStatusColor(item.type)}`} />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.description}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

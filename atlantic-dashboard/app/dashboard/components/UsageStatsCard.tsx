import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BillingCTA } from "./BillingCTA"

interface UsageStatsCardProps {
    used: number // in GB
    total: number // in GB
    onUpgrade: () => void
}

export function UsageStatsCard({ used, total, onUpgrade }: UsageStatsCardProps) {
    // Safe calculation to avoid division by zero
    const usagePercent = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0

    return (
        <Card>
            <CardHeader>
                <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent>
                <Progress value={usagePercent} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                    {used} GB / {total} GB ({usagePercent}%)
                </p>

                <BillingCTA usagePercent={usagePercent} onUpgrade={onUpgrade} />
            </CardContent>
        </Card>
    )
}

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell } from "@phosphor-icons/react"

interface BillingCTAProps {
    usagePercent: number
    onUpgrade: () => void
}

export function BillingCTA({ usagePercent, onUpgrade }: BillingCTAProps) {
    if (usagePercent < 80) return null

    return (
        <Alert variant="warning" className="mt-4">
            <Bell className="h-4 w-4" />
            <AlertTitle>Quota Alert</AlertTitle>
            <AlertDescription>
                Running low on bandwidth ({usagePercent}% used). Upgrade to avoid interruptions.
            </AlertDescription>
            <Button variant="default" className="mt-4 w-full" onClick={onUpgrade}>
                Upgrade Now
            </Button>
        </Alert>
    )
}

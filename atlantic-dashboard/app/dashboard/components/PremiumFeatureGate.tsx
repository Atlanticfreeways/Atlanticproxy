import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "@phosphor-icons/react"

interface PremiumFeatureGateProps {
    featureName: string
    onUpgrade: () => void
}

export function PremiumFeatureGate({ featureName, onUpgrade }: PremiumFeatureGateProps) {
    return (
        <Card className="border-primary/20 bg-muted/50 border-dashed">
            <CardHeader className="items-center pb-2">
                <div className="px-3 py-1 bg-secondary rounded-full mb-2">
                    <span className="font-mono font-bold text-sm">PRO</span>
                </div>
                <CardTitle className="text-lg text-center">Premium Feature</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-medium mb-1">{featureName}</p>
                <p className="text-sm text-muted-foreground mb-4">
                    Advanced {featureName.toLowerCase()} requires a Team or Enterprise plan.
                </p>
                <Button className="w-full" onClick={onUpgrade}>
                    Upgrade to Team
                </Button>
            </CardContent>
        </Card>
    )
}

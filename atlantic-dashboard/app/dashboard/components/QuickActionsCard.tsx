import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { CaretDown } from "@phosphor-icons/react"

interface QuickActionsCardProps {
    onChangeLocation: () => void
    onRotationSettings: () => void
    onViewActivity: () => void
    onViewProtocols: () => void
    onAdblockSettings: () => void
}

export function QuickActionsCard({
    onChangeLocation,
    onRotationSettings,
    onViewActivity,
    onViewProtocols,
    onAdblockSettings
}: QuickActionsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 items-center mb-4">
                    <span className="text-sm text-muted-foreground mr-auto">Shortcuts</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label="More actions">
                                More
                                <CaretDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onChangeLocation}>
                                Change Location
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onRotationSettings}>
                                Rotation Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onViewActivity}>
                                View Activity Log
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" onClick={onChangeLocation} className="w-full justify-start">
                        Change Location
                    </Button>
                    <Button variant="outline" onClick={onRotationSettings} className="w-full justify-start">
                        Rotation Settings
                    </Button>
                    <Button variant="outline" onClick={onViewProtocols} className="w-full justify-start">
                        Connection Protocols
                    </Button>
                    <Button variant="outline" onClick={onAdblockSettings} className="w-full justify-start">
                        Adblock Filters
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}

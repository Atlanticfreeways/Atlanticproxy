import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ConnectionCardProps {
    isConnected: boolean
    ipAddress?: string
    location?: string
    isp?: string
    latency?: number
    protectionLevel?: string
    onToggleConnection: () => void
    onRotateIP?: () => void
    isLoading?: boolean
    isRotating?: boolean
}

export function ConnectionCard({
    isConnected,
    ipAddress,
    location,
    isp,
    latency,
    protectionLevel,
    onToggleConnection,
    onRotateIP,
    isLoading = false,
    isRotating = false
}: ConnectionCardProps) {
    return (
        <Card className="border-2 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Connection Status</CardTitle>
                    <div className="flex gap-2">
                        {isConnected && protectionLevel && (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                                {protectionLevel} Security
                            </Badge>
                        )}
                        <Badge
                            variant={isConnected ? "default" : "secondary"}
                            className={isConnected ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                            {isConnected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Button
                        size="lg"
                        className={`w-full h-14 text-lg font-bold transition-all ${isConnected
                            ? "bg-zinc-800 text-white hover:bg-zinc-700"
                            : "bg-white text-black hover:bg-zinc-200"
                            }`}
                        onClick={onToggleConnection}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : (isConnected ? "Disconnect" : "Connect to Proxy")}
                    </Button>

                    {isConnected && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Active IP</p>
                                <p className="text-sm font-mono text-white">{ipAddress || "Detecting..."}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Latency</p>
                                <p className={`text-sm font-medium ${(latency || 0) < 100 ? "text-green-400" : (latency || 0) < 300 ? "text-yellow-400" : "text-red-400"
                                    }`}>
                                    {latency ? `${latency}ms` : "--"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Location</p>
                                <p className="text-sm text-white truncate">{location || "Searching..."}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">ISP</p>
                                <p className="text-sm text-white truncate max-w-[120px] ml-auto">{isp || "Residential"}</p>
                            </div>
                        </div>
                    )}

                    {isConnected && (
                        <Button
                            variant="outline"
                            className="w-full border-zinc-800 hover:bg-zinc-900/50 text-zinc-400"
                            onClick={onRotateIP}
                            disabled={isRotating}
                        >
                            {isRotating ? "Rotating IP..." : "Rotate Identity"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

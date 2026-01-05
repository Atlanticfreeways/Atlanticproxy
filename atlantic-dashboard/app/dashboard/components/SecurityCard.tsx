import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldWarning, Warning } from "phosphor-react"

interface SecurityCardProps {
    score: number
    isIpLeak: boolean
    isDnsLeak: boolean
    message: string
}

export function SecurityCard({ score, isIpLeak, isDnsLeak, message }: SecurityCardProps) {
    const isSecure = score > 80 && !isIpLeak && !isDnsLeak;

    return (
        <Card className="border-2">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        {isSecure ? (
                            <ShieldCheck className="h-6 w-6 text-green-500" weight="fill" />
                        ) : (
                            <ShieldWarning className="h-6 w-6 text-red-500" weight="fill" />
                        )}
                        Privacy Shield
                    </CardTitle>
                    <Badge variant={isSecure ? "default" : "destructive"}
                        className={isSecure ? "bg-green-500 hover:bg-green-600" : ""}>
                        {isSecure ? "Protected" : "At Risk"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Anonymity Score</span>
                        <span className={`font-bold ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'
                            }`}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                        <div className={`w-2 h-2 rounded-full ${!isIpLeak ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-muted-foreground">IP Leak</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                        <div className={`w-2 h-2 rounded-full ${!isDnsLeak ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-muted-foreground">DNS Leak</span>
                    </div>
                </div>

                {!isSecure && (
                    <div className="flex items-start gap-2 p-3 text-sm text-red-400 bg-red-950/20 rounded-md border border-red-900/50">
                        <Warning className="h-5 w-5 shrink-0" />
                        <p>{message}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

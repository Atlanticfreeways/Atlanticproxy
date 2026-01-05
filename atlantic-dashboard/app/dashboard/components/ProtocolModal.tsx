import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "phosphor-react"
import { useEffect, useState } from "react"
import { apiClient, ProtocolCredentials } from "@/lib/api"

interface ProtocolModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function ProtocolModal({ isOpen, onOpenChange }: ProtocolModalProps) {
    const [creds, setCreds] = useState<ProtocolCredentials | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            apiClient.getProtocolCredentials().then(setCreds).catch(console.error);
        }
    }, [isOpen]);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!creds) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connection Protocols</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="socks5" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="socks5">SOCKS5</TabsTrigger>
                        <TabsTrigger value="shadowsocks">Shadowsocks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="socks5" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Host</Label>
                            <div className="flex gap-2">
                                <Input value={creds.socks5.host} readOnly />
                                <Button size="icon" variant="outline" onClick={() => handleCopy(creds.socks5.host, 'host')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Port</Label>
                            <div className="flex gap-2">
                                <Input value={creds.socks5.port.toString()} readOnly />
                                <Button size="icon" variant="outline" onClick={() => handleCopy(creds.socks5.port.toString(), 'port')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500">
                            <strong>Note:</strong> Standard residential proxy access. Authentication is handled automatically via IP binding or session token.
                        </div>
                    </TabsContent>

                    <TabsContent value="shadowsocks" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Server URI (Import Link)</Label>
                            <div className="flex gap-2">
                                <Input value={creds.shadowsocks.uri} readOnly className="font-mono text-xs" />
                                <Button size="icon" variant="outline" onClick={() => handleCopy(creds.shadowsocks.uri, 'uri')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Method</Label>
                                <Input value={creds.shadowsocks.method} readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input value={creds.shadowsocks.password} readOnly type="password" />
                            </div>
                        </div>
                        <div className="rounded-md bg-blue-500/10 p-3 text-sm text-blue-500">
                            <strong>Premium:</strong> Encrypted AES-256 traffic masking. Use this for censorship circumvention or maximum privacy.
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { apiClient, RotationConfig } from "@/lib/api"
import { toast } from "sonner"

interface RotationSettingsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function RotationSettingsModal({ isOpen, onOpenChange }: RotationSettingsModalProps) {
    const [config, setConfig] = useState<RotationConfig | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            apiClient.getRotationConfig().then(setConfig).catch(console.error);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!config) return;
        setLoading(true);
        try {
            await apiClient.setRotationConfig(config);
            toast.success("Rotation settings updated");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    if (!config) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>IP Rotation Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Rotation Mode</Label>
                        <Select
                            value={config.mode}
                            onValueChange={(val: any) => setConfig({ ...config, mode: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="per-request">Per Request (High Anonymity)</SelectItem>
                                <SelectItem value="sticky-1min">Sticky (1 Minute)</SelectItem>
                                <SelectItem value="sticky-10min">Sticky (10 Minutes)</SelectItem>
                                <SelectItem value="sticky-30min">Sticky (30 Minutes)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            "Per Request" changes IP on every call. "Sticky" keeps the same IP for a duration, useful for sessions.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Country (ISO Code)</Label>
                        <Input
                            value={config.country}
                            onChange={(e) => setConfig({ ...config, country: e.target.value.toUpperCase() })}
                            placeholder="US, UK, DE..."
                            maxLength={2}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

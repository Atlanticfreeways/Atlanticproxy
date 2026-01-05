import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { Shield, ShieldSlash } from "phosphor-react"

interface AdblockSettingsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function AdblockSettingsModal({ isOpen, onOpenChange }: AdblockSettingsModalProps) {
    const [config, setConfig] = useState<{ categories: Record<string, boolean> } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            apiClient.getAdblockConfig().then(setConfig).catch(console.error);
        }
    }, [isOpen]);

    const handleToggle = async (category: string, enabled: boolean) => {
        // Optimistic update
        if (config) {
            setConfig({
                ...config,
                categories: { ...config.categories, [category]: enabled }
            });
        }

        try {
            await apiClient.toggleAdblockCategory(category, enabled);
            toast.success(`${enabled ? 'Enabled' : 'Disabled'} ${category} blocking`);
        } catch (error) {
            toast.error("Failed to update setting");
            // Revert on error
            if (config) {
                setConfig({
                    ...config,
                    categories: { ...config.categories, [category]: !enabled }
                });
            }
        }
    };

    if (!config) return null;

    const categories = [
        { id: "ads", label: "Ads & Trackers", desc: "Block annoyances and trackers" },
        { id: "malware", label: "Malware & Phishing", desc: "Protect against malicious sites" },
        { id: "social", label: "Social Media", desc: "Block social widgets" },
        { id: "adult", label: "Adult Content", desc: "Strict parental control" },
        { id: "gambling", label: "Gambling", desc: "Block gambling sites" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Adblock & Filters
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor={cat.id} className="font-medium">{cat.label}</Label>
                                <span className="text-xs text-muted-foreground">{cat.desc}</span>
                            </div>
                            <Switch
                                id={cat.id}
                                checked={config.categories[cat.id] || false}
                                onCheckedChange={(val) => handleToggle(cat.id, val)}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

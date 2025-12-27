'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-neutral-400">Configure your proxy preferences</p>
            </div>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Launch on Startup</p>
                            <p className="text-sm text-neutral-400">Start AtlanticProxy when system boots</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Minimize to Tray</p>
                            <p className="text-sm text-neutral-400">Keep running in system tray when closed</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-white font-medium">Dark Mode</p>
                            <p className="text-sm text-neutral-400">Use dark theme</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Connection Changes</p>
                            <p className="text-sm text-neutral-400">Notify when connection status changes</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Security Alerts</p>
                            <p className="text-sm text-neutral-400">Notify about security events</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-white font-medium">Ad-Blocking Stats</p>
                            <p className="text-sm text-neutral-400">Show periodic ad-blocking statistics</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                    Reset to Defaults
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

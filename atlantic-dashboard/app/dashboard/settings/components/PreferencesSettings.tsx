'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PreferencesSettings() {
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');
    const [notifications, setNotifications] = useState({
        email: true,
        desktop: false,
        usage: true,
        security: true,
    });

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Theme</label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm text-muted-foreground">Receive updates via email</div>
                        </div>
                        <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Desktop Notifications</div>
                            <div className="text-sm text-muted-foreground">Show browser notifications</div>
                        </div>
                        <Switch
                            checked={notifications.desktop}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, desktop: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Usage Alerts</div>
                            <div className="text-sm text-muted-foreground">Alert when reaching quota limits</div>
                        </div>
                        <Switch
                            checked={notifications.usage}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, usage: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Security Alerts</div>
                            <div className="text-sm text-muted-foreground">Notify about security events</div>
                        </div>
                        <Switch
                            checked={notifications.security}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

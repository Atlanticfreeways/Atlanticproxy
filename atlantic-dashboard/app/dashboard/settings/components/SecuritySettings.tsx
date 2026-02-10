'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function SecuritySettings() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState([
        { id: '1', device: 'Chrome on macOS', location: 'New York, US', lastActive: '2 minutes ago', current: true },
        { id: '2', device: 'Safari on iPhone', location: 'New York, US', lastActive: '1 hour ago', current: false },
        { id: '3', device: 'Firefox on Windows', location: 'London, UK', lastActive: '2 days ago', current: false },
    ]);

    const handleRevokeSession = (id: string) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Enable 2FA</div>
                        <div className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                        </div>
                    </div>
                    <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                    />
                </div>
                {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm">Scan this QR code with your authenticator app</p>
                        <div className="mt-2 w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-xs text-black">QR Code</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    {session.device}
                                    {session.current && (
                                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">{session.location}</div>
                                <div className="text-xs text-muted-foreground">Last active: {session.lastActive}</div>
                            </div>
                            {!session.current && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRevokeSession(session.id)}
                                >
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
    const [autoConnect, setAutoConnect] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-neutral-400 mb-2 block">Email</label>
                        <Input
                            type="email"
                            defaultValue="user@example.com"
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-neutral-400 mb-2 block">Username</label>
                        <Input
                            type="text"
                            defaultValue="user_demo"
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </div>
                    <Button className="bg-sky-500 hover:bg-sky-600">Save Changes</Button>
                </div>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Auto-connect on startup</div>
                            <div className="text-sm text-neutral-400">Automatically connect to last used location</div>
                        </div>
                        <button
                            onClick={() => setAutoConnect(!autoConnect)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                                autoConnect ? 'bg-sky-500' : 'bg-neutral-600'
                            }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    autoConnect ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Notifications</div>
                            <div className="text-sm text-neutral-400">Receive usage alerts and updates</div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                                notifications ? 'bg-sky-500' : 'bg-neutral-600'
                            }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    notifications ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Dark mode</div>
                            <div className="text-sm text-neutral-400">Use dark theme</div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                                darkMode ? 'bg-sky-500' : 'bg-neutral-600'
                            }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    darkMode ? 'translate-x-6' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-neutral-400 mb-2 block">Current Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-neutral-400 mb-2 block">New Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-neutral-400 mb-2 block">Confirm Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </div>
                    <Button className="bg-sky-500 hover:bg-sky-600">Update Password</Button>
                </div>
            </Card>

            <Card className="bg-red-500/10 border-red-500/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Danger Zone</h3>
                <p className="text-sm text-neutral-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                    Delete Account
                </Button>
            </Card>
        </div>
    );
}

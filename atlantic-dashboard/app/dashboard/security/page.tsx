'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldWarning, Lock } from '@phosphor-icons/react';

export default function SecurityPage() {
    const [killSwitch, setKillSwitch] = useState(true);
    const [autoReconnect, setAutoReconnect] = useState(true);
    const [leakDetection, setLeakDetection] = useState(true);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
                <p className="text-neutral-400">Manage your security settings and view protection status</p>
            </div>

            {/* Security Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <ShieldCheck size={32} className="text-green-500" weight="fill" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">IP Leak</p>
                                <p className="text-xl font-bold text-white">Protected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <ShieldCheck size={32} className="text-green-500" weight="fill" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">DNS Leak</p>
                                <p className="text-xl font-bold text-white">Protected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Lock size={32} className="text-green-500" weight="fill" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400">WebRTC</p>
                                <p className="text-xl font-bold text-white">Blocked</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Settings */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Kill Switch</p>
                            <p className="text-sm text-neutral-400">Block internet if VPN connection drops</p>
                        </div>
                        <Switch checked={killSwitch} onCheckedChange={setKillSwitch} />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-neutral-800">
                        <div>
                            <p className="text-white font-medium">Auto-Reconnect</p>
                            <p className="text-sm text-neutral-400">Automatically reconnect if connection is lost</p>
                        </div>
                        <Switch checked={autoReconnect} onCheckedChange={setAutoReconnect} />
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-white font-medium">Leak Detection</p>
                            <p className="text-sm text-neutral-400">Continuously monitor for IP and DNS leaks</p>
                        </div>
                        <Switch checked={leakDetection} onCheckedChange={setLeakDetection} />
                    </div>
                </CardContent>
            </Card>

            {/* Leak Test */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Anonymity Verification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-neutral-400">Run a comprehensive test to verify your anonymity and detect any potential leaks.</p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <ShieldCheck size={20} className="mr-2" />
                            Run Leak Test
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Logs */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-green-500" />
                                <div>
                                    <p className="text-white font-medium">Leak test passed</p>
                                    <p className="text-sm text-neutral-400">2 hours ago</p>
                                </div>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Success</Badge>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-green-500" />
                                <div>
                                    <p className="text-white font-medium">Kill switch activated</p>
                                    <p className="text-sm text-neutral-400">5 hours ago</p>
                                </div>
                            </div>
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Info</Badge>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <ShieldWarning size={20} className="text-yellow-500" />
                                <div>
                                    <p className="text-white font-medium">Connection interrupted</p>
                                    <p className="text-sm text-neutral-400">1 day ago</p>
                                </div>
                            </div>
                            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Warning</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

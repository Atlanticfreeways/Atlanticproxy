'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, MapPin, Clock, Shield, Globe } from 'lucide-react';
import { apiClient, RotationConfig, Session } from '@/lib/api';

export default function RotationPage() {
    const [config, setConfig] = useState<RotationConfig | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [rotating, setRotating] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(refreshSession, 5000); // Poll session status
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [cfg, sess] = await Promise.all([
                apiClient.getRotationConfig(),
                apiClient.getCurrentSession()
            ]);
            setConfig(cfg);
            setSession(sess);
        } catch (error) {
            console.error('Failed to load rotation data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSession = async () => {
        try {
            const sess = await apiClient.getCurrentSession();
            setSession(sess);
        } catch (error) {
            // fail silently on poll
        }
    };

    const handleModeChange = async (value: string) => {
        if (!config) return;
        const newConfig = { ...config, mode: value as any };
        try {
            await apiClient.setRotationConfig(newConfig);
            setConfig(newConfig);
            // Mode change might force rotation
            refreshSession();
        } catch (error) {
            console.error('Failed to set mode:', error);
        }
    };

    const handleGeoChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        try {
            await apiClient.setGeoTargeting({
                country: config.country,
                city: config.city,
                state: config.state
            });
            // refresh config provided by backend potentially sanitized
            refreshSession();
        } catch (error) {
            console.error('Failed to set geo:', error);
        }
    };

    const handleForceRotation = async () => {
        setRotating(true);
        try {
            const sess = await apiClient.forceRotation();
            setSession(sess);
        } catch (error) {
            console.error('Failed to force rotation:', error);
        } finally {
            setRotating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading rotation settings...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">IP Rotation</h1>
                <p className="text-gray-400 mt-2">Manage your IP rotation strategy and geographic targeting.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Config Card */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-400" />
                            Rotation Strategy
                        </CardTitle>
                        <CardDescription>Configure how and when your IP address changes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Rotation Mode</label>
                            <Select
                                value={config?.mode}
                                onValueChange={handleModeChange}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per-request">Per Request (High Anonymity)</SelectItem>
                                    <SelectItem value="sticky-1min">Sticky (1 Minute)</SelectItem>
                                    <SelectItem value="sticky-10min">Sticky (10 Minutes)</SelectItem>
                                    <SelectItem value="sticky-30min">Sticky (30 Minutes)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {config?.mode !== 'per-request' && (
                            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-300">
                                <span className="font-semibold">Sticky Mode Active:</span> You will keep the same IP for the duration or until you manually rotate.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Geo Targeting Card */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-emerald-400" />
                            Geographic Targeting
                        </CardTitle>
                        <CardDescription>Target specific locations for your exit node</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGeoChange} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Country Code</label>
                                    <Input
                                        value={config?.country || ''}
                                        onChange={(e) => setConfig(config ? { ...config, country: e.target.value } : null)}
                                        className="bg-white/5 border-white/10"
                                        placeholder="US, GB, DE..."
                                        maxLength={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">State (Optional)</label>
                                    <Input
                                        value={config?.state || ''}
                                        onChange={(e) => setConfig(config ? { ...config, state: e.target.value } : null)}
                                        className="bg-white/5 border-white/10"
                                        placeholder="CA, NY..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">City (Optional)</label>
                                <Input
                                    value={config?.city || ''}
                                    onChange={(e) => setConfig(config ? { ...config, city: e.target.value } : null)}
                                    className="bg-white/5 border-white/10"
                                    placeholder="New York, London..."
                                />
                            </div>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Update Location
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Session Status */}
            <Card className="border-white/10 bg-gradient-to-br from-black/40 to-purple-900/10 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className={`h-5 w-5 text-blue-400 ${rotating ? 'animate-spin' : ''}`} />
                        Current Session
                    </CardTitle>
                    <CardDescription>Live status of your current proxy session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Session ID</div>
                            <div className="font-mono font-medium text-lg truncate" title={session?.ID}>
                                {session?.ID || 'No Active Session'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">IP Location</div>
                            <div className="font-medium text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-400" />
                                {session?.Location || 'Auto / Random'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Created At</div>
                            <div className="font-medium text-lg">
                                {session?.CreatedAt ? new Date(session.CreatedAt).toLocaleTimeString() : '-'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Expires In</div>
                            <div className="font-medium text-lg flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-400" />
                                {session?.Duration ? `${Math.ceil((new Date(session.ExpiresAt).getTime() - Date.now()) / 60000)} min` : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleForceRotation}
                            disabled={rotating}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
                            {rotating ? 'Rotating IP...' : 'Rotate IP Now'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

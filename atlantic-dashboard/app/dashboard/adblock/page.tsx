'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Trash, ArrowsClockwise, ShieldCheck, Bug, Prohibit } from '@phosphor-icons/react';
import { apiClient, AdblockStats } from '@/lib/api';

export default function AdBlockPage() {
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [stats, setStats] = useState<AdblockStats | null>(null);
    const [customRules, setCustomRules] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [whitelistData, statsData, rulesData] = await Promise.all([
                apiClient.getWhitelist(),
                apiClient.getAdblockStats(),
                apiClient.getCustomRules()
            ]);
            setWhitelist(whitelistData);
            setStats(statsData);
            setCustomRules(rulesData.join('\n'));
        } catch (error) {
            console.error('Failed to load adblock data:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await apiClient.refreshAdblock();
            // Poll for updates or just wait a bit
            setTimeout(loadData, 2000);
        } catch (error) {
            console.error('Failed to refresh blocklists:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSaveRules = async () => {
        const rules = customRules.split('\n').map(r => r.trim()).filter(r => r);
        try {
            await apiClient.setCustomRules(rules);
            // Show toast or success
            loadData();
        } catch (error) {
            console.error('Failed to save custom rules:', error);
        }
    };

    const handleAdd = async () => {
        if (!newDomain) return;
        try {
            await apiClient.addToWhitelist(newDomain);
            setWhitelist([...whitelist, newDomain.toLowerCase()]);
            setNewDomain('');
        } catch (error) {
            console.error('Failed to add to whitelist:', error);
        }
    };

    const handleRemove = async (domain: string) => {
        try {
            await apiClient.removeFromWhitelist(domain);
            setWhitelist(whitelist.filter(d => d !== domain));
        } catch (error) {
            console.error('Failed to remove from whitelist:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Ad-Blocking</h1>
                    <p className="text-neutral-400">Configure ad-blocking and tracking protection</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-white font-medium">Last Updated</p>
                        <p className="text-xs text-neutral-400">
                            {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : 'Never'}
                        </p>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                    >
                        <ArrowsClockwise className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={18} />
                        {refreshing ? 'Updating...' : 'Update Lists'}
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Ads Blocked</CardTitle>
                        <Prohibit className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.ads || 0}</div>
                        <p className="text-xs text-neutral-400">+12% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Trackers Blocked</CardTitle>
                        <Bug className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.trackers || 0}</div>
                        <p className="text-xs text-neutral-400">Privacy score: High</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Active Rules</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {(stats?.rules_count || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-neutral-400">Across 3 lists</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Domain Whitelist */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-white">Domain Whitelist</CardTitle>
                        <CardDescription>Allowed domains that bypass all filters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="example.com"
                                className="bg-neutral-950/50 border-neutral-800 text-white"
                                value={newDomain}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDomain(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAdd()}
                            />
                            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                                <Plus size={20} />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {whitelist.length === 0 ? (
                                <p className="text-neutral-500 text-sm text-center py-4">No domains whitelisted</p>
                            ) : (
                                whitelist.map((domain) => (
                                    <div key={domain} className="flex items-center justify-between p-3 bg-neutral-950/30 rounded border border-neutral-800/50 hover:bg-neutral-950/50 transition-colors">
                                        <span className="text-white text-sm font-medium">{domain}</span>
                                        <button
                                            onClick={() => handleRemove(domain)}
                                            className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Rules */}
                <Card className="glass-card flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-white">Custom Filter Rules</CardTitle>
                        <CardDescription>Add custom domains to block (one per line)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <textarea
                            className="flex-1 min-h-[300px] w-full bg-neutral-950/50 border border-neutral-800 rounded-md p-4 text-sm font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            placeholder="example-ads.com&#10;tracking-site.net"
                            value={customRules}
                            onChange={(e) => setCustomRules(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleSaveRules} className="bg-green-600 hover:bg-green-700">
                                Save Custom Rules
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

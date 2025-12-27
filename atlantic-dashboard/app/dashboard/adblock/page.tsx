'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Trash } from '@phosphor-icons/react';

import { apiClient } from '@/lib/api';

export default function AdBlockPage() {
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState('');

    useEffect(() => {
        const fetchWhitelist = async () => {
            try {
                const domains = await apiClient.getWhitelist();
                setWhitelist(domains);
            } catch (error) {
                console.error('Failed to fetch whitelist:', error);
            }
        };
        fetchWhitelist();
    }, []);

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Ad-Blocking</h1>
                <p className="text-neutral-400">Configure ad-blocking and tracking protection</p>
            </div>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Ad-Blocking Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-neutral-400">Ads Blocked Today</p>
                            <p className="text-3xl font-bold text-white mt-2">1,247</p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Trackers Blocked</p>
                            <p className="text-3xl font-bold text-white mt-2">892</p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Data Saved</p>
                            <p className="text-3xl font-bold text-white mt-2">45 MB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Blocking Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                            <div>
                                <p className="text-white font-medium">Advertisements</p>
                                <p className="text-sm text-neutral-400">Block display and video ads</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-neutral-800">
                            <div>
                                <p className="text-white font-medium">Trackers</p>
                                <p className="text-sm text-neutral-400">Block analytics and tracking scripts</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-white font-medium">Malware & Phishing</p>
                                <p className="text-sm text-neutral-400">Block known malicious domains</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">Domain Whitelist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="example.com"
                                className="bg-neutral-950 border-neutral-800 text-white"
                                value={newDomain}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDomain(e.target.value)}
                            />
                            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                                <Plus size={20} />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {whitelist.length === 0 ? (
                                <p className="text-neutral-500 text-sm text-center py-4">No domains whitelisted</p>
                            ) : (
                                whitelist.map((domain) => (
                                    <div key={domain} className="flex items-center justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                                        <span className="text-white text-sm">{domain}</span>
                                        <button
                                            onClick={() => handleRemove(domain)}
                                            className="text-neutral-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

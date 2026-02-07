'use client';

import { useEffect, useState } from 'react';
import { apiClient, Location } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadLocations();
        const saved = localStorage.getItem('favorite_locations');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const loadLocations = async () => {
        try {
            const data = await apiClient.getLocations();
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (countryCode: string) => {
        try {
            await apiClient.setRotationConfig({
                mode: 'sticky-10min',
                country: countryCode.toLowerCase(),
            });
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const toggleFavorite = (code: string) => {
        const updated = favorites.includes(code)
            ? favorites.filter(f => f !== code)
            : [...favorites, code];
        setFavorites(updated);
        localStorage.setItem('favorite_locations', JSON.stringify(updated));
    };

    const filtered = locations.filter(loc =>
        loc.country_name.toLowerCase().includes(search.toLowerCase()) ||
        loc.country_code.toLowerCase().includes(search.toLowerCase())
    );

    const favoriteLocations = locations.filter(loc => favorites.includes(loc.country_code));

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-neutral-400">Loading locations...</div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Locations</h1>
                <p className="text-neutral-400 mt-1">Select your proxy location</p>
            </div>

            <Input
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md bg-neutral-800 border-neutral-700 text-white"
            />

            {favoriteLocations.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-3">⭐ Quick Connect</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {favoriteLocations.slice(0, 3).map(loc => (
                            <Card key={loc.country_code} className="bg-neutral-800 border-neutral-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl mb-1">{getFlag(loc.country_code)}</div>
                                        <div className="text-white font-medium">{loc.country_name}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleConnect(loc.country_code)}
                                        size="sm"
                                        className="bg-sky-500 hover:bg-sky-600"
                                    >
                                        Connect
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold text-white mb-3">
                    📍 All Locations ({filtered.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(loc => (
                        <Card key={loc.country_code} className="bg-neutral-800 border-neutral-700 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getFlag(loc.country_code)}</div>
                                    <div>
                                        <div className="text-white font-medium">{loc.country_name}</div>
                                        {loc.cities.length > 0 && (
                                            <div className="text-xs text-neutral-400">
                                                {loc.cities.length} cities
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(loc.country_code)}
                                    className="text-xl"
                                >
                                    {favorites.includes(loc.country_code) ? '⭐' : '☆'}
                                </button>
                            </div>
                            <Button
                                onClick={() => handleConnect(loc.country_code)}
                                className="w-full bg-sky-500 hover:bg-sky-600"
                                size="sm"
                            >
                                Connect
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getFlag(code: string): string {
    const flags: Record<string, string> = {
        US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CA: '🇨🇦',
        AU: '🇦🇺', JP: '🇯🇵', SG: '🇸🇬', NL: '🇳🇱', BR: '🇧🇷',
    };
    return flags[code] || '🌍';
}

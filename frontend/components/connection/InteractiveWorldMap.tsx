'use client';

import { useState } from 'react';

interface ProxyLocation {
  id: string;
  country: string;
  city: string;
  region: string;
  servers: number;
  latency: number;
  uptime: number;
  available: boolean;
}

export default function InteractiveWorldMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ProxyLocation | null>(null);

  const locations: ProxyLocation[] = [
    { id: '1', country: 'United States', city: 'New York', region: 'us-east', servers: 150, latency: 12, uptime: 99.9, available: true },
    { id: '2', country: 'United States', city: 'Los Angeles', region: 'us-west', servers: 120, latency: 45, uptime: 99.8, available: true },
    { id: '3', country: 'United Kingdom', city: 'London', region: 'eu-west', servers: 80, latency: 28, uptime: 99.7, available: true },
    { id: '4', country: 'Germany', city: 'Frankfurt', region: 'eu-central', servers: 100, latency: 35, uptime: 99.9, available: true },
    { id: '5', country: 'Japan', city: 'Tokyo', region: 'asia-east', servers: 90, latency: 85, uptime: 99.6, available: true },
    { id: '6', country: 'Australia', city: 'Sydney', region: 'asia-pacific', servers: 60, latency: 120, uptime: 99.5, available: true },
    { id: '7', country: 'Canada', city: 'Toronto', region: 'north-america', servers: 70, latency: 18, uptime: 99.8, available: true },
    { id: '8', country: 'Brazil', city: 'São Paulo', region: 'south-america', servers: 50, latency: 95, uptime: 99.4, available: false },
  ];

  const regions = [
    { id: 'north-america', name: 'North America', color: 'bg-blue-500' },
    { id: 'south-america', name: 'South America', color: 'bg-green-500' },
    { id: 'eu-west', name: 'Europe West', color: 'bg-purple-500' },
    { id: 'eu-central', name: 'Europe Central', color: 'bg-indigo-500' },
    { id: 'asia-east', name: 'Asia East', color: 'bg-orange-500' },
    { id: 'asia-pacific', name: 'Asia Pacific', color: 'bg-pink-500' },
  ];

  const getLatencyColor = (latency: number) => {
    if (latency < 30) return 'text-green-600';
    if (latency < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.8) return 'text-green-600';
    if (uptime >= 99.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Proxy Locations</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 min-h-96">
            <h4 className="font-bold text-gray-900 mb-4">Global Server Network</h4>
            
            {/* ASCII World Map Representation */}
            <div className="font-mono text-xs text-gray-600 mb-6 overflow-x-auto">
              <pre>{`
    🌍 GLOBAL PROXY NETWORK
    
    ┌─────────────────────────────────────────┐
    │  🇺🇸 North America                      │
    │  ├─ New York (12ms) ✓                   │
    │  └─ Los Angeles (45ms) ✓                │
    │                                         │
    │  🇪🇺 Europe                             │
    │  ├─ London (28ms) ✓                     │
    │  └─ Frankfurt (35ms) ✓                  │
    │                                         │
    │  🌏 Asia Pacific                        │
    │  ├─ Tokyo (85ms) ✓                      │
    │  └─ Sydney (120ms) ✓                    │
    │                                         │
    │  🇧🇷 South America                      │
    │  └─ São Paulo (95ms) ✗                  │
    └─────────────────────────────────────────┘
              `}</pre>
            </div>

            {/* Region Filters */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Region:</p>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedRegion === region.id
                        ? `${region.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Available Locations</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {locations
              .filter(loc => !selectedRegion || loc.region === selectedRegion)
              .map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedLocation?.id === location.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${!location.available ? 'opacity-50' : ''}`}
                  disabled={!location.available}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-bold text-sm text-gray-900">{location.city}</p>
                    <span className={`text-xs font-bold ${location.available ? 'text-green-600' : 'text-red-600'}`}>
                      {location.available ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{location.country}</p>
                  <div className="flex justify-between text-xs">
                    <span className={getLatencyColor(location.latency)}>
                      {location.latency}ms
                    </span>
                    <span className={getUptimeColor(location.uptime)}>
                      {location.uptime}% up
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-3">📍 {selectedLocation.city}, {selectedLocation.country}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-700 mb-1">Servers</p>
              <p className="font-bold text-blue-900">{selectedLocation.servers}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Latency</p>
              <p className={`font-bold ${getLatencyColor(selectedLocation.latency)}`}>
                {selectedLocation.latency}ms
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Uptime</p>
              <p className={`font-bold ${getUptimeColor(selectedLocation.uptime)}`}>
                {selectedLocation.uptime}%
              </p>
            </div>
            <div>
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
          <div>✓ = Available</div>
          <div>✗ = Unavailable</div>
          <div>🟢 &lt;30ms = Excellent</div>
          <div>🟡 30-60ms = Good</div>
        </div>
      </div>
    </div>
  );
}

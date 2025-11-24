'use client';

import { useState } from 'react';

interface Location {
  id: string;
  country: string;
  city: string;
  servers: number;
  selected: boolean;
}

export default function BulkLocationSelection() {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', country: 'United States', city: 'New York', servers: 150, selected: false },
    { id: '2', country: 'United States', city: 'Los Angeles', servers: 120, selected: false },
    { id: '3', country: 'United Kingdom', city: 'London', servers: 80, selected: false },
    { id: '4', country: 'Germany', city: 'Frankfurt', servers: 100, selected: false },
    { id: '5', country: 'Japan', city: 'Tokyo', servers: 90, selected: false },
    { id: '6', country: 'Australia', city: 'Sydney', servers: 60, selected: false },
    { id: '7', country: 'Canada', city: 'Toronto', servers: 70, selected: false },
    { id: '8', country: 'Brazil', city: 'São Paulo', servers: 50, selected: false },
  ]);

  const [loadBalancingMode, setLoadBalancingMode] = useState<'round-robin' | 'least-connections' | 'random'>('round-robin');
  const [saved, setSaved] = useState(false);

  const selectedCount = locations.filter(l => l.selected).length;

  const handleToggleLocation = (id: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  };

  const handleSelectAll = () => {
    setLocations(locations.map(l => ({ ...l, selected: true })));
  };

  const handleDeselectAll = () => {
    setLocations(locations.map(l => ({ ...l, selected: false })));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const groupedByCountry = locations.reduce((acc, loc) => {
    if (!acc[loc.country]) acc[loc.country] = [];
    acc[loc.country].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Bulk Location Selection</h3>
          <p className="text-sm text-gray-600 mt-1">
            Select multiple locations for load balancing
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Configuration
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Location configuration saved
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Selection */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Deselect All
            </button>
            <span className="ml-auto text-sm font-medium text-gray-700">
              {selectedCount} selected
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedByCountry).map(([country, locs]) => (
              <div key={country} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">{country}</h4>
                <div className="space-y-2">
                  {locs.map((location) => (
                    <label
                      key={location.id}
                      className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={location.selected}
                        onChange={() => handleToggleLocation(location.id)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{location.city}</p>
                        <p className="text-xs text-gray-600">{location.servers} servers</p>
                      </span>
                      {location.selected && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Balancing Configuration */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 mb-4">Load Balancing</h4>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="loadbalancing"
                  value="round-robin"
                  checked={loadBalancingMode === 'round-robin'}
                  onChange={(e) => setLoadBalancingMode(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="ml-2">
                  <p className="font-medium text-sm text-gray-900">Round Robin</p>
                  <p className="text-xs text-gray-600">Distribute evenly</p>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="loadbalancing"
                  value="least-connections"
                  checked={loadBalancingMode === 'least-connections'}
                  onChange={(e) => setLoadBalancingMode(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="ml-2">
                  <p className="font-medium text-sm text-gray-900">Least Connections</p>
                  <p className="text-xs text-gray-600">Use least busy</p>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="loadbalancing"
                  value="random"
                  checked={loadBalancingMode === 'random'}
                  onChange={(e) => setLoadBalancingMode(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="ml-2">
                  <p className="font-medium text-sm text-gray-900">Random</p>
                  <p className="text-xs text-gray-600">Random selection</p>
                </span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm font-bold text-blue-900 mb-3">Configuration Summary</p>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>Locations:</strong> {selectedCount} selected
              </p>
              <p>
                <strong>Mode:</strong> {loadBalancingMode.replace('-', ' ')}
              </p>
              <p>
                <strong>Total Servers:</strong>{' '}
                {locations
                  .filter(l => l.selected)
                  .reduce((sum, l) => sum + l.servers, 0)}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm font-bold text-green-900 mb-2">✓ Benefits</p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Improved reliability</li>
              <li>• Better performance</li>
              <li>• Automatic failover</li>
              <li>• Reduced latency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

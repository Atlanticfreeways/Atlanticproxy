'use client';

import { useState } from 'react';

interface FilterState {
  proxyTypes: string[];
  bandwidthMin: number;
  bandwidthMax: number;
  priceMin: number;
  priceMax: number;
  speedMin: number;
}

export default function AdvancedFiltering() {
  const [filters, setFilters] = useState<FilterState>({
    proxyTypes: [],
    bandwidthMin: 1,
    bandwidthMax: 100,
    priceMin: 0,
    priceMax: 500,
    speedMin: 0,
  });

  const handleProxyTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      proxyTypes: prev.proxyTypes.includes(type)
        ? prev.proxyTypes.filter(t => t !== type)
        : [...prev.proxyTypes, type]
    }));
  };

  const handleReset = () => {
    setFilters({
      proxyTypes: [],
      bandwidthMin: 1,
      bandwidthMax: 100,
      priceMin: 0,
      priceMax: 500,
      speedMin: 0,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Advanced Filters</h3>
        <button onClick={handleReset} className="text-blue-600 hover:underline text-sm">
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Proxy Types */}
        <div>
          <label className="block text-sm font-semibold mb-3">Proxy Type</label>
          <div className="space-y-2">
            {['Residential', 'Datacenter', 'Mobile'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.proxyTypes.includes(type)}
                  onChange={() => handleProxyTypeToggle(type)}
                  className="w-4 h-4"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bandwidth Range */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Bandwidth: {filters.bandwidthMin}GB - {filters.bandwidthMax}GB
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.bandwidthMax}
            onChange={(e) => setFilters({ ...filters, bandwidthMax: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Price: ${filters.priceMin} - ${filters.priceMax}
          </label>
          <input
            type="range"
            min="0"
            max="500"
            value={filters.priceMax}
            onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Minimum Speed */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Minimum Speed: {filters.speedMin} Mbps
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={filters.speedMin}
            onChange={(e) => setFilters({ ...filters, speedMin: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
        Apply Filters
      </button>
    </div>
  );
}

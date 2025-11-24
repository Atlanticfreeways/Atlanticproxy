'use client';

import { useState, useEffect } from 'react';

interface Location {
  id: string;
  country: string;
  countryCode: string;
  state?: string;
  city?: string;
  ispProvider: string;
  proxyType: 'Residential' | 'Datacenter' | 'Mobile';
  speed: number;
  latency: number;
  uptime: number;
  available: boolean;
}

export default function LocationSelector() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedISPs, setSelectedISPs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'speed' | 'latency' | 'uptime'>('speed');

  useEffect(() => {
    // Mock data - replace with API call
    const mockLocations: Location[] = [
      {
        id: '1',
        country: 'United States',
        countryCode: 'US',
        state: 'California',
        city: 'Los Angeles',
        ispProvider: 'Verizon',
        proxyType: 'Residential',
        speed: 95.2,
        latency: 12,
        uptime: 99.8,
        available: true
      },
      {
        id: '2',
        country: 'United States',
        countryCode: 'US',
        state: 'New York',
        city: 'New York City',
        ispProvider: 'AT&T',
        proxyType: 'Datacenter',
        speed: 120.5,
        latency: 8,
        uptime: 99.9,
        available: true
      }
    ];
    
    setLocations(mockLocations);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = [...locations];

    if (searchTerm) {
      filtered = filtered.filter(loc =>
        loc.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.ispProvider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountries.length > 0) {
      filtered = filtered.filter(loc => selectedCountries.includes(loc.country));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'speed': return b.speed - a.speed;
        case 'latency': return a.latency - b.latency;
        case 'uptime': return b.uptime - a.uptime;
        default: return 0;
      }
    });

    setFilteredLocations(filtered);
  }, [locations, selectedCountries, searchTerm, sortBy]);

  const connectToLocation = (location: Location) => {
    alert(`Connecting to ${location.city}, ${location.country} via ${location.ispProvider}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-6">🌍 Select Proxy Location</h3>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search countries, states, cities, or ISPs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={selectedCountries[0] || ''}
            onChange={(e) => setSelectedCountries(e.target.value ? [e.target.value] : [])}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Countries</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'speed' | 'latency' | 'uptime')}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="speed">Speed (Fastest)</option>
            <option value="latency">Latency (Lowest)</option>
            <option value="uptime">Uptime (Highest)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedCountries([]);
              setSearchTerm('');
            }}
            className="w-full p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          {filteredLocations.length} locations available
        </p>

        {filteredLocations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <h4 className="font-medium">
                  {location.city}, {location.state}, {location.country}
                </h4>
                <p className="text-sm text-gray-600">
                  {location.ispProvider} • {location.proxyType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-green-600">{location.speed} Mbps</p>
                <p className="text-xs text-gray-500">Speed</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-600">{location.latency}ms</p>
                <p className="text-xs text-gray-500">Latency</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-purple-600">{location.uptime}%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
              
              <button
                onClick={() => connectToLocation(location)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
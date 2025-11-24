import { useState } from 'react';

interface Country {
  code: string;
  name: string;
  proxies: number;
  status: 'active' | 'inactive';
}

export const InteractiveWorldMap = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countries] = useState<Country[]>([
    { code: 'US', name: 'United States', proxies: 5000, status: 'active' },
    { code: 'GB', name: 'United Kingdom', proxies: 2000, status: 'active' },
    { code: 'DE', name: 'Germany', proxies: 1500, status: 'active' },
    { code: 'FR', name: 'France', proxies: 1200, status: 'active' },
    { code: 'JP', name: 'Japan', proxies: 800, status: 'active' },
    { code: 'AU', name: 'Australia', proxies: 600, status: 'active' },
    { code: 'CA', name: 'Canada', proxies: 900, status: 'active' },
    { code: 'SG', name: 'Singapore', proxies: 700, status: 'active' }
  ]);

  const totalProxies = countries.reduce((sum, c) => sum + c.proxies, 0);

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Global Proxy Distribution</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-8 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-gray-600">Interactive map visualization</p>
              <p className="text-sm text-gray-500 mt-2">Click on countries to view details</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Proxies</p>
            <p className="text-2xl font-bold text-blue-600">{totalProxies.toLocaleString()}</p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {countries.map(country => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCountry === country.code
                    ? 'bg-primary-100 border-l-4 border-primary-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{country.name}</span>
                  <span className="text-sm text-gray-600">{country.proxies}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full"
                    style={{ width: `${(country.proxies / 5000) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

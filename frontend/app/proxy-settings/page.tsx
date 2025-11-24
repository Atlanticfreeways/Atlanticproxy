'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function ProxySettingsPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [protocol, setProtocol] = useState('https');
  const [ispTier, setIspTier] = useState('standard');
  const [selectedLocations, setSelectedLocations] = useState(['us-east', 'eu-west']);
  const [customHeaders, setCustomHeaders] = useState('');
  const [sessionPersistence, setSessionPersistence] = useState(true);
  const [throttling, setThrottling] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSaveSettings = async () => {
    // Validate settings
    if (selectedLocations.length === 0) {
      showToast('Please select at least one location', 'warning');
      return;
    }

    setSaving(true);
    try {
      const settings = {
        protocol,
        isp_tier: ispTier,
        locations: selectedLocations,
        custom_headers: customHeaders,
        session_persistence: sessionPersistence,
        throttling,
      };

      // In a real scenario, this would call an API endpoint
      // For now, we'll just show a success message
      showToast('Settings saved successfully!', 'success');
      console.log('Settings saved:', settings);
    } catch (error: any) {
      showToast('Failed to save settings: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const locations = [
    { id: 'us-east', name: 'United States (East)', flag: '🇺🇸' },
    { id: 'us-west', name: 'United States (West)', flag: '🇺🇸' },
    { id: 'eu-west', name: 'Europe (West)', flag: '🇪🇺' },
    { id: 'eu-central', name: 'Europe (Central)', flag: '🇪🇺' },
    { id: 'asia-east', name: 'Asia (East)', flag: '🌏' },
    { id: 'asia-pacific', name: 'Asia (Pacific)', flag: '🌏' },
  ];

  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId) ? prev.filter((id) => id !== locationId) : [...prev, locationId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Proxy Settings</h1>
          <p className="text-sm text-gray-600">Configure your proxy preferences</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Protocol Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Protocol</h2>
              <div className="space-y-3">
                {['http', 'https', 'socks5'].map((proto) => (
                  <label key={proto} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="protocol"
                      value={proto}
                      checked={protocol === proto}
                      onChange={(e) => setProtocol(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-gray-900 capitalize">{proto}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ISP Tier Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">ISP Tier</h2>
              <div className="space-y-3">
                {[
                  { id: 'budget', name: 'Budget', desc: 'Basic performance' },
                  { id: 'standard', name: 'Standard', desc: 'Recommended' },
                  { id: 'premium', name: 'Premium', desc: 'Best performance' },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="ispTier"
                      value={tier.id}
                      checked={ispTier === tier.id}
                      onChange={(e) => setIspTier(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{tier.name}</p>
                      <p className="text-xs text-gray-500">{tier.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Proxy Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locations.map((location) => (
                  <label
                    key={location.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location.id)}
                      onChange={() => toggleLocation(location.id)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-900">
                      {location.flag} {location.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Headers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Custom Headers</h2>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                placeholder="Add custom headers (one per line)&#10;Example: User-Agent: Mozilla/5.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">Add custom HTTP headers to your requests</p>
            </div>

            {/* Session Persistence */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Session Persistence</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sessionPersistence}
                    onChange={(e) => setSessionPersistence(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enabled</span>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Maintain session cookies and headers across requests to the same domain
              </p>
            </div>

            {/* Throttling */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Request Throttling</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={throttling}
                    onChange={(e) => setThrottling(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enabled</span>
                </label>
              </div>
              {throttling && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requests per second: 10
                    </label>
                    <input type="range" min="1" max="100" defaultValue="10" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay between requests: 100ms
                    </label>
                    <input type="range" min="0" max="1000" defaultValue="100" className="w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
            >
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Configuration Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Protocol</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{protocol}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">ISP Tier</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{ispTier}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Locations</p>
                  <p className="text-sm font-medium text-gray-900">{selectedLocations.length} selected</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Session Persistence</p>
                  <p className="text-sm font-medium text-gray-900">{sessionPersistence ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Throttling</p>
                  <p className="text-sm font-medium text-gray-900">{throttling ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 uppercase mb-2">Estimated Cost</p>
                  <p className="text-2xl font-bold text-blue-600">$9.99/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface ThrottlingSettings {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  delayBetweenRequests: number;
  connectionLimit: number;
  bandwidthLimit: number;
}

export default function RequestThrottling() {
  const [settings, setSettings] = useState<ThrottlingSettings>({
    enabled: true,
    requestsPerSecond: 10,
    burstSize: 20,
    delayBetweenRequests: 100,
    connectionLimit: 50,
    bandwidthLimit: 100,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  const handleChange = (key: keyof ThrottlingSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Request Throttling</h3>
          <p className="text-sm text-gray-600 mt-1">
            Control request rate and resource usage
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Throttling settings updated
        </div>
      )}

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold">Enable Request Throttling</p>
            <p className="text-sm text-gray-600">Limit request rate to avoid overload</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggle}
              className="w-5 h-5"
            />
          </label>
        </div>

        {settings.enabled && (
          <>
            {/* Requests Per Second */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Requests Per Second: <span className="text-blue-600">{settings.requestsPerSecond}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.requestsPerSecond}
                onChange={(e) => handleChange('requestsPerSecond', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum requests allowed per second
              </p>
            </div>

            {/* Burst Size */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Burst Size: <span className="text-blue-600">{settings.burstSize}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.burstSize}
                onChange={(e) => handleChange('burstSize', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum requests allowed in a burst
              </p>
            </div>

            {/* Delay Between Requests */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Delay Between Requests: <span className="text-blue-600">{settings.delayBetweenRequests}ms</span>
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={settings.delayBetweenRequests}
                onChange={(e) => handleChange('delayBetweenRequests', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum delay between consecutive requests
              </p>
            </div>

            {/* Connection Limit */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Connection Limit: <span className="text-blue-600">{settings.connectionLimit}</span>
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={settings.connectionLimit}
                onChange={(e) => handleChange('connectionLimit', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum concurrent connections
              </p>
            </div>

            {/* Bandwidth Limit */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Bandwidth Limit: <span className="text-blue-600">{settings.bandwidthLimit} MB/s</span>
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={settings.bandwidthLimit}
                onChange={(e) => handleChange('bandwidthLimit', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum bandwidth usage per second
              </p>
            </div>

            {/* Presets */}
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Quick Presets</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSettings({
                    ...settings,
                    requestsPerSecond: 5,
                    delayBetweenRequests: 200,
                    connectionLimit: 10,
                  })}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Conservative
                </button>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    requestsPerSecond: 20,
                    delayBetweenRequests: 50,
                    connectionLimit: 50,
                  })}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Balanced
                </button>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    requestsPerSecond: 50,
                    delayBetweenRequests: 0,
                    connectionLimit: 100,
                  })}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Aggressive
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Conservative: Avoid detection, slower but safer</li>
                <li>• Balanced: Good for most use cases</li>
                <li>• Aggressive: Maximum speed, higher detection risk</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

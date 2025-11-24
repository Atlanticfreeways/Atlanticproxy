import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface ThrottlingSettings {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  connectionLimit: number;
  bandwidthLimit: number;
  bandwidthUnit: 'MB' | 'GB';
  timeWindow: number;
}

export const RequestThrottling = () => {
  const [settings, setSettings] = useState<ThrottlingSettings>({
    enabled: false,
    requestsPerSecond: 100,
    burstSize: 50,
    connectionLimit: 10,
    bandwidthLimit: 100,
    bandwidthUnit: 'MB',
    timeWindow: 3600
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: keyof Omit<ThrottlingSettings, 'requestsPerSecond' | 'burstSize' | 'connectionLimit' | 'bandwidthLimit' | 'bandwidthUnit' | 'timeWindow'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key: keyof Omit<ThrottlingSettings, 'enabled' | 'bandwidthUnit'>, value: string) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleUnitChange = (value: 'MB' | 'GB') => {
    setSettings(prev => ({ ...prev, bandwidthUnit: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/throttling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Request Throttling</h2>

      {success && <SuccessMessage message="Settings saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={() => handleToggle('enabled')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="font-medium text-gray-700">Enable Request Throttling</span>
        </label>

        {settings.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requests Per Second</label>
                <input
                  type="number"
                  value={settings.requestsPerSecond}
                  onChange={(e) => handleNumberChange('requestsPerSecond', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Burst Size</label>
                <input
                  type="number"
                  value={settings.burstSize}
                  onChange={(e) => handleNumberChange('burstSize', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Connection Limit</label>
                <input
                  type="number"
                  value={settings.connectionLimit}
                  onChange={(e) => handleNumberChange('connectionLimit', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Window (seconds)</label>
                <input
                  type="number"
                  value={settings.timeWindow}
                  onChange={(e) => handleNumberChange('timeWindow', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bandwidth Limit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={settings.bandwidthLimit}
                  onChange={(e) => handleNumberChange('bandwidthLimit', e.target.value)}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={settings.bandwidthUnit}
                  onChange={(e) => handleUnitChange(e.target.value as 'MB' | 'GB')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Throttling limits will be applied per session. Requests exceeding limits will be queued or rejected based on your configuration.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

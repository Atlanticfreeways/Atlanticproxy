import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface LoadBalancingConfig {
  enabled: boolean;
  algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'random';
  healthCheckInterval: number;
  maxRetries: number;
  retryDelay: number;
}

export const LoadBalancing = () => {
  const [config, setConfig] = useState<LoadBalancingConfig>({
    enabled: true,
    algorithm: 'round-robin',
    healthCheckInterval: 30,
    maxRetries: 3,
    retryDelay: 1000
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof LoadBalancingConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/load-balancing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Failed to save configuration');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const algorithmDescriptions = {
    'round-robin': 'Distributes requests evenly across all proxies',
    'least-connections': 'Routes to proxy with fewest active connections',
    'weighted': 'Routes based on proxy performance weights',
    'random': 'Randomly selects a proxy for each request'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Load Balancing</h2>

      {success && <SuccessMessage message="Configuration saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="font-medium text-gray-700">Enable Load Balancing</span>
        </label>

        {config.enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
              <select
                value={config.algorithm}
                onChange={(e) => handleChange('algorithm', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="round-robin">Round Robin</option>
                <option value="least-connections">Least Connections</option>
                <option value="weighted">Weighted</option>
                <option value="random">Random</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {algorithmDescriptions[config.algorithm]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Health Check Interval (seconds)</label>
                <input
                  type="number"
                  value={config.healthCheckInterval}
                  onChange={(e) => handleChange('healthCheckInterval', parseInt(e.target.value))}
                  min="5"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Retries</label>
                <input
                  type="number"
                  value={config.maxRetries}
                  onChange={(e) => handleChange('maxRetries', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retry Delay (milliseconds)</label>
              <input
                type="number"
                value={config.retryDelay}
                onChange={(e) => handleChange('retryDelay', parseInt(e.target.value))}
                min="100"
                max="10000"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Load balancing automatically distributes traffic across your proxy endpoints for optimal performance and reliability.
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
          {loading ? <LoadingSpinner /> : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

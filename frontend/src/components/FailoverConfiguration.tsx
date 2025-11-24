import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface FailoverProvider {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
}

export const FailoverConfiguration = () => {
  const [providers, setProviders] = useState<FailoverProvider[]>([
    { id: '1', name: 'Primary Provider', priority: 1, enabled: true },
    { id: '2', name: 'Secondary Provider', priority: 2, enabled: true },
    { id: '3', name: 'Tertiary Provider', priority: 3, enabled: true }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handlePriorityChange = (id: string, priority: number) => {
    setProviders(providers.map(p => p.id === id ? { ...p, priority } : p));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/failover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providers })
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

  const sortedProviders = [...providers].sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Failover Configuration</h2>

      {success && <SuccessMessage message="Configuration saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Failover Time:</strong> &lt;500ms. If the primary provider fails, traffic automatically switches to the next available provider.
        </p>
      </div>

      <div className="space-y-3">
        {sortedProviders.map((provider, index) => (
          <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-sm text-gray-600">Priority: {provider.priority}</p>
              </div>

              <select
                value={provider.priority}
                onChange={(e) => handlePriorityChange(provider.id, parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[1, 2, 3, 4, 5].map(p => (
                  <option key={p} value={p}>Priority {p}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={() => handleToggle(provider.id)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Active</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Failover Chain</h4>
        <div className="flex items-center gap-2 text-sm">
          {sortedProviders.filter(p => p.enabled).map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                {p.name}
              </span>
              {i < sortedProviders.filter(p => p.enabled).length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>
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

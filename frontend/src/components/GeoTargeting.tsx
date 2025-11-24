import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface GeoTarget {
  id: string;
  country: string;
  city?: string;
  enabled: boolean;
}

export const GeoTargeting = () => {
  const [targets, setTargets] = useState<GeoTarget[]>([
    { id: '1', country: 'United States', city: 'New York', enabled: true },
    { id: '2', country: 'United Kingdom', city: 'London', enabled: true },
    { id: '3', country: 'Germany', city: 'Berlin', enabled: false }
  ]);

  const [newTarget, setNewTarget] = useState({ country: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddTarget = async () => {
    if (!newTarget.country.trim()) {
      setError('Country is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/geo-targeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTarget)
      });

      if (!response.ok) throw new Error('Failed to add target');

      const data = await response.json();
      setTargets([...targets, data]);
      setNewTarget({ country: '', city: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setTargets(targets.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleDelete = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Geo Targeting</h2>

      {success && <SuccessMessage message="Target added successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {targets.map(target => (
            <div key={target.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{target.country}</h3>
                {target.city && <p className="text-sm text-gray-600">{target.city}</p>}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={target.enabled}
                    onChange={() => handleToggle(target.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Active</span>
                </label>

                <button
                  onClick={() => handleDelete(target.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Add Geo Target</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newTarget.country}
              onChange={(e) => setNewTarget({ ...newTarget, country: e.target.value })}
              placeholder="Country"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <input
              type="text"
              value={newTarget.city}
              onChange={(e) => setNewTarget({ ...newTarget, city: e.target.value })}
              placeholder="City (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={handleAddTarget}
              disabled={loading}
              className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Add Target'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Active Targets:</strong> {targets.filter(t => t.enabled).length} / {targets.length}
        </p>
      </div>
    </div>
  );
};

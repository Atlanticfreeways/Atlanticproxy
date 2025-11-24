import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface Location {
  id: string;
  country: string;
  city: string;
  selected: boolean;
}

export const BulkLocationSelection = () => {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', country: 'United States', city: 'New York', selected: false },
    { id: '2', country: 'United States', city: 'Los Angeles', selected: false },
    { id: '3', country: 'United Kingdom', city: 'London', selected: false },
    { id: '4', country: 'Germany', city: 'Berlin', selected: false },
    { id: '5', country: 'France', city: 'Paris', selected: false },
    { id: '6', country: 'Japan', city: 'Tokyo', selected: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (id: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  };

  const handleSelectAll = () => {
    setLocations(locations.map(l => ({ ...l, selected: true })));
  };

  const handleClearAll = () => {
    setLocations(locations.map(l => ({ ...l, selected: false })));
  };

  const handleApply = async () => {
    const selected = locations.filter(l => l.selected);
    if (selected.length === 0) {
      setError('Please select at least one location');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/bulk-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations: selected })
      });

      if (!response.ok) throw new Error('Failed to apply locations');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = locations.filter(l => l.selected).length;

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Bulk Location Selection</h2>

      {success && <SuccessMessage message="Locations applied successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Selected: <span className="font-bold">{selectedCount}</span> / {locations.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
        {locations.map(location => (
          <label key={location.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={location.selected}
              onChange={() => handleToggle(location.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{location.country}</div>
              <div className="text-sm text-gray-600">{location.city}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Apply Locations'}
        </button>
      </div>
    </div>
  );
};

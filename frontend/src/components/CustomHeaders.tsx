import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface CustomHeader {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

export const CustomHeaders = () => {
  const [headers, setHeaders] = useState<CustomHeader[]>([
    { id: '1', name: 'X-Custom-Header', value: '', enabled: true }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddHeader = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setHeaders([...headers, { id: newId, name: '', value: '', enabled: true }]);
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const handleHeaderChange = (id: string, field: 'name' | 'value' | 'enabled', value: string | boolean) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    const validHeaders = headers.filter(h => h.name.trim());

    if (validHeaders.length === 0) {
      setError('At least one header with a name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/headers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers: validHeaders })
      });

      if (!response.ok) throw new Error('Failed to save headers');
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
      <h2 className="text-xl font-bold mb-6">Custom Headers</h2>

      {success && <SuccessMessage message="Headers saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        {headers.map((header, index) => (
          <div key={header.id} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Header Name</label>
              <input
                type="text"
                value={header.name}
                onChange={(e) => handleHeaderChange(header.id, 'name', e.target.value)}
                placeholder="e.g., X-Custom-Header"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Value</label>
              <input
                type="text"
                value={header.value}
                onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
                placeholder="Header value"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => handleHeaderChange(header.id, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Active</span>
            </label>

            <button
              onClick={() => handleRemoveHeader(header.id)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleAddHeader}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
        >
          + Add Header
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
        >
          {loading ? <LoadingSpinner /> : 'Save Headers'}
        </button>
      </div>
    </div>
  );
};

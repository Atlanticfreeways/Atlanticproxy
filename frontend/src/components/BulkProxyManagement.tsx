import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface ProxyBatch {
  id: string;
  name: string;
  count: number;
  protocol: string;
  status: 'active' | 'inactive' | 'processing';
  created: string;
}

export const BulkProxyManagement = () => {
  const [batches, setBatches] = useState<ProxyBatch[]>([
    { id: '1', name: 'US Residential Batch', count: 100, protocol: 'HTTP', status: 'active', created: '2024-01-15' },
    { id: '2', name: 'EU Datacenter Batch', count: 50, protocol: 'HTTPS', status: 'active', created: '2024-01-10' }
  ]);

  const [newBatch, setNewBatch] = useState({ name: '', count: 10, protocol: 'HTTP' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreateBatch = async () => {
    if (!newBatch.name.trim()) {
      setError('Batch name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch)
      });

      if (!response.ok) throw new Error('Failed to create batch');

      const data = await response.json();
      setBatches([...batches, data]);
      setNewBatch({ name: '', count: 10, protocol: 'HTTP' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/proxy/bulk/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete batch');
      setBatches(batches.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Bulk Proxy Management</h2>

      {success && <SuccessMessage message="Batch created successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {batches.map(batch => (
            <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                  <p className="text-sm text-gray-600">{batch.protocol} • {batch.count} proxies</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[batch.status]}`}>
                  {batch.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Created: {batch.created}</span>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Create New Batch</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newBatch.name}
              onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
              placeholder="Batch name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div>
              <label className="block text-xs text-gray-600 mb-1">Proxy Count</label>
              <input
                type="number"
                value={newBatch.count}
                onChange={(e) => setNewBatch({ ...newBatch, count: parseInt(e.target.value) })}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={newBatch.protocol}
              onChange={(e) => setNewBatch({ ...newBatch, protocol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="SOCKS5">SOCKS5</option>
            </select>

            <button
              onClick={handleCreateBatch}
              disabled={loading}
              className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Create Batch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

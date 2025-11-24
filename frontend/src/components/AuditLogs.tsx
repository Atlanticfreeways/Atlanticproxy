import { useState } from 'react';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  status: 'success' | 'failure';
  details: string;
}

export const AuditLogs = () => {
  const [logs] = useState<AuditLog[]>([
    { id: '1', timestamp: '2024-01-20 14:30:00', action: 'Login', user: 'john@example.com', resource: 'Account', status: 'success', details: 'User logged in successfully' },
    { id: '2', timestamp: '2024-01-20 14:25:00', action: 'Update', user: 'john@example.com', resource: 'Proxy Settings', status: 'success', details: 'Updated proxy configuration' },
    { id: '3', timestamp: '2024-01-20 14:20:00', action: 'Delete', user: 'john@example.com', resource: 'API Key', status: 'success', details: 'Deleted API key' },
    { id: '4', timestamp: '2024-01-20 14:15:00', action: 'Create', user: 'jane@example.com', resource: 'Proxy Endpoint', status: 'success', details: 'Created new proxy endpoint' }
  ]);

  const [filter, setFilter] = useState({ action: 'all', status: 'all' });

  const statusColor = {
    success: 'bg-green-100 text-green-800',
    failure: 'bg-red-100 text-red-800'
  };

  const actionColor = {
    'Login': 'text-blue-600',
    'Create': 'text-green-600',
    'Update': 'text-yellow-600',
    'Delete': 'text-red-600'
  };

  const filtered = logs.filter(log => {
    if (filter.action !== 'all' && log.action !== filter.action) return false;
    if (filter.status !== 'all' && log.status !== filter.status) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Audit Logs</h2>

      <div className="flex gap-4 mb-6">
        <select
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Actions</option>
          <option value="Login">Login</option>
          <option value="Create">Create</option>
          <option value="Update">Update</option>
          <option value="Delete">Delete</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-600">{log.timestamp}</td>
                <td className={`py-3 px-4 font-medium ${actionColor[log.action as keyof typeof actionColor]}`}>
                  {log.action}
                </td>
                <td className="py-3 px-4 text-gray-600">{log.user}</td>
                <td className="py-3 px-4 text-gray-600">{log.resource}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[log.status]}`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Showing {filtered.length} of {logs.length} logs</p>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
          Export Logs
        </button>
      </div>
    </div>
  );
};

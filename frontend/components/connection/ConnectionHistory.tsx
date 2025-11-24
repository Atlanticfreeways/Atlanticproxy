'use client';

import { useState, useEffect } from 'react';

interface Connection {
  id: string;
  connectedAt: string;
  disconnectedAt: string;
  duration: string;
  server: string;
  location: string;
  ipAddress: string;
  bytesTransferred: string;
  status: 'completed' | 'active' | 'failed';
}

export default function ConnectionHistory() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const mockData: Connection[] = [
      {
        id: '1',
        connectedAt: '2024-01-20 14:30',
        disconnectedAt: '2024-01-20 15:45',
        duration: '1h 15m',
        server: 'US-NY-001',
        location: 'New York, USA',
        ipAddress: '192.168.1.100',
        bytesTransferred: '2.5 GB',
        status: 'completed',
      },
      {
        id: '2',
        connectedAt: '2024-01-20 12:00',
        disconnectedAt: '2024-01-20 13:30',
        duration: '1h 30m',
        server: 'US-CA-002',
        location: 'Los Angeles, USA',
        ipAddress: '192.168.1.101',
        bytesTransferred: '1.8 GB',
        status: 'completed',
      },
      {
        id: '3',
        connectedAt: '2024-01-20 10:15',
        disconnectedAt: '-',
        duration: 'Active',
        server: 'UK-LN-001',
        location: 'London, UK',
        ipAddress: '192.168.1.102',
        bytesTransferred: '0.5 GB',
        status: 'active',
      },
    ];
    setConnections(mockData);
  }, []);

  const filteredConnections = connections.filter(conn => {
    if (filter === 'active') return conn.status === 'active';
    if (filter === 'completed') return conn.status === 'completed';
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Connection History</h3>

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Connected</th>
              <th className="text-left py-3 px-4 font-semibold">Duration</th>
              <th className="text-left py-3 px-4 font-semibold">Location</th>
              <th className="text-left py-3 px-4 font-semibold">IP Address</th>
              <th className="text-left py-3 px-4 font-semibold">Data</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredConnections.map(conn => (
              <tr key={conn.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{conn.connectedAt}</td>
                <td className="py-3 px-4">{conn.duration}</td>
                <td className="py-3 px-4">{conn.location}</td>
                <td className="py-3 px-4 font-mono text-xs">{conn.ipAddress}</td>
                <td className="py-3 px-4">{conn.bytesTransferred}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    conn.status === 'active' ? 'bg-green-100 text-green-800' :
                    conn.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

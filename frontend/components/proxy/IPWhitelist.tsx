'use client';

import { useState } from 'react';

interface WhitelistEntry {
  id: string;
  ip: string;
  description: string;
  addedDate: string;
}

export default function IPWhitelist() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([
    { id: '1', ip: '192.168.1.1', description: 'Home Network', addedDate: '2024-01-15' },
    { id: '2', ip: '10.0.0.0/24', description: 'Office Network', addedDate: '2024-01-10' },
  ]);
  const [newIp, setNewIp] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (newIp.trim()) {
      setEntries([...entries, {
        id: Date.now().toString(),
        ip: newIp,
        description: description || 'No description',
        addedDate: new Date().toISOString().split('T')[0],
      }]);
      setNewIp('');
      setDescription('');
    }
  };

  const handleRemove = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">IP Whitelist</h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          Only allow connections from specific IP addresses. Leave empty to allow all.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">IP Address or Range</label>
          <input
            type="text"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="e.g., 192.168.1.1 or 10.0.0.0/24"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Home Network"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAdd}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Add to Whitelist
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold mb-3">Whitelisted IPs</h4>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm">No IPs whitelisted yet</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-mono text-sm">{entry.ip}</p>
                <p className="text-xs text-gray-600">{entry.description}</p>
                <p className="text-xs text-gray-500">Added: {entry.addedDate}</p>
              </div>
              <button
                onClick={() => handleRemove(entry.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

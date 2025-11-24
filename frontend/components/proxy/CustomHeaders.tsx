'use client';

import { useState } from 'react';

interface CustomHeader {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

export default function CustomHeaders() {
  const [headers, setHeaders] = useState<CustomHeader[]>([
    { id: '1', name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', enabled: true },
    { id: '2', name: 'Accept-Language', value: 'en-US,en;q=0.9', enabled: true },
  ]);

  const [newHeader, setNewHeader] = useState({ name: '', value: '' });
  const [saved, setSaved] = useState(false);

  const handleAddHeader = () => {
    if (newHeader.name && newHeader.value) {
      setHeaders([
        ...headers,
        {
          id: Date.now().toString(),
          name: newHeader.name,
          value: newHeader.value,
          enabled: true,
        },
      ]);
      setNewHeader({ name: '', value: '' });
    }
  };

  const handleToggleHeader = (id: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, enabled: !h.enabled } : h));
  };

  const handleDeleteHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const handleUpdateHeader = (id: string, field: 'name' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Custom Headers</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Headers
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Custom headers saved successfully
        </div>
      )}

      <div className="space-y-6">
        {/* Current Headers */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Active Headers</h4>
          <div className="space-y-2">
            {headers.map((header) => (
              <div key={header.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <label className="flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={() => handleToggleHeader(header.id)}
                      className="w-4 h-4"
                    />
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={header.name}
                      onChange={(e) => handleUpdateHeader(header.id, 'name', e.target.value)}
                      placeholder="Header name"
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-2 font-mono"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => handleUpdateHeader(header.id, 'value', e.target.value)}
                      placeholder="Header value"
                      className="w-full p-2 border border-gray-300 rounded text-sm font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteHeader(header.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm mt-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Header */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Add New Header</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Header Name</label>
              <input
                type="text"
                value={newHeader.name}
                onChange={(e) => setNewHeader({ ...newHeader, name: e.target.value })}
                placeholder="e.g., X-Custom-Header"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Header Value</label>
              <input
                type="text"
                value={newHeader.value}
                onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                placeholder="e.g., custom-value"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <button
              onClick={handleAddHeader}
              disabled={!newHeader.name || !newHeader.value}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Header
            </button>
          </div>
        </div>

        {/* Common Headers Reference */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 Common Headers</p>
          <div className="text-sm text-blue-800 space-y-1 font-mono text-xs">
            <p>• User-Agent: Browser identification</p>
            <p>• Accept-Language: Preferred language</p>
            <p>• Accept-Encoding: Compression support</p>
            <p>• Referer: Previous page URL</p>
            <p>• X-Forwarded-For: Original client IP</p>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-900 mb-2">⚠ Tips</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Headers are sent with every request through this proxy</li>
            <li>• Disable headers you don't need to reduce overhead</li>
            <li>• Some sites may block requests with suspicious headers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

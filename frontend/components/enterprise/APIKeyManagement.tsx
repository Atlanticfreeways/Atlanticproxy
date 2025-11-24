'use client';

import { useState } from 'react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

export default function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_51234567890abcdef',
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active',
      permissions: ['read', 'write', 'delete'],
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_test_98765432100fedcba',
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      status: 'active',
      permissions: ['read', 'write'],
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);

  const handleCreateKey = () => {
    if (newKeyName.trim()) {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `sk_${Math.random().toString(36).substr(2, 20)}`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        status: 'active',
        permissions: selectedPermissions,
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setSelectedPermissions(['read']);
      setShowCreateForm(false);
    }
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.map(key =>
      key.id === id ? { ...key, status: 'inactive' } : key
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">API Key Management</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Key
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold mb-4">Create New API Key</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Key Name</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API Key"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Permissions</label>
            <div className="space-y-2">
              {['read', 'write', 'delete'].map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, perm]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Key
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {apiKeys.map(key => (
          <div key={key.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{key.name}</h4>
                <p className="text-sm text-gray-600">Created: {key.created}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                key.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
              </span>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <code className="text-sm text-gray-700 font-mono">{key.key}</code>
              <button
                onClick={() => copyToClipboard(key.key)}
                className="text-blue-600 hover:underline text-sm"
              >
                Copy
              </button>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Permissions:</p>
              <div className="flex gap-2">
                {key.permissions.map(perm => (
                  <span key={perm} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded capitalize">
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Last used: {key.lastUsed}</span>
              {key.status === 'active' && (
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="text-red-600 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

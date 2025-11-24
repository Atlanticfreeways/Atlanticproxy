'use client';

import { useState } from 'react';

interface ProxyAuth {
  username: string;
  password: string;
  authMethod: 'basic' | 'digest' | 'bearer';
  customToken?: string;
}

interface AuthCredential {
  id: string;
  name: string;
  username: string;
  authMethod: 'basic' | 'digest' | 'bearer';
  created: string;
}

export default function ProxyAuthentication() {
  const [credentials, setCredentials] = useState<AuthCredential[]>([
    { id: '1', name: 'Primary Account', username: 'user123', authMethod: 'basic', created: '2024-01-15' },
    { id: '2', name: 'API Access', username: 'api_user', authMethod: 'bearer', created: '2024-01-10' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newAuth, setNewAuth] = useState<ProxyAuth>({
    username: '',
    password: '',
    authMethod: 'basic',
  });

  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAddCredential = () => {
    if (newAuth.username && newAuth.password) {
      setCredentials([
        ...credentials,
        {
          id: Date.now().toString(),
          name: `Credential ${credentials.length + 1}`,
          username: newAuth.username,
          authMethod: newAuth.authMethod,
          created: new Date().toISOString().split('T')[0],
        },
      ]);
      setNewAuth({ username: '', password: '', authMethod: 'basic' });
      setShowForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Proxy Authentication</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {showForm ? 'Cancel' : 'Add Credential'}
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Credential added successfully
        </div>
      )}

      <div className="space-y-6">
        {/* Add New Credential Form */}
        {showForm && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Authentication Method</label>
              <select
                value={newAuth.authMethod}
                onChange={(e) => setNewAuth({ ...newAuth, authMethod: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="basic">Basic Auth (Username:Password)</option>
                <option value="digest">Digest Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {newAuth.authMethod === 'bearer' ? 'Token' : 'Username'}
              </label>
              <input
                type="text"
                value={newAuth.username}
                onChange={(e) => setNewAuth({ ...newAuth, username: e.target.value })}
                placeholder={newAuth.authMethod === 'bearer' ? 'Bearer token' : 'Username'}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {newAuth.authMethod !== 'bearer' && (
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newAuth.password}
                    onChange={(e) => setNewAuth({ ...newAuth, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddCredential}
              disabled={!newAuth.username || (!newAuth.password && newAuth.authMethod !== 'bearer')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              Add Credential
            </button>
          </div>
        )}

        {/* Credentials List */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Saved Credentials</h4>
          <div className="space-y-2">
            {credentials.map((cred) => (
              <div key={cred.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{cred.name}</p>
                  <p className="text-xs text-gray-500">
                    {cred.authMethod === 'basic' && `Basic: ${cred.username}`}
                    {cred.authMethod === 'digest' && `Digest: ${cred.username}`}
                    {cred.authMethod === 'bearer' && 'Bearer Token'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Added: {cred.created}</p>
                </div>
                <button
                  onClick={() => handleDeleteCredential(cred.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Methods Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 Authentication Methods</p>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Basic Auth:</strong> Username and password encoded in header</p>
            <p><strong>Digest Auth:</strong> More secure, uses MD5 hashing</p>
            <p><strong>Bearer Token:</strong> Token-based authentication (OAuth, JWT)</p>
          </div>
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-900 mb-2">🔒 Security Tips</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use strong, unique passwords</li>
            <li>• Rotate credentials regularly</li>
            <li>• Never share credentials with others</li>
            <li>• Use HTTPS for all authenticated requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

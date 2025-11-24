import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface AuthMethod {
  type: 'none' | 'basic' | 'bearer' | 'custom';
  username?: string;
  password?: string;
  token?: string;
  customHeader?: string;
  customValue?: string;
}

export const ProxyAuthentication = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>({
    type: 'none'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (type: AuthMethod['type']) => {
    setAuthMethod({ type });
  };

  const handleFieldChange = (field: string, value: string) => {
    setAuthMethod(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (authMethod.type === 'basic' && (!authMethod.username || !authMethod.password)) {
      setError('Username and password are required for Basic auth');
      return;
    }

    if (authMethod.type === 'bearer' && !authMethod.token) {
      setError('Token is required for Bearer auth');
      return;
    }

    if (authMethod.type === 'custom' && (!authMethod.customHeader || !authMethod.customValue)) {
      setError('Header name and value are required for Custom auth');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authMethod)
      });

      if (!response.ok) throw new Error('Failed to save authentication');
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
      <h2 className="text-xl font-bold mb-6">Proxy Authentication</h2>

      {success && <SuccessMessage message="Authentication settings saved" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Authentication Method</label>
          <div className="space-y-2">
            {(['none', 'basic', 'bearer', 'custom'] as const).map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="authType"
                  value={type}
                  checked={authMethod.type === type}
                  onChange={() => handleTypeChange(type)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 capitalize">{type === 'none' ? 'No Authentication' : `${type} Authentication`}</span>
              </label>
            ))}
          </div>
        </div>

        {authMethod.type === 'basic' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={authMethod.username || ''}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authMethod.password || ''}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 text-sm"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>
        )}

        {authMethod.type === 'bearer' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bearer Token</label>
              <textarea
                value={authMethod.token || ''}
                onChange={(e) => handleFieldChange('token', e.target.value)}
                placeholder="Enter your bearer token"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>
          </div>
        )}

        {authMethod.type === 'custom' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Name</label>
              <input
                type="text"
                value={authMethod.customHeader || ''}
                onChange={(e) => handleFieldChange('customHeader', e.target.value)}
                placeholder="e.g., X-API-Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Value</label>
              <textarea
                value={authMethod.customValue || ''}
                onChange={(e) => handleFieldChange('customValue', e.target.value)}
                placeholder="Enter header value"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
            </div>
          </div>
        )}

        {authMethod.type !== 'none' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Security:</strong> Your authentication credentials are encrypted and stored securely. They will be included in all proxy requests.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Save Authentication'}
        </button>
      </div>
    </div>
  );
};

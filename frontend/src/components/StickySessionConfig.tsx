import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface StickySessionSettings {
  enabled: boolean;
  sessionDuration: number;
  ipStickiness: boolean;
  cookiePreservation: boolean;
  userAgentStickiness: boolean;
  refererStickiness: boolean;
  customHeaders: Record<string, string>;
}

export const StickySessionConfig = () => {
  const [settings, setSettings] = useState<StickySessionSettings>({
    enabled: true,
    sessionDuration: 3600,
    ipStickiness: true,
    cookiePreservation: true,
    userAgentStickiness: false,
    refererStickiness: false,
    customHeaders: {}
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: keyof Omit<StickySessionSettings, 'sessionDuration' | 'customHeaders'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDurationChange = (value: string) => {
    setSettings(prev => ({ ...prev, sessionDuration: parseInt(value) }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/proxy/sticky-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 86400, label: '24 hours' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Sticky Session Configuration</h2>

      {success && <SuccessMessage message="Settings saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={() => handleToggle('enabled')}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="font-medium text-gray-700">Enable Sticky Sessions</span>
          </label>

          {settings.enabled && (
            <div className="ml-7 space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration</label>
                <select
                  value={settings.sessionDuration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {durationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ipStickiness}
                  onChange={() => handleToggle('ipStickiness')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">IP Stickiness</span>
                  <p className="text-xs text-gray-500">Keep same IP for session duration</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cookiePreservation}
                  onChange={() => handleToggle('cookiePreservation')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Cookie Preservation</span>
                  <p className="text-xs text-gray-500">Maintain cookies across requests</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.userAgentStickiness}
                  onChange={() => handleToggle('userAgentStickiness')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">User Agent Stickiness</span>
                  <p className="text-xs text-gray-500">Keep same user agent throughout session</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.refererStickiness}
                  onChange={() => handleToggle('refererStickiness')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Referer Stickiness</span>
                  <p className="text-xs text-gray-500">Preserve referer headers</p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

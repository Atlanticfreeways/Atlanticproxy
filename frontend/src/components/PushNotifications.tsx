import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface PushNotificationSettings {
  enabled: boolean;
  connectionStatus: boolean;
  usageAlerts: boolean;
  billingReminders: boolean;
  securityAlerts: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

export const PushNotifications = () => {
  const [settings, setSettings] = useState<PushNotificationSettings>({
    enabled: true,
    connectionStatus: true,
    usageAlerts: true,
    billingReminders: true,
    securityAlerts: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: keyof PushNotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeChange = (key: 'quietStart' | 'quietEnd', value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/notifications/push', {
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

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Push Notifications</h2>

      {success && <SuccessMessage message="Settings saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={() => handleToggle('enabled')}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Enable Push Notifications</span>
        </label>

        {settings.enabled && (
          <div className="ml-7 space-y-4 pt-4 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.connectionStatus}
                onChange={() => handleToggle('connectionStatus')}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Connection Status Changes</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.usageAlerts}
                onChange={() => handleToggle('usageAlerts')}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Usage Alerts</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.billingReminders}
                onChange={() => handleToggle('billingReminders')}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Billing Reminders</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.securityAlerts}
                onChange={() => handleToggle('securityAlerts')}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Security Alerts</span>
            </label>

            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={settings.quietHours}
                  onChange={() => handleToggle('quietHours')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Quiet Hours</span>
              </label>

              {settings.quietHours && (
                <div className="ml-7 flex gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="time"
                      value={settings.quietStart}
                      onChange={(e) => handleTimeChange('quietStart', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="time"
                      value={settings.quietEnd}
                      onChange={(e) => handleTimeChange('quietEnd', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface EmailNotificationSettings {
  dailyReport: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  connectionAlerts: boolean;
  usageAlerts: boolean;
  billingAlerts: boolean;
  securityAlerts: boolean;
  maintenanceNotices: boolean;
}

export const EmailNotifications = () => {
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    dailyReport: true,
    weeklyReport: true,
    monthlyReport: false,
    connectionAlerts: true,
    usageAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
    maintenanceNotices: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: keyof EmailNotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/notifications/email', {
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

  const notificationGroups = [
    {
      title: 'Reports',
      items: [
        { key: 'dailyReport', label: 'Daily Usage Report' },
        { key: 'weeklyReport', label: 'Weekly Summary' },
        { key: 'monthlyReport', label: 'Monthly Report' }
      ]
    },
    {
      title: 'Alerts',
      items: [
        { key: 'connectionAlerts', label: 'Connection Issues' },
        { key: 'usageAlerts', label: 'Usage Threshold Exceeded' },
        { key: 'billingAlerts', label: 'Billing Notifications' },
        { key: 'securityAlerts', label: 'Security Events' }
      ]
    },
    {
      title: 'System',
      items: [
        { key: 'maintenanceNotices', label: 'Maintenance Notices' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Email Notifications</h2>

      {success && <SuccessMessage message="Settings saved successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        {notificationGroups.map(group => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof EmailNotificationSettings]}
                    onChange={() => handleToggle(item.key as keyof EmailNotificationSettings)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
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

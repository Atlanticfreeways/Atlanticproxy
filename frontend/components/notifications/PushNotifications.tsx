'use client';

import { useState } from 'react';

interface PushSettings {
  enabled: boolean;
  connectionStatus: boolean;
  usageAlerts: boolean;
  billingAlerts: boolean;
  securityAlerts: boolean;
  sound: boolean;
  badge: boolean;
}

export default function PushNotifications() {
  const [settings, setSettings] = useState<PushSettings>({
    enabled: true,
    connectionStatus: true,
    usageAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
    sound: true,
    badge: true,
  });

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('granted');
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof PushSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as any);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Push Notifications</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Push notification settings updated
        </div>
      )}

      {/* Permission Status */}
      {permissionStatus === 'denied' && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
          ⚠ Push notifications are blocked. Enable them in your browser settings.
        </div>
      )}

      {permissionStatus === 'default' && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm flex justify-between items-center">
          <span>Enable push notifications to receive real-time alerts</span>
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Enable
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold">Push Notifications</p>
            <p className="text-sm text-gray-600">Receive real-time browser notifications</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={() => handleToggle('enabled')}
              className="w-5 h-5"
            />
          </label>
        </div>

        {settings.enabled && (
          <>
            {/* Notification Types */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-700">Notification Types</h4>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Connection Status</p>
                    <p className="text-xs text-gray-500">Proxy connect/disconnect events</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.connectionStatus}
                      onChange={() => handleToggle('connectionStatus')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Usage Alerts</p>
                    <p className="text-xs text-gray-500">Bandwidth limit warnings</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.usageAlerts}
                      onChange={() => handleToggle('usageAlerts')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Billing Alerts</p>
                    <p className="text-xs text-gray-500">Payment and subscription updates</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.billingAlerts}
                      onChange={() => handleToggle('billingAlerts')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Security Alerts</p>
                    <p className="text-xs text-gray-500">Suspicious activity detected</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.securityAlerts}
                      onChange={() => handleToggle('securityAlerts')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Behavior */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-700">Notification Behavior</h4>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Sound</p>
                    <p className="text-xs text-gray-500">Play sound with notifications</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sound}
                      onChange={() => handleToggle('sound')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Badge</p>
                    <p className="text-xs text-gray-500">Show unread count badge</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.badge}
                      onChange={() => handleToggle('badge')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Push notifications work best when you have the browser tab open or in the background.
          </p>
        </div>
      </div>
    </div>
  );
}

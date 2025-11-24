'use client';

import { useState } from 'react';

interface EmailSettings {
  dailyReport: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  usageAlerts: boolean;
  billingAlerts: boolean;
  securityAlerts: boolean;
  maintenanceNotices: boolean;
  newFeatures: boolean;
  reportTime: string;
}

export default function EmailNotifications() {
  const [settings, setSettings] = useState<EmailSettings>({
    dailyReport: true,
    weeklyReport: true,
    monthlyReport: false,
    usageAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
    maintenanceNotices: true,
    newFeatures: false,
    reportTime: '09:00',
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof EmailSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Email Notifications</h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Email settings updated successfully
        </div>
      )}

      <div className="space-y-6">
        {/* Reports Section */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Reports</h4>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Daily Report</p>
                <p className="text-xs text-gray-500">Usage summary every day</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyReport}
                  onChange={() => handleToggle('dailyReport')}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Weekly Report</p>
                <p className="text-xs text-gray-500">Comprehensive weekly summary</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={() => handleToggle('weeklyReport')}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Monthly Report</p>
                <p className="text-xs text-gray-500">Detailed monthly analytics</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.monthlyReport}
                  onChange={() => handleToggle('monthlyReport')}
                  className="w-4 h-4"
                />
              </label>
            </div>

            {(settings.dailyReport || settings.weeklyReport || settings.monthlyReport) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium mb-2">Report Time</label>
                <input
                  type="time"
                  value={settings.reportTime}
                  onChange={(e) => setSettings({ ...settings, reportTime: e.target.value })}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Alerts</h4>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Usage Alerts</p>
                <p className="text-xs text-gray-500">When approaching bandwidth limits</p>
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
                <p className="text-xs text-gray-500">Payment failures and renewals</p>
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
                <p className="text-xs text-gray-500">Suspicious activity and breaches</p>
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

        {/* Notifications Section */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Notifications</h4>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Maintenance Notices</p>
                <p className="text-xs text-gray-500">Scheduled maintenance updates</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceNotices}
                  onChange={() => handleToggle('maintenanceNotices')}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">New Features</p>
                <p className="text-xs text-gray-500">Updates about new features</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newFeatures}
                  onChange={() => handleToggle('newFeatures')}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Email Frequency Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You'll receive at most one email per day. Multiple notifications are batched together.
          </p>
        </div>
      </div>
    </div>
  );
}

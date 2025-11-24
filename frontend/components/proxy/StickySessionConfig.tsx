'use client';

import { useState } from 'react';

interface StickySessionSettings {
  enabled: boolean;
  sessionDuration: number;
  ipStickiness: boolean;
  cookiePreservation: boolean;
  headerPreservation: boolean;
  sessionTimeout: number;
}

export default function StickySessionConfig() {
  const [settings, setSettings] = useState<StickySessionSettings>({
    enabled: true,
    sessionDuration: 30,
    ipStickiness: true,
    cookiePreservation: true,
    headerPreservation: true,
    sessionTimeout: 60,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof StickySessionSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (key: keyof StickySessionSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Sticky Session Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Maintain consistent IP and session data across requests
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Sticky session settings updated
        </div>
      )}

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="font-semibold">Enable Sticky Sessions</p>
            <p className="text-sm text-gray-600">Keep the same IP for all requests in a session</p>
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
            {/* Session Duration */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Session Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={settings.sessionDuration}
                  onChange={(e) => handleChange('sessionDuration', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 p-2 border border-gray-300 rounded-lg text-center font-semibold">
                  {settings.sessionDuration}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                How long to maintain the same IP address
              </p>
            </div>

            {/* Session Timeout */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Session Timeout (seconds)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 p-2 border border-gray-300 rounded-lg text-center font-semibold">
                  {settings.sessionTimeout}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Inactivity timeout before session expires
              </p>
            </div>

            {/* Session Features */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-700">Session Features</h4>
              <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">IP Stickiness</p>
                    <p className="text-xs text-gray-500">Use same IP for entire session</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.ipStickiness}
                      onChange={() => handleToggle('ipStickiness')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Cookie Preservation</p>
                    <p className="text-xs text-gray-500">Maintain cookies across requests</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.cookiePreservation}
                      onChange={() => handleToggle('cookiePreservation')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Header Preservation</p>
                    <p className="text-xs text-gray-500">Keep custom headers in session</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.headerPreservation}
                      onChange={() => handleToggle('headerPreservation')}
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">✓ Benefits</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Avoid re-authentication on each request</li>
                <li>• Maintain shopping cart and session state</li>
                <li>• Reduce server load with connection reuse</li>
                <li>• Better performance for multi-step workflows</li>
              </ul>
            </div>

            {/* Use Cases */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Best For</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Web scraping with login requirements</li>
                <li>• E-commerce automation</li>
                <li>• API testing with session state</li>
                <li>• Multi-step form submissions</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

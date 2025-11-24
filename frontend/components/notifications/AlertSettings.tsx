'use client';

import { useState } from 'react';

interface AlertSetting {
  id: string;
  name: string;
  enabled: boolean;
  channels: string[];
}

export default function AlertSettings() {
  const [alerts, setAlerts] = useState<AlertSetting[]>([
    { id: '1', name: 'Connection Failed', enabled: true, channels: ['email', 'push'] },
    { id: '2', name: 'Bandwidth Limit Reached', enabled: true, channels: ['email'] },
    { id: '3', name: 'Unusual Activity', enabled: true, channels: ['email', 'push', 'sms'] },
    { id: '4', name: 'Subscription Expiring', enabled: true, channels: ['email'] },
  ]);

  const handleToggle = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const handleChannelToggle = (id: string, channel: string) => {
    setAlerts(alerts.map(a => 
      a.id === id 
        ? { ...a, channels: a.channels.includes(channel) 
            ? a.channels.filter(c => c !== channel)
            : [...a.channels, channel]
          }
        : a
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Alert Settings</h3>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{alert.name}</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alert.enabled}
                  onChange={() => handleToggle(alert.id)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            {alert.enabled && (
              <div className="flex gap-3">
                {['email', 'push', 'sms'].map(channel => (
                  <label key={channel} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={alert.channels.includes(channel)}
                      onChange={() => handleChannelToggle(alert.id, channel)}
                      className="w-3 h-3"
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
        Save Alert Settings
      </button>
    </div>
  );
}

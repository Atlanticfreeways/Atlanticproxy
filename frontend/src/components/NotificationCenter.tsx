import { useState } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'success', title: 'Proxy Connected', message: 'US-NY proxy is now active', timestamp: '2 min ago', read: false },
    { id: '2', type: 'warning', title: 'Bandwidth Alert', message: 'You have used 90% of your bandwidth', timestamp: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'Update Available', message: 'New proxy locations added', timestamp: '3 hours ago', read: true }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClear = () => {
    setNotifications(notifications.filter(n => !n.read));
  };

  const typeIcon = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅'
  };

  const typeBg = {
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    success: 'bg-green-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button onClick={handleClear} className="text-sm text-gray-600 hover:text-gray-900">
          Clear read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <button
            key={notif.id}
            onClick={() => handleMarkAsRead(notif.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${typeBg[notif.type]} ${!notif.read ? 'border-l-4 border-primary-600' : ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{typeIcon[notif.type]}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

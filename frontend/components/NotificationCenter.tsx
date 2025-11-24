'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Connection Established',
      message: 'Successfully connected to US East proxy server',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Usage Alert',
      message: 'You have used 80% of your monthly bandwidth',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    }
  ]);

  const [showAll, setShowAll] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">🔔 Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            {showAll ? 'Show less' : 'Show all'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(showAll ? notifications : notifications.slice(0, 3)).map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              notification.read 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-blue-50 border-blue-200'
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🔕</span>
          <p>No notifications</p>
        </div>
      )}
    </div>
  );
}
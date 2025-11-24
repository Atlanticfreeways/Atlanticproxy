import { useState } from 'react';

interface Activity {
  id: string;
  type: 'connection' | 'config' | 'billing' | 'security';
  title: string;
  description: string;
  timestamp: string;
}

export const RecentActivity = () => {
  const [activities] = useState<Activity[]>([
    { id: '1', type: 'connection', title: 'Proxy Connected', description: 'US-NY endpoint activated', timestamp: '5 min ago' },
    { id: '2', type: 'config', title: 'Settings Updated', description: 'Load balancing algorithm changed', timestamp: '2 hours ago' },
    { id: '3', type: 'billing', title: 'Payment Processed', description: 'Monthly subscription charged', timestamp: '1 day ago' },
    { id: '4', type: 'security', title: 'Login', description: 'New login from Chrome on macOS', timestamp: '2 days ago' }
  ]);

  const typeIcon = {
    connection: '🔗',
    config: '⚙️',
    billing: '💳',
    security: '🔒'
  };

  const typeBg = {
    connection: 'bg-blue-50',
    config: 'bg-purple-50',
    billing: 'bg-green-50',
    security: 'bg-red-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map(activity => (
          <div key={activity.id} className={`p-3 rounded-lg ${typeBg[activity.type]}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{typeIcon[activity.type]}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

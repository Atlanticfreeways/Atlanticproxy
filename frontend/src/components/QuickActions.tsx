import { useState } from 'react';

interface Action {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export const QuickActions = () => {
  const [actions] = useState<Action[]>([
    { id: '1', label: 'Add Proxy', icon: '➕', action: () => console.log('Add proxy') },
    { id: '2', label: 'Test Connection', icon: '🔗', action: () => console.log('Test connection') },
    { id: '3', label: 'View Analytics', icon: '📊', action: () => console.log('View analytics') },
    { id: '4', label: 'Support', icon: '💬', action: () => console.log('Open support') },
    { id: '5', label: 'Settings', icon: '⚙️', action: () => console.log('Open settings') },
    { id: '6', label: 'Documentation', icon: '📖', action: () => console.log('Open docs') }
  ]);

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.action}
            className="p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-sm font-medium text-gray-900">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

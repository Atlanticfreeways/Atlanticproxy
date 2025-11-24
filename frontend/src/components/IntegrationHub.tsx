import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'available' | 'coming-soon';
  category: string;
}

export const IntegrationHub = () => {
  const [integrations] = useState<Integration[]>([
    { id: '1', name: 'Slack', description: 'Get alerts in Slack', icon: '💬', status: 'connected', category: 'notifications' },
    { id: '2', name: 'Zapier', description: 'Automate workflows', icon: '⚡', status: 'available', category: 'automation' },
    { id: '3', name: 'Datadog', description: 'Monitor performance', icon: '📊', status: 'available', category: 'monitoring' },
    { id: '4', name: 'PagerDuty', description: 'Incident management', icon: '🚨', status: 'available', category: 'alerts' },
    { id: '5', name: 'Splunk', description: 'Log analysis', icon: '📈', status: 'coming-soon', category: 'analytics' },
    { id: '6', name: 'Kubernetes', description: 'Container orchestration', icon: '☸️', status: 'coming-soon', category: 'infrastructure' }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'notifications', 'automation', 'monitoring', 'alerts', 'analytics', 'infrastructure'];
  const filtered = selectedCategory === 'all' ? integrations : integrations.filter(i => i.category === selectedCategory);

  const statusColor = {
    connected: 'bg-green-100 text-green-800',
    available: 'bg-blue-100 text-blue-800',
    'coming-soon': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-2">Integration Hub</h2>
      <p className="text-gray-600 mb-6">Connect Atlantic Proxy with your favorite tools</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(integration => (
          <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{integration.icon}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[integration.status]}`}>
                {integration.status === 'coming-soon' ? 'Coming Soon' : integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

            {integration.status === 'connected' && (
              <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
                Manage
              </button>
            )}
            {integration.status === 'available' && (
              <button className="w-full px-3 py-2 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700">
                Connect
              </button>
            )}
            {integration.status === 'coming-soon' && (
              <button disabled className="w-full px-3 py-2 bg-gray-100 text-gray-500 rounded text-sm font-medium cursor-not-allowed">
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Missing an integration?</strong> Request it on our <a href="#" className="underline">feature request page</a>
        </p>
      </div>
    </div>
  );
};

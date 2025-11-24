import { useState } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export const PerformanceMonitoring = () => {
  const [metrics] = useState<PerformanceMetric[]>([
    { name: 'Average Response Time', value: 145, unit: 'ms', status: 'good' },
    { name: 'Success Rate', value: 99.8, unit: '%', status: 'good' },
    { name: 'Uptime', value: 99.99, unit: '%', status: 'good' },
    { name: 'Requests/Second', value: 5420, unit: 'req/s', status: 'good' },
    { name: 'Bandwidth Usage', value: 78, unit: '%', status: 'warning' },
    { name: 'Error Rate', value: 0.2, unit: '%', status: 'good' }
  ]);

  const statusColor = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusBg = {
    good: 'bg-green-50',
    warning: 'bg-yellow-50',
    critical: 'bg-red-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Performance Monitoring</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div key={metric.name} className={`rounded-lg p-4 ${statusBg[metric.status]}`}>
            <p className="text-sm text-gray-600 mb-2">{metric.name}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-600">{metric.unit}</span>
            </div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor[metric.status]}`}>
              {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Real-time Graph</h3>
        <div className="h-48 bg-white rounded border border-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Performance graph visualization</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Export Report
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
          Configure Alerts
        </button>
      </div>
    </div>
  );
};

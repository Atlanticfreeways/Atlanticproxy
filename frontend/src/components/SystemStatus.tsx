import { useState } from 'react';

interface Service {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
}

export const SystemStatus = () => {
  const [services] = useState<Service[]>([
    { name: 'API Servers', status: 'operational', uptime: 99.99 },
    { name: 'Proxy Network', status: 'operational', uptime: 99.98 },
    { name: 'Dashboard', status: 'operational', uptime: 100 },
    { name: 'Billing System', status: 'operational', uptime: 99.95 }
  ]);

  const statusColor = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  const statusDot = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500'
  };

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">System Status</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${allOperational ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {allOperational ? '✓ All Systems Operational' : '⚠ Issues Detected'}
        </span>
      </div>

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusDot[service.status]}`} />
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-600">Uptime: {service.uptime}%</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[service.status]}`}>
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Status Page:</strong> <a href="#" className="underline">status.atlanticproxy.com</a>
        </p>
      </div>
    </div>
  );
};

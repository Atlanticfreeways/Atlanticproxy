import { useState } from 'react';

export const DashboardOverview = () => {
  const [stats] = useState({
    activeProxies: 24,
    totalRequests: 4500000,
    uptime: 99.99,
    avgResponseTime: 145
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-sm text-gray-600 mb-2">Active Proxies</p>
        <p className="text-3xl font-bold text-gray-900">{stats.activeProxies}</p>
        <p className="text-xs text-green-600 mt-2">✓ All operational</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-sm text-gray-600 mb-2">Total Requests</p>
        <p className="text-3xl font-bold text-gray-900">{(stats.totalRequests / 1000000).toFixed(1)}M</p>
        <p className="text-xs text-gray-600 mt-2">This month</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-sm text-gray-600 mb-2">Uptime</p>
        <p className="text-3xl font-bold text-green-600">{stats.uptime}%</p>
        <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6">
        <p className="text-sm text-gray-600 mb-2">Avg Response Time</p>
        <p className="text-3xl font-bold text-blue-600">{stats.avgResponseTime}ms</p>
        <p className="text-xs text-gray-600 mt-2">Global average</p>
      </div>
    </div>
  );
};

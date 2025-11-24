import { useState } from 'react';

interface ResourceMetric {
  name: string;
  used: number;
  limit: number;
  unit: string;
  percentage: number;
}

export const ResourceUsage = () => {
  const [resources] = useState<ResourceMetric[]>([
    { name: 'Bandwidth', used: 450, limit: 500, unit: 'GB', percentage: 90 },
    { name: 'API Requests', used: 4500000, limit: 5000000, unit: 'requests', percentage: 90 },
    { name: 'Proxy Endpoints', used: 18, limit: 20, unit: 'endpoints', percentage: 90 },
    { name: 'Team Members', used: 3, limit: 5, unit: 'members', percentage: 60 },
    { name: 'Storage', used: 25, limit: 100, unit: 'GB', percentage: 25 }
  ]);

  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Resource Usage</h2>

      <div className="space-y-6">
        {resources.map(resource => (
          <div key={resource.name}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">{resource.name}</h3>
              <span className={`text-sm font-medium ${getTextColor(resource.percentage)}`}>
                {resource.used.toLocaleString()} / {resource.limit.toLocaleString()} {resource.unit}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getColor(resource.percentage)}`}
                style={{ width: `${resource.percentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">{resource.percentage}% used</span>
              {resource.percentage >= 90 && (
                <span className="text-xs text-red-600 font-medium">⚠️ Upgrade recommended</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Current Plan</p>
          <p className="text-lg font-bold text-blue-600">Professional</p>
          <p className="text-xs text-gray-600 mt-1">$99/month</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Renewal Date</p>
          <p className="text-lg font-bold text-green-600">Feb 20, 2024</p>
          <p className="text-xs text-gray-600 mt-1">30 days remaining</p>
        </div>
      </div>

      <button className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
        Upgrade Plan
      </button>
    </div>
  );
};

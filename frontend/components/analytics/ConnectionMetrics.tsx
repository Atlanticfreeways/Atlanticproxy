'use client';

import { useState, useEffect } from 'react';

interface Metric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export default function ConnectionMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Average Latency', value: 24, unit: 'ms', trend: 'down', change: -5 },
    { label: 'Connection Success Rate', value: 99.8, unit: '%', trend: 'stable', change: 0 },
    { label: 'Average Speed', value: 85.5, unit: 'Mbps', trend: 'up', change: 12 },
    { label: 'Uptime', value: 99.95, unit: '%', trend: 'stable', change: 0 },
  ]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Connection Metrics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metric.value}</span>
              <span className="text-gray-600">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-2">Performance Summary</h4>
        <p className="text-sm text-gray-700">
          Your connection is performing excellently with 99.95% uptime and average latency of 24ms. 
          Connection success rate is at 99.8%, indicating a stable and reliable proxy service.
        </p>
      </div>
    </div>
  );
}

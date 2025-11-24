'use client';

import { useState } from 'react';

interface TrendData {
  date: string;
  bandwidth: number;
  requests: number;
  cost: number;
}

export default function UsageTrends() {
  const [timeRange, setTimeRange] = useState('7d');
  const [trends] = useState<TrendData[]>([
    { date: 'Jan 14', bandwidth: 2.1, requests: 450, cost: 12.50 },
    { date: 'Jan 15', bandwidth: 2.8, requests: 620, cost: 16.80 },
    { date: 'Jan 16', bandwidth: 1.9, requests: 380, cost: 11.40 },
    { date: 'Jan 17', bandwidth: 3.2, requests: 750, cost: 19.20 },
    { date: 'Jan 18', bandwidth: 2.5, requests: 580, cost: 15.00 },
    { date: 'Jan 19', bandwidth: 3.5, requests: 820, cost: 21.00 },
    { date: 'Jan 20', bandwidth: 2.9, requests: 680, cost: 17.40 },
  ]);

  const avgBandwidth = (trends.reduce((sum, t) => sum + t.bandwidth, 0) / trends.length).toFixed(2);
  const totalCost = trends.reduce((sum, t) => sum + t.cost, 0).toFixed(2);
  const maxBandwidth = Math.max(...trends.map(t => t.bandwidth));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Usage Trends</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Avg Bandwidth</p>
          <p className="text-2xl font-bold text-blue-600">{avgBandwidth} GB</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Cost</p>
          <p className="text-2xl font-bold text-green-600">${totalCost}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Peak Usage</p>
          <p className="text-2xl font-bold text-purple-600">{maxBandwidth} GB</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-4">Bandwidth Trend</h4>
        <div className="flex items-end gap-2 h-32">
          {trends.map((trend, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(trend.bandwidth / maxBandwidth) * 100}%` }}
              ></div>
              <p className="text-xs text-gray-600 mt-2">{trend.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold mb-3">Daily Breakdown</h4>
        {trends.map((trend, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm">{trend.date}</span>
            <div className="flex gap-6 text-sm">
              <span>{trend.bandwidth} GB</span>
              <span>{trend.requests} req</span>
              <span className="font-semibold">${trend.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

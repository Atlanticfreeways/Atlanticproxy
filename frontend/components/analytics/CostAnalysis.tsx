'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CostData {
  date: string;
  cost: number;
  bandwidth: number;
}

interface CategoryBreakdown {
  name: string;
  value: number;
  percentage: number;
}

export default function CostAnalysis() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const costData: CostData[] = [
    { date: 'Jan 1', cost: 12.50, bandwidth: 45 },
    { date: 'Jan 8', cost: 18.75, bandwidth: 62 },
    { date: 'Jan 15', cost: 15.25, bandwidth: 51 },
    { date: 'Jan 22', cost: 22.00, bandwidth: 78 },
    { date: 'Jan 29', cost: 19.50, bandwidth: 68 },
  ];

  const categoryBreakdown: CategoryBreakdown[] = [
    { name: 'Residential', value: 45, percentage: 45 },
    { name: 'Datacenter', value: 35, percentage: 35 },
    { name: 'Mobile', value: 20, percentage: 20 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const totalCost = costData.reduce((sum, item) => sum + item.cost, 0);
  const avgCost = (totalCost / costData.length).toFixed(2);
  const maxCost = Math.max(...costData.map(item => item.cost)).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Cost Analysis</h3>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average Daily</p>
          <p className="text-2xl font-bold text-green-600">${avgCost}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Peak Daily</p>
          <p className="text-2xl font-bold text-orange-600">${maxCost}</p>
        </div>
      </div>

      {/* Cost Trend Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold mb-4">Cost Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Cost ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold mb-4">Spending by Proxy Type</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Table */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Breakdown Details</h4>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                </div>
                <p className="font-semibold text-blue-600">${item.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Cost Optimization Tips</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Consider switching to datacenter proxies for non-sensitive tasks (30% cheaper)</li>
          <li>• Use sticky sessions to reduce connection overhead</li>
          <li>• Schedule bulk operations during off-peak hours</li>
        </ul>
      </div>
    </div>
  );
}

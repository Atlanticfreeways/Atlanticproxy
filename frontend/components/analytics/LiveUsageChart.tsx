'use client';

import { useState, useEffect } from 'react';

interface UsageData {
  timestamp: string;
  bandwidth: number;
  requests: number;
}

export default function LiveUsageChart() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [totalBandwidth, setTotalBandwidth] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const mockData: UsageData[] = [
      { timestamp: '00:00', bandwidth: 120, requests: 450 },
      { timestamp: '04:00', bandwidth: 85, requests: 320 },
      { timestamp: '08:00', bandwidth: 250, requests: 890 },
      { timestamp: '12:00', bandwidth: 380, requests: 1200 },
      { timestamp: '16:00', bandwidth: 420, requests: 1450 },
      { timestamp: '20:00', bandwidth: 350, requests: 1100 },
      { timestamp: '23:59', bandwidth: 200, requests: 650 },
    ];
    setUsageData(mockData);
    setTotalBandwidth(mockData.reduce((sum, d) => sum + d.bandwidth, 0));
    setTotalRequests(mockData.reduce((sum, d) => sum + d.requests, 0));
  }, []);

  const maxBandwidth = Math.max(...usageData.map(d => d.bandwidth), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Live Usage Analytics</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Bandwidth (24h)</p>
          <p className="text-2xl font-bold text-blue-600">{totalBandwidth} MB</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Requests (24h)</p>
          <p className="text-2xl font-bold text-green-600">{totalRequests}</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-4">Bandwidth Usage (24 Hours)</h4>
        <div className="space-y-3">
          {usageData.map((data, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-12 text-sm text-gray-600">{data.timestamp}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all"
                  style={{ width: `${(data.bandwidth / maxBandwidth) * 100}%` }}
                ></div>
              </div>
              <span className="w-16 text-right text-sm font-semibold">{data.bandwidth} MB</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-4">Request Distribution</h4>
        <div className="grid grid-cols-7 gap-2">
          {usageData.map((data, idx) => (
            <div key={idx} className="text-center">
              <div className="bg-gray-100 rounded p-2 mb-2">
                <div
                  className="bg-green-500 rounded"
                  style={{
                    height: `${(data.requests / Math.max(...usageData.map(d => d.requests))) * 100}px`,
                    minHeight: '20px',
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">{data.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
        View Detailed Report
      </button>
    </div>
  );
}

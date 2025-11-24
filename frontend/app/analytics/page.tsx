'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function AnalyticsPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('month');
  const [usageTrends, setUsageTrends] = useState<any[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (token) {
      loadAnalyticsData();
    }
  }, [token, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoadingData(true);
      const [trendsData, costData] = await Promise.all([
        api.getUsageTrends(token!, timeRange),
        api.getCostAnalysis(token!),
      ]);
      setUsageTrends(trendsData.trends || []);
      setCostAnalysis(costData);
    } catch (error: any) {
      showToast('Failed to load analytics: ' + error.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      const result = await api.exportData(token!, format);
      showToast(`Exported as ${format.toUpperCase()}!`, 'success');
      // In a real scenario, this would trigger a download
      console.log('Export result:', result);
    } catch (error: any) {
      showToast('Export failed: ' + error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-600">Track your usage and performance metrics</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Time Range Selector */}
        <div className="mb-8 flex gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Data Used</p>
            <p className="text-3xl font-bold text-gray-900">250 MB</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">1,500</p>
            <p className="text-xs text-green-600 mt-2">↑ 8% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900">99.8%</p>
            <p className="text-xs text-green-600 mt-2">↑ 0.2% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Estimated Cost</p>
            <p className="text-3xl font-bold text-gray-900">$2.50</p>
            <p className="text-xs text-green-600 mt-2">↓ 5% from last month</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Trend</h2>
            {loadingData ? (
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : usageTrends.length > 0 ? (
              <div className="h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg flex items-end justify-around p-4">
                {usageTrends.map((data, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-600 rounded-t w-8 hover:bg-blue-700 transition"
                    style={{ height: `${Math.min(data.bytes_sent / 1000000, 100)}%` }}
                    title={`${data.date}: ${data.bytes_sent} bytes`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">No data available</div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4 text-center">Last {timeRange}</p>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
            {loadingData ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-2 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : costAnalysis ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Proxy Cost</span>
                    <span className="text-sm font-medium text-gray-900">${costAnalysis.proxy_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Bandwidth Cost</span>
                    <span className="text-sm font-medium text-gray-900">${costAnalysis.bandwidth_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Requests Cost</span>
                    <span className="text-sm font-medium text-gray-900">${costAnalysis.requests_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No cost data available</div>
            )}
          </div>
        </div>

        {/* Connection Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Connection Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Average Latency</p>
              <p className="text-2xl font-bold text-gray-900">45ms</p>
              <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.8%</p>
              <p className="text-xs text-gray-500 mt-1">Highly reliable</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-2">Avg Bandwidth</p>
              <p className="text-2xl font-bold text-gray-900">2.5 Mbps</p>
              <p className="text-xs text-gray-500 mt-1">Good speed</p>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Proxy Locations</h2>
          <div className="space-y-3">
            {[
              { location: 'United States (New York)', requests: 450, percentage: 30 },
              { location: 'United Kingdom (London)', requests: 300, percentage: 20 },
              { location: 'Germany (Frankfurt)', requests: 280, percentage: 18.7 },
              { location: 'Japan (Tokyo)', requests: 250, percentage: 16.7 },
              { location: 'Australia (Sydney)', requests: 220, percentage: 14.6 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.location}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-gray-900">{item.requests}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {exporting ? '⏳ Exporting...' : '📥 Export as CSV'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {exporting ? '⏳ Exporting...' : '📥 Export as PDF'}
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            📧 Email Report
          </button>
        </div>
      </main>
    </div>
  );
}

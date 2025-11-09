'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Navigation } from '../../components/ui/Navigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { formatBytes } from '../../lib/utils';

interface AnalyticsData {
  usageOverTime: Array<{
    date: string;
    bytes: number;
    requests: number;
    success: number;
  }>;
  usageByType: Array<{
    proxy_type: string;
    bytes: number;
    requests: number;
  }>;
}

interface EnterpriseData {
  slaMetrics: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    activeEndpoints: number;
    uptime: number;
  };
  geoAnalytics: Array<{
    country: string;
    endpointCount: number;
    totalBytes: number;
    totalRequests: number;
    avgSuccessRate: string;
  }>;
  performanceMetrics: Array<{
    timestamp: string;
    successRate: string;
    bytesUsed: number;
    requestsCount: number;
    activeEndpoints: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, period]);

  const loadAnalyticsData = async () => {
    try {
      const basicAnalytics = await api.getUsageAnalytics(period);
      setAnalyticsData(basicAnalytics);

      // Load enterprise analytics if user has access
      if (['admin', 'reseller'].includes(user?.role || '')) {
        try {
          const enterpriseAnalytics = await api.getEnterpriseDashboard();
          setEnterpriseData(enterpriseAnalytics);
        } catch (enterpriseError) {
          // User doesn't have enterprise access, continue with basic analytics
          console.log('No enterprise access');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getProxyTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      residential: '🏠',
      datacenter: '🏢',
      mobile: '📱',
      isp: '🌐'
    };
    return icons[type] || '🌐';
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      US: '🇺🇸',
      UK: '🇬🇧',
      DE: '🇩🇪',
      CA: '🇨🇦',
      AU: '🇦🇺',
      JP: '🇯🇵',
      FR: '🇫🇷',
      IT: '🇮🇹',
      ES: '🇪🇸',
      BR: '🇧🇷'
    };
    return flags[countryCode] || '🌍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center">
            <LoadingSpinner className="mr-3" />
            <span className="text-lg">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Monitor your proxy usage and performance</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Enterprise SLA Metrics */}
        {enterpriseData?.slaMetrics && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">SLA Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="card p-6">
                <div className="text-2xl font-bold text-gray-900">{enterpriseData.slaMetrics.uptime.toFixed(2)}%</div>
                <div className="text-sm text-gray-500">Uptime</div>
                <div className={`text-xs mt-1 ${enterpriseData.slaMetrics.uptime >= 99.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {enterpriseData.slaMetrics.uptime >= 99.9 ? 'SLA Met' : 'Below SLA'}
                </div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-gray-900">{enterpriseData.slaMetrics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-gray-900">{enterpriseData.slaMetrics.avgResponseTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-gray-900">{enterpriseData.slaMetrics.totalRequests.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-gray-900">{enterpriseData.slaMetrics.activeEndpoints}</div>
                <div className="text-sm text-gray-500">Active Endpoints</div>
              </div>
            </div>
          </div>
        )}

        {/* Usage by Proxy Type */}
        {analyticsData?.usageByType && analyticsData.usageByType.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Usage by Proxy Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.usageByType.map((item) => (
                <div key={item.proxy_type} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{getProxyTypeIcon(item.proxy_type)}</span>
                    <span className="font-semibold capitalize">{item.proxy_type}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Bandwidth: {formatBytes(item.bytes)}</div>
                    <div>Requests: {item.requests.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geographic Analytics */}
        {enterpriseData?.geoAnalytics && enterpriseData.geoAnalytics.length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Country</th>
                    <th className="text-left py-2">Endpoints</th>
                    <th className="text-left py-2">Bandwidth</th>
                    <th className="text-left py-2">Requests</th>
                    <th className="text-left py-2">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {enterpriseData.geoAnalytics.slice(0, 10).map((item) => (
                    <tr key={item.country} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center">
                          <span className="mr-2">{getCountryFlag(item.country)}</span>
                          {item.country}
                        </div>
                      </td>
                      <td className="py-3">{item.endpointCount}</td>
                      <td className="py-3">{formatBytes(item.totalBytes)}</td>
                      <td className="py-3">{item.totalRequests.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(item.avgSuccessRate) >= 95 
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(item.avgSuccessRate) >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.avgSuccessRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usage Over Time */}
        {analyticsData?.usageOverTime && analyticsData.usageOverTime.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
            <div className="space-y-4">
              {analyticsData.usageOverTime.slice(-7).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{new Date(item.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">
                      {item.requests.toLocaleString()} requests • {formatBytes(item.bytes)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.requests > 0 ? ((item.success / item.requests) * 100).toFixed(1) : '0.0'}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {(!analyticsData?.usageOverTime || analyticsData.usageOverTime.length === 0) && (
          <div className="card p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-lg font-semibold mb-2">No Analytics Data</div>
              <div className="text-gray-600">Start using proxies to see analytics data here</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
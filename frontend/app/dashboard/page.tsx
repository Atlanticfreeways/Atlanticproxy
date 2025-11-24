'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';
import UsageStatsPanel from '@/components/UsageStatsPanel';
import KillSwitchControl from '@/components/KillSwitchControl';

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [showUsageStats, setShowUsageStats] = useState(false);
  const [showKillSwitch, setShowKillSwitch] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (token) loadStatus();
  }, [token]);

  const loadStatus = async () => {
    try {
      const data = await api.getProxyStatus(token!);
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const credentials = await api.connectProxy(token!);
      console.log('Proxy credentials received:', credentials);
      showToast(`Connected! Client ID: ${credentials.client_id}`, 'success');
      await loadStatus();
    } catch (error: any) {
      showToast('Connection failed: ' + error.message, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectProxy(token!);
      showToast('Disconnected successfully', 'success');
      await loadStatus();
    } catch (error: any) {
      showToast('Disconnect failed: ' + error.message, 'error');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AtlanticProxy</h1>
            <p className="text-sm text-gray-600">Enterprise-Grade Always-On Proxy Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.subscription_tier} Plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { href: '/dashboard', label: '📊 Dashboard' },
              { href: '/proxy-settings', label: '⚙️ Proxy Settings' },
              { href: '/billing', label: '💳 Billing' },
              { href: '/analytics', label: '📈 Analytics' },
              { href: '/referrals', label: '🤝 Referrals' },
              { href: '/support', label: '🆘 Support' },
              { href: '/account', label: '👤 Account' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loadingStatus ? 'Loading...' : status?.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Used</p>
                <p className="text-lg font-semibold text-gray-900">250 MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests</p>
                <p className="text-lg font-semibold text-gray-900">1,500</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">99.9%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="mr-2">🔗</span>
              Connection Status
            </h2>
            
            {loadingStatus ? (
              <div className="text-gray-500 text-center py-8">Loading status...</div>
            ) : status?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold text-green-700">Connected</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                
                {status.client_id && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Client ID</p>
                    <p className="font-mono text-sm">{status.client_id}</p>
                  </div>
                )}
                
                {status.ip_address && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-mono text-sm">{status.ip_address}</p>
                  </div>
                )}
                
                {status.location && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-sm">{status.location}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span className="text-lg font-bold text-gray-600">Disconnected</span>
                </div>
                <p className="text-sm text-gray-500">Ready to connect to proxy network</p>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h2>
            
            <div className="space-y-4">
              {!status?.connected ? (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:from-gray-400 disabled:to-gray-500 font-medium text-lg shadow-lg"
                >
                  {connecting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </span>
                  ) : (
                    '🚀 Connect to Proxy'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium text-lg shadow-lg"
                >
                  🛑 Disconnect
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => setShowUsageStats(!showUsageStats)}
                  className="p-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  📊 Usage Stats
                </button>
                <button 
                  onClick={() => setShowKillSwitch(!showKillSwitch)}
                  className="p-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  🛡️ Kill Switch
                </button>
                <button className="p-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  📋 Logs
                </button>
                <button className="p-3 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  💬 Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats Panel */}
        {showUsageStats && (
          <div className="mt-8">
            <UsageStatsPanel />
          </div>
        )}

        {/* Kill Switch Control */}
        {showKillSwitch && (
          <div className="mt-8">
            <KillSwitchControl />
          </div>
        )}

        {/* Features Showcase */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🎉 Atlantic Proxy Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">Always-On Service</h4>
              <p className="text-sm opacity-90">Persistent connection pools</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="font-semibold mb-1">Zero-Leak Protection</h4>
              <p className="text-sm opacity-90">Enhanced kill switch</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold mb-1">Auto-Reconnect</h4>
              <p className="text-sm opacity-90">Intelligent failover</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold mb-1">Real-time Analytics</h4>
              <p className="text-sm opacity-90">Performance monitoring</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
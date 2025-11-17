'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

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
      alert(`Connected! Client ID: ${credentials.client_id}`);
      await loadStatus();
    } catch (error: any) {
      alert('Connection failed: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectProxy(token!);
      await loadStatus();
    } catch (error: any) {
      alert('Disconnect failed: ' + error.message);
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AtlanticProxy Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Connection Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          {loadingStatus ? (
            <div className="text-gray-500">Loading status...</div>
          ) : status?.connected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-green-600">Connected</span>
              </div>
              {status.client_id && (
                <p className="text-sm text-gray-600">Client ID: {status.client_id}</p>
              )}
              {status.ip_address && (
                <p className="text-sm text-gray-600">IP: {status.ip_address}</p>
              )}
              {status.location && (
                <p className="text-sm text-gray-600">Location: {status.location}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-lg font-bold text-gray-600">Disconnected</span>
              </div>
              <p className="text-sm text-gray-500">Not connected to proxy</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Control Panel</h2>
          
          <div className="space-y-4">
            {!status?.connected ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
              >
                {connecting ? 'Connecting...' : 'Connect to Proxy'}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎉 Your proxy platform is ready!</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Go Backend API running</li>
            <li>✅ Authentication working</li>
            <li>✅ Proxy connection management</li>
            <li>✅ Oxylabs integration ready</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
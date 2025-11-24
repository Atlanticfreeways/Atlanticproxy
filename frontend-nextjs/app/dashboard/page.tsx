'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Globe, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  connectionStatus: string;
  currentProvider: string;
  uptime: string;
  dataTransferred: string;
  activeSessions: number;
  providerHealth: Array<{
    name: string;
    status: string;
    latency: number;
  }>;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    connectionStatus: 'Connected',
    currentProvider: 'oxylabs',
    uptime: '99.98%',
    dataTransferred: '1.2 TB',
    activeSessions: 3,
    providerHealth: [
      { name: 'oxylabs', status: 'healthy', latency: 120 },
      { name: 'smartproxy', status: 'healthy', latency: 145 },
      { name: 'bright', status: 'degraded', latency: 280 },
      { name: 'proxy6', status: 'healthy', latency: 95 },
    ],
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeSessions: Math.floor(Math.random() * 5) + 1,
        providerHealth: prev.providerHealth.map(provider => ({
          ...provider,
          latency: provider.latency + Math.floor(Math.random() * 20) - 10,
        })),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlantic-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'degraded':
        return 'status-degraded';
      case 'unhealthy':
        return 'status-unhealthy';
      default:
        return 'bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-atlantic-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Atlantic Proxy Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">{stats.connectionStatus}</span>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {user?.plan} Plan
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-atlantic-100 rounded-lg">
                <Globe className="w-6 h-6 text-atlantic-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Provider</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats.currentProvider}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uptime}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Transferred</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dataTransferred}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Provider Health */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Provider Health</h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.providerHealth.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(provider.status)}
                    <span className="font-medium text-gray-900 capitalize">{provider.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{provider.latency}ms</span>
                    <span className={getStatusClass(provider.status)}>
                      {provider.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left">
                Switch Provider
              </button>
              <button className="w-full btn-secondary text-left">
                Toggle Kill Switch
              </button>
              <button className="w-full btn-secondary text-left">
                View Analytics
              </button>
              <button className="w-full btn-secondary text-left">
                Download Config
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Connected to Oxylabs provider</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Session started for user session #3</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Provider health check completed</p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
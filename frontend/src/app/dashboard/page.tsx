'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import { Navigation } from '../../components/ui/Navigation';
import { DashboardStats } from '../../types';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadDashboardStats();
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const loadDashboardStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Proxies"
            value={stats?.activeProxies || 0}
            icon="🌐"
            change="+2 this week"
            changeType="positive"
          />
          <StatCard
            title="Bandwidth Used"
            value={stats?.bandwidthUsed || '0 GB'}
            icon="📊"
            change="24.7 GB this month"
            changeType="neutral"
          />
          <StatCard
            title="Success Rate"
            value={stats?.successRate || '0%'}
            icon="✅"
            change="99.8% average"
            changeType="positive"
          />
          <StatCard
            title="Avg Response"
            value={stats?.avgResponse || '0ms'}
            icon="⚡"
            change="<200ms target"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/proxies" className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-3">
                <span className="text-xl">🚀</span>
                <div>
                  <div className="font-medium">Manage Proxies</div>
                  <div className="text-sm text-gray-500">Create and manage proxy endpoints</div>
                </div>
              </a>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-3">
                <span className="text-xl">📈</span>
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-500">Check usage and performance</div>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <div className="font-medium">Referral Program</div>
                  <div className="text-sm text-gray-500">Earn commissions</div>
                </div>
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-green-500">✅</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">Account created</div>
                  <div className="text-xs text-gray-500">Welcome to Atlantic Proxy!</div>
                </div>
              </div>
              <div className="text-center text-gray-500 text-sm py-4">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
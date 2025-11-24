'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface UsageStats {
  user_id: number;
  bytes_sent: number;
  bytes_received: number;
  requests_count: number;
  session_time: number;
  last_updated: string;
}

export default function UsageStatsPanel() {
  const { token } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchUsageStats();
    }
  }, [token]);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const data = await api.getUsageStats(token!);
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Usage Statistics</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Usage Statistics</h3>
        <div className="text-red-600 text-center py-4">
          <p>Error: {error}</p>
          <button 
            onClick={fetchUsageStats}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">📈 Usage Statistics</h3>
        <button 
          onClick={fetchUsageStats}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      {stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Data Sent</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatBytes(stats.bytes_sent)}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Data Received</p>
            <p className="text-lg font-semibold text-green-600">
              {formatBytes(stats.bytes_received)}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded">
            <p className="text-sm text-gray-600">Requests</p>
            <p className="text-lg font-semibold text-purple-600">
              {stats.requests_count.toLocaleString()}
            </p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded">
            <p className="text-sm text-gray-600">Session Time</p>
            <p className="text-lg font-semibold text-yellow-600">
              {formatTime(stats.session_time)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No usage data available
        </div>
      )}
    </div>
  );
}
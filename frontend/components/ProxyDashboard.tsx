'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProxyStatus } from '@/hooks/useProxyStatus';
import { api } from '@/lib/api';

export default function ProxyDashboard() {
  const { token, logout } = useAuth();
  const { status, isConnected } = useProxyStatus();
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleConnect = async () => {
    if (!token) return;
    
    setConnecting(true);
    try {
      await api.connectProxy(token);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token) return;
    
    try {
      await api.disconnectProxy(token);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AtlanticProxy Dashboard</h1>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800 transition">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Real-time updates active' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          {status?.connected ? (
            <div className="text-green-600">
              <p className="text-lg font-bold">✅ Connected</p>
              <p>IP: {status.ip_address || 'N/A'}</p>
              <p>Location: {status.location || 'N/A'}</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <p className="text-lg font-bold">⭕ Disconnected</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4">
            <button
              onClick={handleConnect}
              disabled={connecting || status?.connected}
              className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {connecting ? 'Connecting...' : status?.connected ? 'Connected' : 'Connect'}
            </button>
            
            <button
              onClick={handleDisconnect}
              disabled={!status?.connected}
              className="flex-1 bg-red-600 text-white p-3 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
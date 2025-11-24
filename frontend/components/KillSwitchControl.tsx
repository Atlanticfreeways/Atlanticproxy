'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function KillSwitchControl() {
  const { token } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchKillSwitchStatus();
    }
  }, [token]);

  const fetchKillSwitchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/killswitch', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setEnabled(data.kill_switch_enabled || false);
    } catch (err: any) {
      setError('Failed to get kill switch status');
    }
  };

  const toggleKillSwitch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/killswitch?enabled=${!enabled}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle kill switch');
      }
      
      const data = await response.json();
      setEnabled(data.kill_switch_enabled);
      
      // Show success notification
      if (data.kill_switch_enabled) {
        alert('🛡️ Kill Switch ACTIVATED - All traffic blocked for security');
      } else {
        alert('✅ Kill Switch DEACTIVATED - Traffic allowed');
      }
    } catch (err: any) {
      setError(err.message);
      alert('❌ Failed to toggle kill switch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            🛡️ Kill Switch
          </h3>
          <p className="text-sm text-gray-600">
            Emergency protection - blocks all traffic instantly
          </p>
        </div>
        
        <div className="flex items-center">
          <span className={`text-sm font-medium mr-3 ${enabled ? 'text-red-600' : 'text-gray-600'}`}>
            {enabled ? 'ACTIVE' : 'INACTIVE'}
          </span>
          
          <button
            onClick={toggleKillSwitch}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              enabled 
                ? 'bg-red-600 focus:ring-red-500' 
                : 'bg-gray-200 focus:ring-blue-500'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      {enabled && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-red-700 font-medium">
              All network traffic is currently BLOCKED
            </span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>⚠️ Use only in emergencies. Activating will immediately block all internet access.</p>
      </div>
    </div>
  );
}
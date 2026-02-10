'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setReconnecting(true);
      
      unsubscribe = apiClient.subscribeToStatus((status) => {
        setIsConnected(true);
        setReconnecting(false);
      });

      // If not connected after 5 seconds, show reconnecting
      reconnectTimeout = setTimeout(() => {
        if (!isConnected) {
          setReconnecting(true);
        }
      }, 5000);
    };

    connect();

    return () => {
      if (unsubscribe) unsubscribe();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  if (!isConnected && !reconnecting) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {reconnecting ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-sm text-yellow-500">Reconnecting...</span>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-green-500">Connected</span>
        </div>
      )}
    </div>
  );
}

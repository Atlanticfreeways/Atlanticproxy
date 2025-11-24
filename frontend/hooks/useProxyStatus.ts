import { useState, useEffect } from 'react';

interface ProxyStatus {
  connected: boolean;
  ip_address?: string;
  location?: string;
  last_check?: string;
  error?: string;
}

export function useProxyStatus() {
  const [status, setStatus] = useState<ProxyStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'proxy_status') {
          setStatus(data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
    
    return () => ws.close();
  }, []);

  return { status, isConnected };
}
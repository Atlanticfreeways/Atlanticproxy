'use client';

import { useState } from 'react';

interface ProtocolConfig {
  protocol: 'HTTP' | 'HTTPS' | 'SOCKS5';
  port: number;
  authentication: boolean;
  username?: string;
  password?: string;
}

export default function ProxyProtocolSelector() {
  const [config, setConfig] = useState<ProtocolConfig>({
    protocol: 'HTTP',
    port: 8080,
    authentication: false,
  });

  const protocolPorts = {
    HTTP: 8080,
    HTTPS: 8443,
    SOCKS5: 1080,
  };

  const handleProtocolChange = (protocol: 'HTTP' | 'HTTPS' | 'SOCKS5') => {
    setConfig({
      ...config,
      protocol,
      port: protocolPorts[protocol],
    });
  };

  const handleAuthToggle = () => {
    setConfig({
      ...config,
      authentication: !config.authentication,
      username: !config.authentication ? '' : undefined,
      password: !config.authentication ? '' : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Proxy Protocol Configuration</h3>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Select Protocol</label>
        <div className="grid grid-cols-3 gap-4">
          {(['HTTP', 'HTTPS', 'SOCKS5'] as const).map(protocol => (
            <button
              key={protocol}
              onClick={() => handleProtocolChange(protocol)}
              className={`p-4 rounded-lg border-2 transition ${
                config.protocol === protocol
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold">{protocol}</div>
              <div className="text-xs text-gray-600 mt-1">Port: {protocolPorts[protocol]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Port</label>
        <input
          type="number"
          value={config.port}
          onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.authentication}
            onChange={handleAuthToggle}
            className="w-4 h-4"
          />
          <span className="font-semibold">Enable Authentication</span>
        </label>
      </div>

      {config.authentication && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              value={config.username || ''}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={config.password || ''}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold mb-2">Configuration Summary</h4>
        <code className="text-sm text-gray-700 block">
          {config.protocol}://{config.authentication ? `${config.username}:****@` : ''}localhost:{config.port}
        </code>
      </div>

      <div className="flex gap-3 mt-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Configuration
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Test Connection
        </button>
      </div>
    </div>
  );
}

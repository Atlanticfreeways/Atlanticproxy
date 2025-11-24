'use client';

import { useState } from 'react';

interface UserAgent {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

export default function UserAgentRotation() {
  const [agents, setAgents] = useState<UserAgent[]>([
    { id: '1', name: 'Chrome Windows', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', enabled: true },
    { id: '2', name: 'Firefox Linux', value: 'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0', enabled: true },
    { id: '3', name: 'Safari macOS', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', enabled: false },
  ]);
  const [rotationEnabled, setRotationEnabled] = useState(true);

  const handleToggle = (id: string) => {
    setAgents(agents.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const enabledCount = agents.filter(a => a.enabled).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">User Agent Rotation</h3>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rotationEnabled}
            onChange={(e) => setRotationEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-semibold">Enable User Agent Rotation</span>
        </label>
        <p className="text-sm text-gray-600 mt-2">
          Automatically rotate between selected user agents to avoid detection
        </p>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          {enabledCount} user agent{enabledCount !== 1 ? 's' : ''} selected for rotation
        </p>
      </div>

      <div className="space-y-3">
        {agents.map(agent => (
          <div key={agent.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-gray-600 font-mono truncate">{agent.value}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agent.enabled}
                  onChange={() => handleToggle(agent.id)}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
        Add Custom User Agent
      </button>
    </div>
  );
}

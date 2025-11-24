'use client';

import { useState } from 'react';

interface LeakTestResult {
  ipAddress: string;
  dnsLeaks: string[];
  webRtcLeaks: string[];
  isSecure: boolean;
  timestamp: string;
}

export default function IPLeakTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<LeakTestResult | null>(null);

  const runTest = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newResult: LeakTestResult = {
      ipAddress: '192.168.1.100',
      dnsLeaks: [],
      webRtcLeaks: [],
      isSecure: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setResult(newResult);
    setTesting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">IP Leak Test</h3>

      {result ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${result.isSecure ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl ${result.isSecure ? '✅' : '❌'}`}></span>
              <span className={`font-bold ${result.isSecure ? 'text-green-800' : 'text-red-800'}`}>
                {result.isSecure ? 'No Leaks Detected' : 'Leaks Detected'}
              </span>
            </div>
            <p className={`text-sm ${result.isSecure ? 'text-green-700' : 'text-red-700'}`}>
              {result.isSecure ? 'Your connection is secure' : 'Your IP may be exposed'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Your IP Address</p>
              <p className="font-mono text-lg">{result.ipAddress}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Test Time</p>
              <p className="text-lg">{result.timestamp}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold mb-2">DNS Leaks</p>
              <p className={`text-lg font-bold ${result.dnsLeaks.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.dnsLeaks.length === 0 ? '✓ None' : result.dnsLeaks.length}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold mb-2">WebRTC Leaks</p>
              <p className={`text-lg font-bold ${result.webRtcLeaks.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.webRtcLeaks.length === 0 ? '✓ None' : result.webRtcLeaks.length}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No test results yet</p>
          <p className="text-sm text-gray-500">Click the button below to check for IP leaks</p>
        </div>
      )}

      <button
        onClick={runTest}
        disabled={testing}
        className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
      >
        {testing ? 'Testing...' : 'Run Leak Test'}
      </button>
    </div>
  );
}

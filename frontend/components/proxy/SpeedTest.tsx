'use client';

import { useState } from 'react';

interface TestResult {
  download: number;
  upload: number;
  latency: number;
  timestamp: string;
}

export default function SpeedTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);

  const runTest = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newResult: TestResult = {
      download: Math.random() * 100 + 50,
      upload: Math.random() * 50 + 20,
      latency: Math.random() * 30 + 5,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setResult(newResult);
    setHistory([newResult, ...history.slice(0, 4)]);
    setTesting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Speed Test</h3>

      <div className="text-center mb-8">
        {result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Download</p>
                <p className="text-3xl font-bold text-blue-600">{result.download.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Mbps</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Upload</p>
                <p className="text-3xl font-bold text-green-600">{result.upload.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Mbps</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Latency</p>
                <p className="text-3xl font-bold text-purple-600">{result.latency.toFixed(1)}</p>
                <p className="text-xs text-gray-500">ms</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Tested at {result.timestamp}</p>
          </div>
        ) : (
          <div className="py-8">
            <p className="text-gray-600 mb-4">No test results yet</p>
            <p className="text-sm text-gray-500">Click the button below to start a speed test</p>
          </div>
        )}
      </div>

      <button
        onClick={runTest}
        disabled={testing}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
      >
        {testing ? 'Testing...' : 'Run Speed Test'}
      </button>

      {history.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold mb-4">Recent Tests</h4>
          <div className="space-y-2">
            {history.map((test, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{test.timestamp}</span>
                <div className="flex gap-6 text-sm">
                  <span>↓ {test.download.toFixed(1)} Mbps</span>
                  <span>↑ {test.upload.toFixed(1)} Mbps</span>
                  <span>⏱ {test.latency.toFixed(1)} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

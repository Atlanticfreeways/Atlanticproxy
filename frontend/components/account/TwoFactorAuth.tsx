'use client';

import { useState } from 'react';

export default function TwoFactorAuth() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable = () => {
    setBackupCodes(Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    ));
    setStep('verify');
  };

  const handleVerify = () => {
    if (code.length === 6) {
      setEnabled(true);
      setStep('complete');
      setCode('');
    }
  };

  if (step === 'complete') {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <h3 className="text-xl font-bold mb-4">✓ 2FA Enabled</h3>
        <p className="text-gray-600 mb-4">Two-factor authentication is now active on your account.</p>
        
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold mb-2">Backup Codes</p>
          <p className="text-xs text-gray-600 mb-3">Save these codes in a safe place. You can use them if you lose access to your authenticator.</p>
          <div className="space-y-1 font-mono text-xs">
            {backupCodes.map((code, idx) => (
              <div key={idx}>{code}</div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep('setup')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <h3 className="text-xl font-bold mb-4">Verify Code</h3>
        <p className="text-gray-600 mb-4">Enter the 6-digit code from your authenticator app.</p>
        
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, 6))}
          maxLength={6}
          placeholder="000000"
          className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleVerify}
          disabled={code.length !== 6}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Verify
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h3 className="text-xl font-bold mb-4">Two-Factor Authentication</h3>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          Add an extra layer of security to your account by requiring a code from your phone when you log in.
        </p>
      </div>

      {enabled ? (
        <div className="text-center">
          <p className="text-green-600 font-semibold mb-4">✓ 2FA is enabled</p>
          <button
            onClick={() => {
              setEnabled(false);
              setStep('setup');
            }}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            Disable 2FA
          </button>
        </div>
      ) : (
        <button
          onClick={handleEnable}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Enable 2FA
        </button>
      )}
    </div>
  );
}

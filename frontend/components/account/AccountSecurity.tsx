'use client';

import { useState } from 'react';

interface SecurityInfo {
  lastLogin: string;
  lastLoginIP: string;
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  activeDevices: number;
  loginAttempts: number;
}

export default function AccountSecurity() {
  const [security, setSecurity] = useState<SecurityInfo>({
    lastLogin: '2024-01-20 14:32 UTC',
    lastLoginIP: '192.168.1.100',
    lastPasswordChange: '2024-01-10',
    twoFactorEnabled: true,
    activeDevices: 2,
    loginAttempts: 0,
  });

  const [showSessions, setShowSessions] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLogoutAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeSessions = [
    { device: 'Chrome on macOS', ip: '192.168.1.100', lastActive: '2 minutes ago', current: true },
    { device: 'Safari on iPhone', ip: '192.168.1.101', lastActive: '1 hour ago', current: false },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">Account Security</h3>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Security settings updated
        </div>
      )}

      <div className="space-y-6">
        {/* Security Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Two-Factor Auth</p>
            <p className="text-lg font-bold text-green-600">✓ Enabled</p>
            <p className="text-xs text-gray-500 mt-2">Authenticator app</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
            <p className="text-lg font-bold text-blue-600">{security.activeDevices}</p>
            <p className="text-xs text-gray-500 mt-2">devices logged in</p>
          </div>
        </div>

        {/* Login Information */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Login Information</h4>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Last Login</p>
                <p className="text-xs text-gray-500">{security.lastLogin}</p>
              </div>
              <p className="text-sm text-gray-600">{security.lastLoginIP}</p>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Last Password Change</p>
                <p className="text-xs text-gray-500">{security.lastPasswordChange}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change
              </button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Failed Login Attempts</p>
                <p className="text-xs text-gray-500">Last 24 hours</p>
              </div>
              <p className="text-sm text-green-600 font-medium">{security.loginAttempts}</p>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-gray-700">Active Sessions</h4>
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showSessions ? 'Hide' : 'Show'}
            </button>
          </div>

          {showSessions && (
            <div className="space-y-2">
              {activeSessions.map((session, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{session.device}</p>
                    <p className="text-xs text-gray-500">{session.ip}</p>
                    <p className="text-xs text-gray-500">Last active: {session.lastActive}</p>
                    {session.current && <span className="text-xs text-green-600 font-medium">Current session</span>}
                  </div>
                  {!session.current && (
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Logout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Actions */}
        <div>
          <h4 className="font-semibold text-sm mb-4 text-gray-700">Security Actions</h4>
          <div className="space-y-2">
            <button className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-medium">Change Password</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-medium">Manage Two-Factor Auth</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-medium">View Security Log</span>
              <span className="text-gray-400">→</span>
            </button>
            <button
              onClick={handleLogoutAll}
              className="w-full p-3 text-left border border-red-300 rounded-lg hover:bg-red-50 flex justify-between items-center"
            >
              <span className="text-sm font-medium text-red-600">Logout All Devices</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">🔒 Security Tips</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Enable two-factor authentication</li>
            <li>• Review active sessions regularly</li>
            <li>• Logout from untrusted devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

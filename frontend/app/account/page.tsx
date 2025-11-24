'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function AccountPage() {
  const { user, logout, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enabling2FA, setEnabling2FA] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (token && activeTab === 'security') {
      loadSecurityInfo();
    }
  }, [token, activeTab]);

  const loadSecurityInfo = async () => {
    try {
      setLoadingData(true);
      const data = await api.getSecurityInfo(token!);
      setSecurityInfo(data);
    } catch (error: any) {
      showToast('Failed to load security info: ' + error.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword(token!, oldPassword, newPassword);
      showToast('Password changed successfully!', 'success');
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast('Failed to change password: ' + error.message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = async () => {
    setEnabling2FA(true);
    try {
      const result = await api.enable2FA(token!);
      showToast('2FA enabled! Save your backup codes.', 'success');
      console.log('2FA Secret:', result.secret);
    } catch (error: any) {
      showToast('Failed to enable 2FA: ' + error.message, 'error');
    } finally {
      setEnabling2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600">Manage your profile and preferences</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeTab === 'security'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔒 Security
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeTab === 'billing'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                💳 Billing
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded transition ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔔 Notifications
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Tier
                    </label>
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-600 capitalize font-medium">
                        {user?.subscription_tier || 'free'} Plan
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-600">November 23, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                {loadingData ? (
                  <div className="text-center py-8 text-gray-500">Loading security info...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Update your password to keep your account secure
                      </p>
                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Change Password
                        </button>
                      ) : (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleChangePassword}
                              disabled={changingPassword}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                            >
                              {changingPassword ? 'Saving...' : 'Save Password'}
                            </button>
                            <button
                              onClick={() => setShowPasswordForm(false)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-b pb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <button
                        onClick={handleEnable2FA}
                        disabled={enabling2FA}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                      >
                        {enabling2FA ? 'Enabling...' : 'Enable 2FA'}
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Active Sessions</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage your active sessions across devices
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Current Session - This Browser</p>
                        <p className="text-xs text-gray-500 mt-1">Last active: Just now</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Billing & Subscription</h2>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900">Free Plan</p>
                      <p className="text-sm text-blue-700 mt-1">$0/month</p>
                    </div>
                  </div>
                  <div className="border-b pb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Payment Methods</h3>
                    <p className="text-sm text-gray-600 mb-4">No payment methods added</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Add Payment Method
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Billing History</h3>
                    <p className="text-sm text-gray-600">No invoices yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Connection Alerts</p>
                      <p className="text-sm text-gray-600">Get notified about connection issues</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Usage Alerts</p>
                      <p className="text-sm text-gray-600">Get notified when approaching limits</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

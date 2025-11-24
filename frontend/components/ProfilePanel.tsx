'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePanel() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    // TODO: Implement profile update API
    alert('Profile update functionality coming soon');
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">👤 Profile Settings</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          {editing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          ) : (
            <p className="text-gray-900">{user?.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription
          </label>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded capitalize">
              {user?.subscription_tier || 'Free'}
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Upgrade
            </button>
          </div>
        </div>

        {editing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
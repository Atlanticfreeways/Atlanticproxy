'use client';

import { useState } from 'react';

export default function PasswordChange() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setPasswords({ ...passwords, [field]: value });
  };

  const handleSubmit = () => {
    setError('');
    setMessage('');

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('All fields are required');
      return;
    }

    if (passwords.new.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }

    setMessage('✓ Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h3 className="text-xl font-bold mb-6">Change Password</h3>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={(e) => handleChange('current', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">New Password</label>
          <input
            type="password"
            value={passwords.new}
            onChange={(e) => handleChange('new', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
          <p className="text-xs text-gray-500 mt-1">At least 8 characters, with uppercase and numbers</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleChange('confirm', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
      >
        Change Password
      </button>
    </div>
  );
}

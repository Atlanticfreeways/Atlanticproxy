'use client';

import { useState } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    timezone: 'EST',
  });

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Profile Settings</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Profile updated successfully
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={!editing}
              className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!editing}
              className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={!editing}
            className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={!editing}
            className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <select
              value={profile.country}
              onChange={(e) => handleChange('country', e.target.value)}
              disabled={!editing}
              className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              disabled={!editing}
              className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
            </select>
          </div>
        </div>
      </div>

      {editing && (
        <button
          onClick={handleSave}
          className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Save Changes
        </button>
      )}
    </div>
  );
}

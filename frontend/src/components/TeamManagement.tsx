import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
}

export const TeamManagement = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinDate: '2024-01-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'manager', status: 'active', joinDate: '2024-01-05' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'pending', joinDate: '2024-01-20' }
  ]);

  const [newMember, setNewMember] = useState({ email: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!newMember.email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });

      if (!response.ok) throw new Error('Failed to send invite');

      const data = await response.json();
      setMembers([...members, data]);
      setNewMember({ email: '', role: 'user' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove member');
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      if (!response.ok) throw new Error('Failed to update role');
      setMembers(members.map(m => m.id === id ? { ...m, role: role as any } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Team Management</h2>

      {success && <SuccessMessage message="Invitation sent successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-blue-600">{members.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{members.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{members.filter(m => m.status === 'pending').length}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {members.map(member => (
          <div key={member.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>

              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[member.status]}`}>
                {member.status}
              </span>

              <button
                onClick={() => handleRemove(member.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Invite Team Member</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            placeholder="Email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleInvite}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : 'Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};

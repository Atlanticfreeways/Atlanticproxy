'use client';

import { useState } from 'react';

interface DeleteStep {
  step: 'confirm' | 'verify' | 'final';
}

export default function DeleteAccount() {
  const [deleteState, setDeleteState] = useState<DeleteStep>({ step: 'confirm' });
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleInitiateDelete = () => {
    setDeleteState({ step: 'verify' });
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT' || !password) {
      return;
    }

    setDeleting(true);
    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDeleting(false);
    setDeleteState({ step: 'final' });
  };

  if (deleteState.step === 'final') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="text-xl font-bold mb-2">Account Deleted</h3>
          <p className="text-gray-600 mb-6">
            Your account and all associated data have been permanently deleted.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the homepage in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-2">Delete Account</h3>
      <p className="text-gray-600 text-sm mb-6">
        This action cannot be undone. Please read carefully.
      </p>

      {deleteState.step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">⚠ Warning</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Your account will be permanently deleted</li>
              <li>• All data will be erased (connections, billing history, etc.)</li>
              <li>• Active proxies will be disconnected</li>
              <li>• This cannot be reversed</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Before deleting:</strong> Download your data or contact support if you need any information.
            </p>
          </div>

          <button
            onClick={handleInitiateDelete}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            I Understand, Delete My Account
          </button>
        </div>
      )}

      {deleteState.step === 'verify' && (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              Please confirm your identity to proceed with account deletion.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Type "DELETE MY ACCOUNT" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is case-sensitive
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Enter your password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setDeleteState({ step: 'confirm' });
                setConfirmText('');
                setPassword('');
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={confirmText !== 'DELETE MY ACCOUNT' || !password || deleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const DeleteAccount = () => {
  const [step, setStep] = useState<'confirm' | 'verify' | 'processing'>('confirm');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInitiateDelete = () => {
    setStep('verify');
    setError('');
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type the confirmation text exactly');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) throw new Error('Failed to delete account');

      // Redirect to login after successful deletion
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('confirm');
    setPassword('');
    setConfirmText('');
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-red-500">
      <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Deleting your account is permanent and cannot be undone. All your data, proxies, and settings will be permanently deleted.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>This action will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Delete all your proxy configurations</li>
              <li>Cancel active subscriptions</li>
              <li>Remove all stored data</li>
              <li>Disable API access</li>
            </ul>
          </div>

          <button
            onClick={handleInitiateDelete}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete My Account
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Please confirm your password and type the confirmation text to proceed.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <code className="bg-gray-100 px-2 py-1 rounded">DELETE MY ACCOUNT</code> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Permanently Delete Account'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600">Deleting your account...</p>
          <p className="text-sm text-gray-500">You will be redirected shortly.</p>
        </div>
      )}
    </div>
  );
};

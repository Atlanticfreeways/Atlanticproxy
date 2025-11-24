import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SuccessMessage } from './ui/SuccessMessage';
import { ErrorMessage } from './ui/ErrorMessage';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export const PaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2025, isDefault: true },
    { id: '2', type: 'paypal', last4: 'user@example.com', isDefault: false }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}/default`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to set default');
      setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMethods(methods.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddMethod = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'card' })
      });

      if (!response.ok) throw new Error('Failed to add payment method');
      setSuccess(true);
      setShowAddForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'paypal': return '🅿️';
      case 'bank': return '🏦';
      default: return '💰';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">Payment Methods</h2>

      {success && <SuccessMessage message="Payment method added successfully" />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-3 mb-6">
        {methods.map(method => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{getMethodIcon(method.type)}</span>
              <div>
                <div className="font-semibold text-gray-900">
                  {method.brand || method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                </div>
                <div className="text-sm text-gray-600">
                  {method.type === 'card' ? `•••• ${method.last4}` : method.last4}
                  {method.expiryMonth && ` • Expires ${method.expiryMonth}/${method.expiryYear}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {method.isDefault && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Default
                </span>
              )}
              <div className="flex gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-4">You will be redirected to our secure payment processor to add a new payment method.</p>
          <div className="flex gap-3">
            <button
              onClick={handleAddMethod}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : 'Continue to Payment'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-medium"
        >
          + Add Payment Method
        </button>
      )}
    </div>
  );
};

'use client';

import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'crypto';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  added: string;
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
      added: '2024-01-10',
    },
    {
      id: '2',
      type: 'paypal',
      name: 'PayPal',
      isDefault: false,
      added: '2024-01-05',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSetDefault = (id: string) => {
    setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'crypto':
        return '₿';
      default:
        return '💰';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Payment Methods</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {showAddForm ? 'Cancel' : '+ Add Method'}
        </button>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Payment method updated
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Payment Method Type</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
              <option value="card">Credit/Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Card Number</label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Add Payment Method
          </button>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              method.isDefault
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getMethodIcon(method.type)}</span>
                <div>
                  <p className="font-bold text-gray-900">{method.name}</p>
                  {method.lastFour && (
                    <p className="text-sm text-gray-600">•••• {method.lastFour}</p>
                  )}
                  {method.expiryDate && (
                    <p className="text-sm text-gray-600">Expires: {method.expiryDate}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Added: {method.added}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Set Default
                  </button>
                )}
                {method.isDefault && (
                  <span className="px-3 py-1 text-sm font-bold text-blue-600 bg-blue-100 rounded">
                    Default
                  </span>
                )}
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-blue-900 mb-2">🔒 Security</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All payment information is encrypted</li>
          <li>• We never store full card numbers</li>
          <li>• PCI DSS compliant</li>
          <li>• Secure SSL/TLS connection</li>
        </ul>
      </div>
    </div>
  );
}

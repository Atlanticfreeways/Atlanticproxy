'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function BalancePanel() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('10');

  const handleTopUp = async () => {
    // TODO: Implement Stripe payment integration
    alert(`Top-up $${topUpAmount} functionality coming soon`);
    setShowTopUp(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">💰 Account Balance</h3>
        <button
          onClick={() => setShowTopUp(!showTopUp)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
        >
          + Top Up
        </button>
      </div>

      <div className="text-center py-4">
        <div className="text-3xl font-bold text-green-600 mb-2">
          ${balance.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600">Available Balance</p>
      </div>

      {showTopUp && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Add Funds</h4>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['10', '25', '50'].map((amount) => (
              <button
                key={amount}
                onClick={() => setTopUpAmount(amount)}
                className={`p-2 text-sm rounded border ${
                  topUpAmount === amount
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Amount
            </label>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              min="1"
              max="1000"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTopUp}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Pay ${topUpAmount}
            </button>
            <button
              onClick={() => setShowTopUp(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium mb-2">Recent Transactions</h4>
        <div className="text-sm text-gray-500 text-center py-2">
          No transactions yet
        </div>
      </div>
    </div>
  );
}
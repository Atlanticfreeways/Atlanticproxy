'use client';

import { useState } from 'react';

interface TopUpOption {
  amount: number;
  bonus: number;
  popular?: boolean;
}

const TOP_UP_OPTIONS: TopUpOption[] = [
  { amount: 10, bonus: 0 },
  { amount: 25, bonus: 2 },
  { amount: 50, bonus: 5, popular: true },
  { amount: 100, bonus: 15 },
  { amount: 250, bonus: 50 },
];

export default function TopUpModal() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleTopUp = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      alert(`Processing top-up of $${amount}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-6">Add Funds to Account</h3>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Select Amount</label>
        <div className="grid grid-cols-2 gap-3">
          {TOP_UP_OPTIONS.map(option => (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount);
                setCustomAmount('');
              }}
              className={`p-3 rounded-lg border-2 transition relative ${
                selectedAmount === option.amount
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {option.popular && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              <div className="font-bold">${option.amount}</div>
              {option.bonus > 0 && (
                <div className="text-xs text-green-600">+${option.bonus} bonus</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Custom Amount</label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 bg-gray-100 rounded-lg">$</span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Enter custom amount"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            step="0.01"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Payment Method</label>
        <div className="space-y-2">
          {['card', 'paypal', 'crypto'].map(method => (
            <label key={method} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span className="capitalize">{method === 'crypto' ? 'Cryptocurrency' : method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span>Amount:</span>
          <span className="font-semibold">${selectedAmount || customAmount || '0'}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Bonus:</span>
          <span className="font-semibold text-green-600">
            +${selectedAmount ? TOP_UP_OPTIONS.find(o => o.amount === selectedAmount)?.bonus || 0 : 0}
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-bold">Total Credit:</span>
          <span className="font-bold text-lg">
            ${(parseFloat(selectedAmount?.toString() || customAmount || '0') + 
              (selectedAmount ? TOP_UP_OPTIONS.find(o => o.amount === selectedAmount)?.bonus || 0 : 0)).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={handleTopUp}
        disabled={!selectedAmount && !customAmount}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
      >
        Proceed to Payment
      </button>
    </div>
  );
}

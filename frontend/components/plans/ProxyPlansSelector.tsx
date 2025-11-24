'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  type: 'Residential' | 'Datacenter' | 'Mobile';
  bandwidth: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'res-1gb',
    name: 'Starter',
    type: 'Residential',
    bandwidth: '1GB',
    price: 9.99,
    features: ['1GB/month', '10 concurrent connections', 'Basic support', 'US locations only'],
  },
  {
    id: 'res-10gb',
    name: 'Professional',
    type: 'Residential',
    bandwidth: '10GB',
    price: 49.99,
    features: ['10GB/month', '50 concurrent connections', 'Priority support', 'Global locations'],
    recommended: true,
  },
  {
    id: 'res-100gb',
    name: 'Enterprise',
    type: 'Residential',
    bandwidth: '100GB',
    price: 199.99,
    features: ['100GB/month', 'Unlimited connections', '24/7 support', 'Custom routing'],
  },
  {
    id: 'dc-1gb',
    name: 'Starter',
    type: 'Datacenter',
    bandwidth: '1GB',
    price: 4.99,
    features: ['1GB/month', '20 concurrent connections', 'Basic support', 'High speed'],
  },
  {
    id: 'dc-10gb',
    name: 'Professional',
    type: 'Datacenter',
    bandwidth: '10GB',
    price: 24.99,
    features: ['10GB/month', '100 concurrent connections', 'Priority support', 'Ultra-fast'],
  },
  {
    id: 'dc-100gb',
    name: 'Enterprise',
    type: 'Datacenter',
    bandwidth: '100GB',
    price: 99.99,
    features: ['100GB/month', 'Unlimited connections', '24/7 support', 'Dedicated IPs'],
  },
];

export default function ProxyPlansSelector() {
  const [selectedType, setSelectedType] = useState<'Residential' | 'Datacenter' | 'Mobile'>('Residential');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const filteredPlans = PLANS.filter(plan => plan.type === selectedType);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-3xl font-bold mb-2">Choose Your Proxy Plan</h2>
      <p className="text-gray-600 mb-8">Select the proxy type and bandwidth that fits your needs</p>

      <div className="flex gap-4 mb-8">
        {(['Residential', 'Datacenter', 'Mobile'] as const).map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <div
            key={plan.id}
            className={`border-2 rounded-lg p-6 transition cursor-pointer ${
              selectedPlan === plan.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            } ${plan.recommended ? 'ring-2 ring-green-400' : ''}`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                RECOMMENDED
              </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.bandwidth}/month</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2 rounded-lg font-medium transition ${
                selectedPlan === plan.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold mb-2">Selected Plan</h4>
          <p className="text-gray-700">
            {filteredPlans.find(p => p.id === selectedPlan)?.name} -{' '}
            {filteredPlans.find(p => p.id === selectedPlan)?.bandwidth} -
            ${filteredPlans.find(p => p.id === selectedPlan)?.price}/month
          </p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Continue to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

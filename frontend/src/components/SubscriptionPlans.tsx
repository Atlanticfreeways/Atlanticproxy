import { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

interface Plan {
  id: string;
  name: string;
  price: number;
  bandwidth: string;
  requestsPerMonth: number;
  features: string[];
  popular?: boolean;
}

export const SubscriptionPlans = () => {
  const [plans] = useState<Plan[]>([
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      bandwidth: '100GB',
      requestsPerMonth: 1000000,
      features: [
        'Up to 5 proxy endpoints',
        'Basic analytics',
        'Email support',
        'Residential proxies',
        'Auto-renewal'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      bandwidth: '500GB',
      requestsPerMonth: 5000000,
      features: [
        'Up to 20 proxy endpoints',
        'Advanced analytics',
        'Priority support',
        'All proxy types',
        'Custom headers',
        'Sticky sessions',
        'API access'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      bandwidth: 'Unlimited',
      requestsPerMonth: 50000000,
      features: [
        'Unlimited endpoints',
        'Custom analytics',
        '24/7 phone support',
        'All proxy types',
        'Advanced features',
        'Dedicated account manager',
        'SLA guarantee',
        'White-label options'
      ]
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) throw new Error('Failed to upgrade plan');

      // Redirect to payment or confirmation page
      const data = await response.json();
      window.location.href = data.redirectUrl || '/billing';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-2">Subscription Plans</h2>
      <p className="text-gray-600 mb-8">Choose the perfect plan for your needs</p>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`rounded-lg border-2 p-6 transition-all ${
              plan.popular
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="mb-4">
                <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>

            <div className="mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
              <div>📊 {plan.bandwidth} bandwidth</div>
              <div>📈 {plan.requestsPerMonth.toLocaleString()} requests/month</div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary-600 mt-0.5">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading && selectedPlan === plan.id}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {loading && selectedPlan === plan.id ? (
                <LoadingSpinner />
              ) : (
                'Upgrade to ' + plan.name
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Need a custom plan?</strong> Contact our sales team at <a href="mailto:sales@atlanticproxy.com" className="underline">sales@atlanticproxy.com</a> for enterprise solutions.
        </p>
      </div>
    </div>
  );
};

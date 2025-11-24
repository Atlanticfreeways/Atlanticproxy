'use client';

import { useState } from 'react';
import ProxyCustomizer from './ProxyCustomizer';

interface Plan {
  id: string;
  name: string;
  price: number;
  bandwidth: string;
  duration: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<'30min' | '1hour' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [customizingPlan, setCustomizingPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'quick-30min',
      name: 'Quick Pass',
      price: 0.99,
      bandwidth: '2 GB',
      duration: '30 minutes',
      features: [
        '2 GB bandwidth',
        'Residential proxies',
        '30-minute access',
        '1 concurrent connection',
        'Auto-renews if enabled',
      ],
    },
    {
      id: 'quick-1hour',
      name: 'Hourly Pass',
      price: 1.99,
      bandwidth: '5 GB',
      duration: '1 hour',
      features: [
        '5 GB bandwidth',
        'All proxy types',
        '1-hour access',
        '2 concurrent connections',
        'Auto-renews if enabled',
      ],
      popular: true,
    },
    {
      id: 'weekly',
      name: 'Weekly Plan',
      price: 9.99,
      bandwidth: '50 GB',
      duration: '7 days',
      features: [
        '50 GB bandwidth/week',
        'All proxy types',
        'Standard support',
        '5 concurrent connections',
        'Advanced analytics',
        'Auto-renews if enabled',
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 9.99 : 99.90,
      bandwidth: '10 GB',
      duration: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        '10 GB bandwidth/month',
        'Residential proxies',
        'Basic support',
        '1 concurrent connection',
        'API access',
      ],
    },
    {
      id: 'pro',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 29.99 : 299.90,
      bandwidth: '100 GB',
      duration: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        '100 GB bandwidth/month',
        'All proxy types',
        'Priority support',
        '10 concurrent connections',
        'Advanced analytics',
        'Custom headers',
        'Session persistence',
      ],
      popular: billingCycle !== '30min' && billingCycle !== '1hour' && billingCycle !== 'weekly',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99.99 : 999.90,
      bandwidth: 'Unlimited',
      duration: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        'Unlimited bandwidth',
        'All proxy types',
        '24/7 dedicated support',
        'Unlimited connections',
        'Advanced analytics',
        'White-label options',
        'Custom integration',
        'SLA guarantee',
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    // Simulate upgrade
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUpgrading(false);
  };

  const isQuickPass = ['30min', '1hour', 'weekly'].includes(billingCycle);
  const isRecurring = ['monthly', 'annual'].includes(billingCycle);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
        <p className="text-gray-600 mb-6">Select the perfect plan for your needs</p>

        {/* Plan Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setBillingCycle('30min')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              billingCycle === '30min'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Minutes
          </button>
          <button
            onClick={() => setBillingCycle('1hour')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              billingCycle === '1hour'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Hour
          </button>
          <button
            onClick={() => setBillingCycle('weekly')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              billingCycle === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annual
          </button>
        </div>

        {/* Auto-Renewal Toggle */}
        {isQuickPass && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-6">
            <label className="flex items-center cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={autoRenewal}
                onChange={(e) => setAutoRenewal(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="ml-2 text-sm font-medium text-blue-900">
                Auto-renew when time expires
              </span>
            </label>
            <span className="text-xs text-blue-700 font-medium">
              {autoRenewal ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )}

        {isRecurring && billingCycle === 'annual' && (
          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mb-6">
            Save 17%
          </span>
        )}
      </div>

      {/* Plans Grid */}
      <div className={`grid gap-6 ${isQuickPass ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
        {plans
          .filter((plan) => {
            if (isQuickPass) {
              return ['quick-30min', 'quick-1hour', 'weekly'].includes(plan.id);
            } else {
              return ['starter', 'pro', 'enterprise'].includes(plan.id);
            }
          })
          .map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-6 transition-all ${
                plan.popular
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{plan.bandwidth}</p>
              <p className="text-gray-500 text-xs mb-4">Duration: {plan.duration}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">${plan.price.toFixed(2)}</span>
                <span className="text-gray-600 text-sm">
                  {isQuickPass ? '/pass' : `/${billingCycle === 'monthly' ? 'month' : 'year'}`}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-300 text-gray-900 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {upgrading ? 'Processing...' : 'Choose Plan'}
                </button>
                {isRecurring && (
                  <button
                    onClick={() => setCustomizingPlan(plan.id)}
                    className="w-full py-2 rounded-lg font-semibold border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    ⚙️ Customize
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-bold mb-6">Frequently Asked Questions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-sm mb-2">What's the difference between quick passes and subscriptions?</p>
            <p className="text-sm text-gray-600">
              Quick passes (30 min, 1 hour, weekly) are pay-as-you-go with optional auto-renewal. Subscriptions (monthly, annual) are recurring plans with more features.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">How does auto-renewal work?</p>
            <p className="text-sm text-gray-600">
              When enabled, your quick pass automatically renews when it expires. You can disable it anytime in your account settings.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Can I change plans anytime?</p>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">What happens to unused bandwidth?</p>
            <p className="text-sm text-gray-600">
              For subscriptions, unused bandwidth rolls over to the next period. Quick passes expire after their duration.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Is there a free trial?</p>
            <p className="text-sm text-gray-600">
              Yes, all subscription plans come with a 7-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">What payment methods do you accept?</p>
            <p className="text-sm text-gray-600">
              We accept all major credit cards, PayPal, and cryptocurrency.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Pass Info */}
      {isQuickPass && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-900 mb-2">⏱ Quick Pass Information</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Access starts immediately after purchase</li>
            <li>• Auto-renewal charges your account when time expires (if enabled)</li>
            <li>• You can disable auto-renewal anytime</li>
            <li>• Unused bandwidth does not carry over</li>
            <li>• Perfect for testing or short-term needs</li>
          </ul>
        </div>
      )}

      {/* Customizer Modal */}
      {customizingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customize Your Plan</h2>
              <button
                onClick={() => setCustomizingPlan(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ProxyCustomizer
                basePrice={plans.find(p => p.id === customizingPlan)?.price || 0}
                bandwidth={plans.find(p => p.id === customizingPlan)?.bandwidth || ''}
                planName={plans.find(p => p.id === customizingPlan)?.name || ''}
                onCustomizationChange={(customization) => {
                  console.log('Customization:', customization);
                  // Handle customization
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

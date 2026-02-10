import Link from 'next/link';
import { Check } from 'phosphor-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$6.99',
      period: '/week',
      description: 'Perfect for testing',
      features: ['10GB/week data', '72M+ residential IPs', 'Town-level targeting', 'HTTPS protocol', 'Kill switch', 'Ad-blocking'],
    },
    {
      name: 'PAYG',
      price: '$1.20',
      period: '/hour',
      description: 'Pay only when you use',
      features: ['Unlimited data*', 'All protocols', 'ISP targeting', 'Priority routing', 'No commitment'],
    },
    {
      name: 'Personal',
      price: '$29',
      period: '/month',
      description: 'Most popular',
      features: ['50GB/month', 'API access', 'Protocol selection', 'Unlimited hours', 'Email support'],
      popular: true,
    },
    {
      name: 'Team',
      price: '$99',
      period: '/month',
      description: 'For teams',
      features: ['500GB/month', '5 team seats', 'Team management', 'Usage analytics', 'Priority support'],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For organizations',
      features: ['1TB+ data', 'Unlimited seats', 'Dedicated IPs', 'White-label', '99.99% SLA'],
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Premium residential proxies with town-level targeting at every tier.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className={`relative p-6 rounded-2xl border-2 ${plan.popular ? 'border-blue-600 shadow-xl' : 'border-gray-200 hover:border-blue-300'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <Check size={16} weight="bold" className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className={`block w-full py-2 px-4 text-center font-semibold rounded-lg text-sm ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Check, Sparkle } from 'phosphor-react';

const PricingPreview = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$6.99',
      period: '/week',
      description: 'Perfect for testing',
      features: ['10GB/week data', '72M+ residential IPs', 'Town-level targeting', 'HTTPS protocol', 'Kill switch', 'Ad-blocking'],
      popular: false,
    },
    {
      name: 'Personal',
      price: '$29',
      period: '/month',
      description: 'Most popular choice',
      features: ['50GB/month data', 'All protocols', 'API access', 'Protocol selection', 'Unlimited hours', 'Priority support'],
      popular: true,
    },
    {
      name: 'Team',
      price: '$99',
      period: '/month',
      description: 'For growing teams',
      features: ['500GB/month data', '5 team seats', 'Team management', 'Usage analytics', 'Shared configs', 'Priority support'],
      popular: false,
    },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Simple,</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative glass-card p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105'
                  : 'border-white/10 hover:border-blue-500/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    <Sparkle size={16} weight="fill" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check size={20} weight="bold" className="text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className={`block w-full py-3 px-6 text-center font-semibold rounded-xl transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* See Full Pricing Link */}
        <div className="text-center">
          <Link href="/pricing" className="text-blue-400 hover:text-blue-300 font-semibold text-lg">
            See full pricing details →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;

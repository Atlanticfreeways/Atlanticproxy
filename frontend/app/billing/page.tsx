'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function BillingPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (token) {
      loadPlans();
      loadInvoices();
    }
  }, [token]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const data = await api.getPlans();
      setPlans(data.plans || defaultPlans);
    } catch (error: any) {
      showToast('Failed to load plans: ' + error.message, 'error');
      setPlans(defaultPlans);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const data = await api.getInvoices(token!);
      setInvoices(data.invoices || []);
    } catch (error: any) {
      console.error('Failed to load invoices:', error);
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubscribe = async (planId: string, amount: number) => {
    if (amount === 0) {
      showToast('You are already on the Free plan', 'info');
      return;
    }

    setSubscribing(true);
    try {
      const result = await api.subscribe(planId);
      showToast('Subscription initiated! Redirecting to payment...', 'success');
      // In a real scenario, this would open Paystack modal
      // For now, just show the authorization URL
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      }
    } catch (error: any) {
      showToast('Subscription failed: ' + error.message, 'error');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const defaultPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      display_price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: ['1 GB/month', '1 location', 'Basic support', 'HTTP/HTTPS'],
      cta: 'Current Plan',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      display_price: '$9.99',
      period: '/month',
      description: 'For regular users',
      features: ['100 GB/month', 'All locations', 'Priority support', 'All protocols', 'Custom headers'],
      cta: 'Upgrade',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      display_price: 'Custom',
      period: 'pricing',
      description: 'For large-scale operations',
      features: ['Unlimited bandwidth', 'Dedicated support', 'Custom integration', 'SLA guarantee', 'White-label'],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-600">Manage your subscription and payment methods</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Choose Your Plan</h2>
          {loadingPlans ? (
            <div className="text-center py-12 text-gray-500">Loading plans...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg shadow transition transform hover:scale-105 ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        {plan.display_price || plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSubscribe(plan.id, plan.price)}
                      disabled={subscribing}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 ${
                        plan.highlighted
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {subscribing ? 'Processing...' : plan.cta}
                    </button>
                    <div className="mt-6 space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className={`mr-2 ${plan.highlighted ? 'text-blue-200' : 'text-green-600'}`}>✓</span>
                          <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">Free Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renewal Date</span>
                <span className="font-medium text-gray-900">December 23, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Cost</span>
                <span className="font-medium text-gray-900">$0.00</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">No payment methods added</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Add Payment Method
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Manage Payment Methods
              </button>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
          {loadingInvoices ? (
            <div className="text-center py-8 text-gray-500">Loading invoices...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr className="border-b hover:bg-gray-50">
                      <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                        No invoices yet
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{new Date(invoice.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-900">{invoice.description || 'Subscription'}</td>
                        <td className="py-3 px-4 text-gray-900">${invoice.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

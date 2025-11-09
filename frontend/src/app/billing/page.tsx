'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Navigation } from '../../components/ui/Navigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SuccessMessage } from '../../components/ui/SuccessMessage';
import { formatCurrency, formatBytes, formatDate } from '../../lib/utils';

interface BillingData {
  subscription: {
    id: number;
    plan_name: string;
    plan_type: string;
    price: number;
    status: string;
    starts_at: string;
    ends_at: string;
  } | null;
  recentInvoices: Array<{
    id: number;
    amount: number;
    status: string;
    due_date: string;
    paid_at: string | null;
    plan_name: string;
    created_at: string;
  }>;
  currentUsage: {
    bytes: number;
    limit: number | null;
    percentage: number;
    withinLimit: boolean;
  };
}

interface Plan {
  name: string;
  type: string;
  price: number;
  monthlyLimit: number | null;
  features: string[];
}

export default function BillingPage() {
  const { user } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPlans, setShowPlans] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
      loadPlans();
    }
  }, [user]);

  const loadBillingData = async () => {
    try {
      const data = await api.getBillingOverview();
      setBillingData(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data.plans);
    } catch (error: any) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleSubscribe = async (planName: string) => {
    setSubscribing(true);
    try {
      await api.subscribe(planName);
      setSuccess(`Successfully subscribed to ${planName} plan!`);
      setShowPlans(false);
      await loadBillingData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      await api.cancelSubscription();
      setSuccess('Subscription cancelled successfully');
      await loadBillingData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to cancel subscription');
    }
  };

  const handlePayInvoice = async (invoiceId: number) => {
    try {
      await api.payInvoice(invoiceId);
      setSuccess('Invoice paid successfully!');
      await loadBillingData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to pay invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center">
            <LoadingSpinner className="mr-3" />
            <span className="text-lg">Loading billing information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600">Manage your subscription and billing</p>
            </div>
            {!billingData?.subscription && (
              <button
                onClick={() => setShowPlans(true)}
                className="btn btn-primary"
              >
                Choose Plan
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}
        
        {success && (
          <div className="mb-6">
            <SuccessMessage message={success} onDismiss={() => setSuccess('')} />
          </div>
        )}

        {/* Current Subscription */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
          {billingData?.subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500">Plan</div>
                <div className="text-xl font-bold">{billingData.subscription.plan_name}</div>
                <div className="text-sm text-gray-600">{formatCurrency(billingData.subscription.price)}/month</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  billingData.subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {billingData.subscription.status}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Next Billing</div>
                <div className="font-semibold">{formatDate(billingData.subscription.ends_at)}</div>
                <button
                  onClick={handleCancelSubscription}
                  className="text-red-600 hover:text-red-800 text-sm mt-1"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-lg font-semibold mb-2">No Active Subscription</div>
              <div className="text-gray-600 mb-4">Choose a plan to get started with Atlantic Proxy</div>
              <button
                onClick={() => setShowPlans(true)}
                className="btn btn-primary"
              >
                View Plans
              </button>
            </div>
          )}
        </div>

        {/* Usage Overview */}
        {billingData?.subscription && (
          <div className="card p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Usage This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500">Bandwidth Used</div>
                <div className="text-xl font-bold">{formatBytes(billingData.currentUsage.bytes)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Limit</div>
                <div className="text-xl font-bold">
                  {billingData.currentUsage.limit ? formatBytes(billingData.currentUsage.limit) : 'Unlimited'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Usage</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        billingData.currentUsage.percentage > 90 ? 'bg-red-500' :
                        billingData.currentUsage.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(billingData.currentUsage.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{billingData.currentUsage.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Invoices */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
          {billingData?.recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🧾</div>
              <div>No invoices yet</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Due Date</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billingData?.recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100">
                      <td className="py-3">#{invoice.id}</td>
                      <td className="py-3">{invoice.plan_name}</td>
                      <td className="py-3 font-semibold">{formatCurrency(invoice.amount)}</td>
                      <td className="py-3">{formatDate(invoice.due_date)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Plans Modal */}
        {showPlans && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                <button
                  onClick={() => setShowPlans(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <div key={key} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="text-lg font-semibold mb-2">{plan.name}</div>
                    <div className="text-2xl font-bold text-primary-600 mb-4">
                      {formatCurrency(plan.price)}<span className="text-sm text-gray-500">/month</span>
                    </div>
                    <ul className="text-sm text-gray-600 mb-4 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(key)}
                      disabled={subscribing}
                      className="btn btn-primary w-full disabled:opacity-50"
                    >
                      {subscribing ? 'Subscribing...' : 'Choose Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
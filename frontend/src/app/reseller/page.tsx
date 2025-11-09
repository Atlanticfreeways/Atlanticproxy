'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Navigation } from '../../components/ui/Navigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SuccessMessage } from '../../components/ui/SuccessMessage';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ResellerStats {
  profile: {
    commission_rate: number;
    tier: string;
    status: string;
    total_customers: number;
    total_revenue: number;
  };
  customerCount: number;
  monthlyCommissions: number;
  monthlySales: number;
}

interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  commission_earned: number;
  referral_status: string;
  referred_at: string;
  plan_name: string;
  subscription_status: string;
}

export default function ResellerPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApplication, setShowApplication] = useState(false);
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    businessType: '',
    expectedVolume: '',
    experience: '',
    marketingPlan: ''
  });

  useEffect(() => {
    if (user) {
      loadResellerData();
    }
  }, [user]);

  const loadResellerData = async () => {
    try {
      if (user?.role === 'reseller') {
        const [dashboardData, customersData] = await Promise.all([
          api.getResellerDashboard(),
          api.getResellerCustomers()
        ]);
        setStats(dashboardData.stats);
        setCustomers(customersData.customers);
      } else {
        const appData = await api.getResellerApplication();
        setApplication(appData.application);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load reseller data');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    
    try {
      await api.applyForReseller(formData);
      setSuccess('Reseller application submitted successfully!');
      setShowApplication(false);
      await loadResellerData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tiers = {
      bronze: { name: 'Bronze', color: 'text-orange-600 bg-orange-50', rate: '30%' },
      silver: { name: 'Silver', color: 'text-gray-600 bg-gray-50', rate: '32.5%' },
      gold: { name: 'Gold', color: 'text-yellow-600 bg-yellow-50', rate: '35%' },
      platinum: { name: 'Platinum', color: 'text-purple-600 bg-purple-50', rate: '40%' }
    };
    return tiers[tier as keyof typeof tiers] || tiers.bronze;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center">
            <LoadingSpinner className="mr-3" />
            <span className="text-lg">Loading reseller data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Reseller Dashboard
  if (user?.role === 'reseller' && stats) {
    const tierInfo = getTierInfo(stats.profile.tier);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900">Reseller Dashboard</h1>
              <p className="text-gray-600">Manage your reseller business</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">👥</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.customerCount}</div>
                  <div className="text-sm text-gray-500">Total Customers</div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💰</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.monthlyCommissions)}
                  </div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📈</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.profile.commission_rate}%</div>
                  <div className="text-sm text-gray-500">Commission Rate</div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🏆</div>
                <div>
                  <div className={`text-lg font-bold px-2 py-1 rounded ${tierInfo.color}`}>
                    {tierInfo.name}
                  </div>
                  <div className="text-sm text-gray-500">Current Tier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Customers</h3>
            {customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <div>No customers yet</div>
                <div className="text-sm">Start referring customers to earn commissions!</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Company</th>
                      <th className="text-left py-2">Plan</th>
                      <th className="text-left py-2">Commission</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Referred</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100">
                        <td className="py-3">
                          {customer.first_name} {customer.last_name}
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </td>
                        <td className="py-3">{customer.company || '-'}</td>
                        <td className="py-3">{customer.plan_name || 'No plan'}</td>
                        <td className="py-3 font-semibold">
                          {formatCurrency(customer.commission_earned)}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.subscription_status || 'inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">
                          {formatDate(customer.referred_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Application Status or Form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Reseller Program</h1>
            <p className="text-gray-600">Join our reseller program and earn higher commissions</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {application ? (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Application Status</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{application.company_name}</div>
                <div className="text-sm text-gray-600">
                  Submitted {formatDate(application.created_at)}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                application.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : application.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {application.status}
              </span>
            </div>
            {application.status === 'pending' && (
              <div className="mt-4 text-sm text-gray-600">
                Your application is under review. We'll notify you once it's processed.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Program Benefits */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Reseller Program Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">💰</div>
                  <div>
                    <div className="font-semibold">Higher Commissions</div>
                    <div className="text-sm text-gray-600">Earn 30-40% recurring commissions</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <div className="font-semibold">Marketing Support</div>
                    <div className="text-sm text-gray-600">Access to marketing materials and tools</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">📊</div>
                  <div>
                    <div className="font-semibold">Advanced Analytics</div>
                    <div className="text-sm text-gray-600">Detailed customer and sales analytics</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🤝</div>
                  <div>
                    <div className="font-semibold">Dedicated Support</div>
                    <div className="text-sm text-gray-600">Priority support and account management</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Button */}
            <div className="text-center">
              <button
                onClick={() => setShowApplication(true)}
                className="btn btn-primary btn-lg"
              >
                Apply for Reseller Program
              </button>
            </div>
          </div>
        )}

        {/* Application Modal */}
        {showApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-xl font-semibold mb-6">Reseller Application</h3>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type *
                    </label>
                    <select
                      required
                      value={formData.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select type</option>
                      <option value="agency">Digital Agency</option>
                      <option value="consultant">Consultant</option>
                      <option value="developer">Developer</option>
                      <option value="reseller">Proxy Reseller</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Monthly Volume *
                    </label>
                    <select
                      required
                      value={formData.expectedVolume}
                      onChange={(e) => setFormData({...formData, expectedVolume: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select volume</option>
                      <option value="1-10">1-10 customers</option>
                      <option value="11-50">11-50 customers</option>
                      <option value="51-100">51-100 customers</option>
                      <option value="100+">100+ customers</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience with Proxy Services
                  </label>
                  <textarea
                    rows={3}
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your experience with proxy services..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketing Plan
                  </label>
                  <textarea
                    rows={3}
                    value={formData.marketingPlan}
                    onChange={(e) => setFormData({...formData, marketingPlan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="How do you plan to market our services?"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplication(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn btn-primary flex-1 disabled:opacity-50 flex items-center justify-center"
                  >
                    {applying ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
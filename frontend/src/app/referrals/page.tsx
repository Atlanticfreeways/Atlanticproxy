'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Navigation } from '../../components/ui/Navigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SuccessMessage } from '../../components/ui/SuccessMessage';
import { formatCurrency } from '../../lib/utils';

interface ReferralStats {
  referralCode: {
    code: string;
    commission_rate: number;
    total_referrals: number;
    total_earnings: number;
  };
  recentReferrals: Array<{
    id: number;
    referred_email: string;
    first_name: string;
    last_name: string;
    commission_earned: number;
    status: string;
    created_at: string;
  }>;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    try {
      const data = await api.getReferralStats();
      setStats(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load referral stats');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/auth/register?ref=${stats.referralCode.code}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setSuccess('Referral link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Failed to copy link');
    }
  };

  const getTierInfo = (referralCount: number) => {
    if (referralCount >= 16) return { tier: 'Gold', rate: 25, color: 'text-yellow-600 bg-yellow-50' };
    if (referralCount >= 6) return { tier: 'Silver', rate: 20, color: 'text-gray-600 bg-gray-50' };
    return { tier: 'Bronze', rate: 15, color: 'text-orange-600 bg-orange-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center">
            <LoadingSpinner className="mr-3" />
            <span className="text-lg">Loading referral stats...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message="Failed to load referral data" />
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(stats.referralCode.total_referrals);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
            <p className="text-gray-600">Earn commissions by referring new users</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.referralCode.total_referrals}</div>
                <div className="text-sm text-gray-500">Total Referrals</div>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💰</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.referralCode.total_earnings)}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📈</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.referralCode.commission_rate}%</div>
                <div className="text-sm text-gray-500">Commission Rate</div>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏆</div>
              <div>
                <div className={`text-lg font-bold px-2 py-1 rounded ${tierInfo.color}`}>
                  {tierInfo.tier}
                </div>
                <div className="text-sm text-gray-500">Current Tier</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Referral Code</div>
                <div className="font-mono text-lg font-bold">{stats.referralCode.code}</div>
              </div>
            </div>
            <button
              onClick={copyReferralLink}
              className={`btn ${copied ? 'btn-secondary' : 'btn-primary'} whitespace-nowrap`}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Share this link with others. When they sign up and make their first payment, you'll earn a {stats.referralCode.commission_rate}% commission!
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Commission Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
              <div className="text-orange-600 font-semibold">🥉 Bronze (1-5 referrals)</div>
              <div className="text-2xl font-bold text-orange-700">15%</div>
              <div className="text-sm text-orange-600">Commission Rate</div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
              <div className="text-gray-600 font-semibold">🥈 Silver (6-15 referrals)</div>
              <div className="text-2xl font-bold text-gray-700">20%</div>
              <div className="text-sm text-gray-600">Commission Rate</div>
            </div>
            <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
              <div className="text-yellow-600 font-semibold">🥇 Gold (16+ referrals)</div>
              <div className="text-2xl font-bold text-yellow-700">25%</div>
              <div className="text-sm text-yellow-600">Commission Rate</div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
          {stats.recentReferrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <div>No referrals yet</div>
              <div className="text-sm">Start sharing your referral link to earn commissions!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Commission</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100">
                      <td className="py-3">
                        {referral.first_name} {referral.last_name}
                      </td>
                      <td className="py-3 text-gray-600">{referral.referred_email}</td>
                      <td className="py-3 font-semibold">
                        {formatCurrency(referral.commission_earned)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {new Date(referral.created_at).toLocaleDateString()}
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
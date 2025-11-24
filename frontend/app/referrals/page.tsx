'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showToast } from '@/components/Toast';

export default function ReferralsPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralHistory, setReferralHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [claimingPayout, setClaimingPayout] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (token) {
      loadReferralData();
    }
  }, [token]);

  const loadReferralData = async () => {
    try {
      setLoadingData(true);
      const [codeData, historyData] = await Promise.all([
        api.getReferralCode(token!),
        api.getReferralHistory(token!),
      ]);
      setReferralCode(codeData.code || '');
      setReferralHistory(historyData.referrals || []);
    } catch (error: any) {
      showToast('Failed to load referral data: ' + error.message, 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const copyToClipboard = () => {
    const link = `https://atlanticproxy.com/ref/${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimPayout = async () => {
    setClaimingPayout(true);
    try {
      const result = await api.claimPayout(token!);
      showToast('Payout claimed successfully!', 'success');
      await loadReferralData();
    } catch (error: any) {
      showToast('Failed to claim payout: ' + error.message, 'error');
    } finally {
      setClaimingPayout(false);
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

  const referralLink = `https://atlanticproxy.com/ref/${referralCode}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-sm text-gray-600">Earn commissions by referring friends</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Referrals</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Active Referrals</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Commission Rate</p>
            <p className="text-3xl font-bold text-gray-900">20%</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg"
            />
            <button
              onClick={copyToClipboard}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-blue-100">Share this link with friends to earn 20% commission on their first year</p>
        </div>

        {/* Share Options */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Share Your Link</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              📘 Facebook
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              𝕏 Twitter
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              💼 LinkedIn
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              📧 Email
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">Send your unique referral link to friends</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-sm text-gray-600">Friends create an account using your link</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">3️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">You Earn</h3>
              <p className="text-sm text-gray-600">Get 20% commission on their subscription</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Referral History</h2>
            {referralHistory.length > 0 && (
              <button
                onClick={handleClaimPayout}
                disabled={claimingPayout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {claimingPayout ? 'Processing...' : '💰 Claim Payout'}
              </button>
            )}
          </div>
          {loadingData ? (
            <div className="text-center py-8 text-gray-500">Loading referrals...</div>
          ) : referralHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Commission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referralHistory.map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{referral.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          referral.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">${referral.commission?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(referral.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No referrals yet. Start sharing your link to earn commissions!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

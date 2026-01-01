"use client";

import { useEffect, useState } from 'react';
import { apiClient, Plan, Subscription } from '@/lib/api';
import { Loader2, Check, CreditCard, Shield, Zap, Lock, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);

    // Checkout State
    const [processing, setProcessing] = useState<string | null>(null); // PlanID being purchased
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto'>('paystack');

    // Crypto checkout details
    const [cryptoDetails, setCryptoDetails] = useState<{ address: string, amount: string, currency: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [plansData, subData] = await Promise.all([
                apiClient.getPlans(),
                apiClient.getSubscription()
            ]);
            setPlans(plansData);
            setSubscription(subData.subscription);
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = (plan: Plan) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
        setCryptoDetails(null); // Reset
    };

    const processPayment = async () => {
        console.log('Processing payment for:', selectedPlan?.id, 'via:', paymentMethod);
        if (!selectedPlan) {
            console.error('No plan selected');
            return;
        }
        setProcessing(selectedPlan.id);

        try {
            // Initiate Checkout
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) : {};
            const email = user.email || 'user@example.com';
            console.log('Using email for checkout:', email);

            const response = await apiClient.createCheckoutSession({
                plan_id: selectedPlan.id,
                email: email,
                method: paymentMethod,
                currency: paymentMethod === 'paystack' ? 'USD' : 'btc' // Default currencies
            });
            console.log('Checkout response:', response);

            if (paymentMethod === 'paystack' && response.url) {
                // Redirect to Paystack
                window.location.href = response.url;
            } else if (paymentMethod === 'crypto' && response.address) {
                // Show Crypto Details
                setCryptoDetails({
                    address: response.address,
                    amount: response.amount || '0',
                    currency: response.currency || 'btc'
                });
                setProcessing(null); // Stop spinner, show details
            }

        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Payment initialization failed: ' + (error as any).message);
            setProcessing(null);
        }
    };

    if (!mounted || loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
                <p className="text-zinc-400">Manage your subscription and usage limits.</p>
            </div>

            {/* Current Subscription Card */}
            <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900 to-black">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="text-sm font-medium text-purple-400 mb-1">CURRENT PLAN</div>
                        <div className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                            {subscription?.plan_id || 'Free'} Plan
                            <span className={`px-2 py-0.5 rounded-full text-xs ${subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {subscription?.status || 'Inactive'}
                            </span>
                        </div>
                        <div className="text-zinc-500 text-sm mt-1">
                            Expires: {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Never'}
                        </div>
                    </div>
                    {/* Usage Bar */}
                    <div className="w-full md:w-64">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Data Usage</span>
                            <span className="text-white">0 GB / {subscription?.plan_id === 'starter' ? '500 MB' : plans.find(p => p.id === subscription?.plan_id)?.data_limit_mb ? (plans.find(p => p.id === subscription?.plan_id)!.data_limit_mb / 1024) + ' GB' : 'Unlimited'}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[5%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`glass p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${subscription?.plan_id === plan.id ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 hover:border-white/10'}`}>
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-white mb-4">
                            ${plan.price_monthly} <span className="text-zinc-500 text-lg font-normal">/mo</span>
                        </div>

                        <div className="space-y-3 mb-8 min-h-[120px]">
                            {/* Feature List */}
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{plan.data_limit_mb > 0 ? (plan.data_limit_mb >= 1024 ? `${plan.data_limit_mb / 1024} GB` : `${plan.data_limit_mb} MB`) : 'Unlimited'} Bandwidth</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{plan.concurrent_conns} Concurrent Connections</span>
                            </div>
                            {plan.features?.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleUpgrade(plan)}
                            disabled={subscription?.plan_id === plan.id}
                            className={`w-full py-3 rounded-xl font-medium transition-all ${subscription?.plan_id === plan.id
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {subscription?.plan_id === plan.id ? 'Current Plan' : 'Upgrade'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && !cryptoDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass max-w-md w-full p-6 rounded-2xl border border-white/10 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Purchase {selectedPlan.name}</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-zinc-500 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div
                                onClick={() => setPaymentMethod('paystack')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'paystack' ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="text-white font-medium">Credit / Debit Card</div>
                                        <div className="text-xs text-zinc-500">Secured by Paystack</div>
                                    </div>
                                </div>
                                {paymentMethod === 'paystack' && <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-black"></div>}
                            </div>

                            <div
                                onClick={() => setPaymentMethod('crypto')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'crypto' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <div className="text-white font-medium">Crypto (BTC, ETH, SOL)</div>
                                        <div className="text-xs text-zinc-500">Direct Transfer</div>
                                    </div>
                                </div>
                                {paymentMethod === 'crypto' && <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-black"></div>}
                            </div>
                        </div>

                        <button
                            onClick={processPayment}
                            disabled={!!processing}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Pay ${selectedPlan.price_monthly}
                                    <Zap className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Crypto Details Modal (After selection) */}
            {cryptoDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass max-w-md w-full p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 text-center">Send Payment</h2>

                        <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-48 h-48 flex items-center justify-center">
                            {/* QR Code Placeholder */}
                            <div className="w-full h-full bg-black text-white flex items-center justify-center text-xs text-center p-4">
                                <div className="space-y-2">
                                    <Globe className="w-8 h-8 mx-auto text-purple-500 animate-pulse" />
                                    <div className="font-mono">{cryptoDetails.currency.toUpperCase()} QR</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                <div className="text-xs text-zinc-500 mb-1">Send Exactly</div>
                                <div className="text-lg font-mono text-white select-all">{cryptoDetails.amount} USD Equivalent</div>
                            </div>

                            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                <div className="text-xs text-zinc-500 mb-1">To Address ({cryptoDetails.currency.toUpperCase()})</div>
                                <div className="text-sm font-mono text-white break-all select-all">{cryptoDetails.address}</div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => { setCryptoDetails(null); setShowPaymentModal(false); }}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert("Thank you! Your payment is being verified. This can take up to 24 hours.");
                                    setCryptoDetails(null);
                                    setShowPaymentModal(false);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl text-sm font-medium"
                            >
                                I Have Sent It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

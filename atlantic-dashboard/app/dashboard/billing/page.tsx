'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, CreditCard, CaretRight } from '@phosphor-icons/react';
import { apiClient, Plan, Subscription } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [annual, setAnnual] = useState(false);


    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto'>('paystack');
    const [currency, setCurrency] = useState('USD');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cryptoDetails, setCryptoDetails] = useState<{ address: string, amount: string, currency: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [plansData, subData] = await Promise.all([
                apiClient.getPlans(),
                apiClient.getSubscription()
            ]);
            setPlans(plansData);
            setCurrentSub(subData.subscription);
            setCurrentPlan(subData.plan);
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialUpgrade = (planID: string) => {
        if (currentSub?.PlanID === planID) return;
        setSelectedPlanId(planID);
        setCryptoDetails(null);
    };

    const handleCheckout = async () => {
        if (!selectedPlanId) return;

        setIsProcessing(true);
        try {
            const resp = await apiClient.createCheckout({
                plan_id: selectedPlanId,
                email: 'user@example.com', // In real app, gets from auth state
                method: paymentMethod,
                currency: currency
            });

            if (resp.url) {
                // For Paystack or if crypto returns a URL
                window.location.href = resp.url;
            } else if (resp.address) {
                // For Crypto details
                setCryptoDetails({
                    address: resp.address,
                    amount: resp.amount || '0',
                    currency: resp.currency || 'BTC'
                });
            }
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading billing info...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
                <p className="text-neutral-400">Manage your plan and billing details</p>
            </div>

            {/* Selection Overview / Modal-like overlay */}
            {selectedPlanId && (
                <Card className="bg-neutral-900 border-blue-600 ring-1 ring-blue-600 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex justify-between items-center">
                            <span>Complete Upgrade to {plans.find(p => p.ID === selectedPlanId)?.Name}</span>
                            <Button variant="ghost" className="text-neutral-400" onClick={() => setSelectedPlanId(null)}>×</Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!cryptoDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-neutral-400">Payment method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('paystack')}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'paystack' ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 opacity-60'}`}
                                        >
                                            <CreditCard size={24} />
                                            <span className="text-xs font-bold">Paystack</span>
                                        </button>
                                        <button
                                            onClick={() => { setPaymentMethod('crypto'); setCurrency('btc'); }}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'crypto' ? 'bg-orange-600/10 border-orange-600 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 opacity-60'}`}
                                        >
                                            <Badge className="bg-orange-600 text-[10px] mb-[-12px] z-10">ANONYMOUS</Badge>
                                            <CaretRight size={24} className="rotate-90" />
                                            <span className="text-xs font-bold">Crypto</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-neutral-400">Select Currency</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(paymentMethod === 'paystack' ? ['USD', 'NGN', 'GHS'] : ['BTC', 'ETH', 'SOL', 'USDT']).map((curr) => (
                                            <button
                                                key={curr}
                                                onClick={() => setCurrency(curr.toLowerCase())} // Backend expects lowercase
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${currency.toUpperCase() === curr.toUpperCase() ? 'bg-white text-black border-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-500">
                                        {paymentMethod === 'paystack' ? '* Paystack supports local African bank transfers and cards.' : '* Send payment directly to our secure vault.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6 text-center space-y-4">
                                <div className="p-6 bg-white rounded-2xl shadow-xl">
                                    <QRCodeSVG
                                        value={cryptoDetails.address}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Badge className="bg-green-600">DIRECT P2P</Badge>
                                        <Badge variant="outline" className="text-neutral-400">ORDER #{cryptoDetails.address.slice(0, 6)}</Badge>
                                    </div>
                                    <p className="text-neutral-400 text-sm">Send approx. value (USD)</p>
                                    <p className="text-3xl font-mono font-bold text-white">${cryptoDetails.amount}</p>
                                    <p className="text-neutral-400 text-sm mt-4 uppercase">Target {cryptoDetails.currency} Address:</p>
                                    <div className="bg-black p-4 rounded-xl font-mono text-sm text-blue-400 break-all select-all cursor-pointer border border-neutral-800 hover:border-blue-500 transition-colors">
                                        {cryptoDetails.address}
                                    </div>
                                    <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg text-left">
                                        <p className="text-xs text-blue-400 leading-relaxed font-medium">
                                            ⚠️ After sending, please take a screenshot of your transaction and contact support with your Email and User ID to activate your plan immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    {!cryptoDetails && (
                        <CardFooter className="border-t border-neutral-800 mt-6 pt-6">
                            <Button
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                disabled={isProcessing}
                                onClick={handleCheckout}
                            >
                                {isProcessing ? 'Processing Securely...' : `Pay & Upgrade Now`}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Current Subscription */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-white">Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-blue-500">{currentPlan?.Name}</h2>
                            <Badge className={currentSub?.Status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                                {currentSub?.Status?.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-neutral-400 mt-1">
                            Renews on {currentSub?.EndDate ? new Date(currentSub.EndDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Plans List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Available Plans</h2>
                    <div className="flex items-center gap-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                        <span className={`text-sm px-3 py-1 rounded-md transition-colors ${!annual ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}>Monthly</span>
                        <Switch checked={annual} onCheckedChange={setAnnual} />
                        <span className={`text-sm px-3 py-1 rounded-md transition-colors ${annual ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}>Annual <span className="text-green-500 text-xs ml-1">-20%</span></span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <Card
                            key={plan.ID}
                            className={`bg-neutral-900 border-neutral-800 flex flex-col ${currentSub?.PlanID === plan.ID ? 'ring-2 ring-blue-600' : ''} ${selectedPlanId === plan.ID ? 'border-blue-600 bg-blue-600/5' : ''}`}
                        >
                            <CardHeader>
                                <CardTitle className="text-white text-lg">{plan.Name}</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-white">
                                        ${annual ? (plan.PriceAnnual / 12).toFixed(0) : plan.PriceMonthly}
                                    </span>
                                    <span className="text-neutral-500">/mo</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-2">
                                    {plan.Features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-2 text-sm text-neutral-300">
                                        <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <span>
                                            {plan.DataLimitMB === -1 ? 'Unlimited Data' : `${(plan.DataLimitMB / 1024).toFixed(1)}GB Data`}
                                        </span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={`w-full ${currentSub?.PlanID === plan.ID ? 'bg-neutral-800 text-neutral-400 cursor-default' : 'bg-white text-black hover:bg-neutral-200'}`}
                                    onClick={() => handleInitialUpgrade(plan.ID)}
                                    disabled={currentSub?.PlanID === plan.ID}
                                >
                                    {currentSub?.PlanID === plan.ID ? 'Current Plan' : 'Upgrade'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, CreditCard, CaretRight } from '@phosphor-icons/react';
import { apiClient, Plan, Subscription } from '@/lib/api';

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [annual, setAnnual] = useState(false);

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

    const handleSubscribe = async (planID: string) => {
        if (currentSub?.PlanID === planID) return;
        try {
            await apiClient.subscribe(planID);
            loadData(); // Reload to show updated status
        } catch (error) {
            console.error('Failed to subscribe:', error);
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
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                            Cancel Subscription
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Manage Payment Method
                        </Button>
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
                            className={`bg-neutral-900 border-neutral-800 flex flex-col ${currentSub?.PlanID === plan.ID ? 'ring-2 ring-blue-600' : ''}`}
                        >
                            <CardHeader>
                                <CardTitle className="text-white text-lg">{plan.Name}</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-white">
                                        ${annual ? (plan.PriceAnnual / 12).toFixed(0) : plan.PriceMonthly}
                                    </span>
                                    <span className="text-neutral-500">/mo</span>
                                    {annual && <p className="text-xs text-neutral-500 mt-1">Billed ${plan.PriceAnnual} yearly</p>}
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
                                    <li className="flex items-start gap-2 text-sm text-neutral-300">
                                        <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <span>{plan.ConcurrentConns} Connections</span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={`w-full ${currentSub?.PlanID === plan.ID ? 'bg-neutral-800 text-neutral-400 cursor-default' : 'bg-white text-black hover:bg-neutral-200'}`}
                                    onClick={() => handleSubscribe(plan.ID)}
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

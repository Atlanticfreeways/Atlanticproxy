'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BillingStatus {
    plan: string;
    status: string;
    next_billing_date: string;
    data_used: number;
    data_limit: number;
    deposit_amount: number;
    deposit_status: string;
}

export default function BillingPage() {
    const [status, setStatus] = useState<BillingStatus>({
        plan: 'starter',
        status: 'active',
        next_billing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        data_used: 2.5 * 1024 * 1024 * 1024,
        data_limit: 10 * 1024 * 1024 * 1024,
        deposit_amount: 1.00,
        deposit_status: 'held',
    });

    const handleCancel = async () => {
        if (!confirm('Cancel subscription? Your deposit will be refunded in 5-7 days.')) return;
        alert('Subscription cancelled. Deposit refund processing.');
    };

    const dataUsedGB = (status.data_used / (1024 * 1024 * 1024)).toFixed(2);
    const dataLimitGB = (status.data_limit / (1024 * 1024 * 1024)).toFixed(0);
    const usagePercent = (status.data_used / status.data_limit) * 100;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Billing</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-neutral-400">Plan</div>
                            <div className="text-2xl font-bold text-white capitalize">{status.plan}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-400">Status</div>
                            <div className="text-lg text-green-400 capitalize">{status.status}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-400">Next Billing</div>
                            <div className="text-lg text-white">
                                {new Date(status.next_billing_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Deposit</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-sm text-neutral-400">Amount</div>
                            <div className="text-2xl font-bold text-white">${status.deposit_amount.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-400">Status</div>
                            <div className="text-lg text-yellow-400 capitalize">{status.deposit_status}</div>
                        </div>
                        <p className="text-xs text-neutral-400">
                            Refunded within 5-7 days after cancellation
                        </p>
                    </div>
                </Card>
            </div>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data Usage</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Used this week</span>
                        <span className="text-white">{dataUsedGB} GB / {dataLimitGB} GB</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div
                            className="bg-sky-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                </div>
            </Card>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Manage Subscription</h3>
                <div className="space-y-4">
                    <p className="text-sm text-neutral-400">
                        Your subscription auto-renews at $6.99/week. Cancel anytime to stop future charges.
                    </p>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                        Cancel Subscription
                    </Button>
                </div>
            </Card>
        </div>
    );
}

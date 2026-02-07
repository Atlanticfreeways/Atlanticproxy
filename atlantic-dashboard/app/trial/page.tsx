'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrialPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8082/api/billing/trial/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            }
        } catch (error) {
            console.error('Failed to start trial:', error);
            alert('Failed to start trial. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Start Your Trial</h1>
                    <p className="text-neutral-400">Premium residential proxies with town-level targeting</p>
                </div>

                <Card className="bg-neutral-800 border-neutral-700 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">✅</div>
                            <div>
                                <div className="text-white font-medium">10GB/week</div>
                                <div className="text-xs text-neutral-400">Premium residential IPs</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">🌍</div>
                            <div>
                                <div className="text-white font-medium">Town-level targeting</div>
                                <div className="text-xs text-neutral-400">195 countries, 500+ cities</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">🛡️</div>
                            <div>
                                <div className="text-white font-medium">VPN-grade security</div>
                                <div className="text-xs text-neutral-400">Kill switch + leak protection</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="bg-neutral-800 border-neutral-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Email Address</h3>
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-neutral-900 border-neutral-700 text-white"
                        />
                    </Card>

                    <Card className="bg-sky-500/10 border-sky-500/50 p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Charges Today</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-neutral-300">
                                <span>Refundable Deposit</span>
                                <span>₦1,635 ($1.00)</span>
                            </div>
                            <div className="flex justify-between text-white font-medium">
                                <span>First Week (10GB)</span>
                                <span>₦11,445 ($6.99)</span>
                            </div>
                            <div className="border-t border-neutral-600 pt-2 mt-2 flex justify-between text-lg font-bold text-white">
                                <span>Total Today</span>
                                <span>₦13,080 ($7.99)</span>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-4">
                            Auto-renews at ₦11,445/week. Cancel anytime. Deposit refunded in 5-7 days after cancellation.
                        </p>
                    </Card>

                    <Button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3"
                    >
                        {loading ? 'Processing...' : 'Continue to Payment - ₦13,080'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

# Trial Deposit & Weekly Billing Implementation

**Time:** 4-5 hours | **Priority:** HIGH  
**Status:** Backend + Frontend + Payment Integration

---

## Overview

**Starter Plan Flow:**
1. User signs up → $1 deposit required
2. Instant charge: $6.99 for first week
3. Auto-renewal: $6.99 every 7 days
4. Cancel anytime → $1 deposit refunded in 5-7 days

---

## Backend Implementation (2 hours)

### Task 1: Add Billing Endpoints
**File:** `scripts/proxy-client/internal/api/server.go`

```go
router.POST("/api/billing/trial/start", s.handleStartTrial)
router.POST("/api/billing/subscription/cancel", s.handleCancelSubscription)
router.GET("/api/billing/status", s.handleGetBillingStatus)
```

### Task 2: Create Billing Handler
**File:** `scripts/proxy-client/internal/api/billing.go` (new)

```go
package api

import (
    "net/http"
    "time"
    "github.com/gin-gonic/gin"
)

type TrialRequest struct {
    PaymentMethodID string `json:"payment_method_id"`
}

type BillingStatus struct {
    Plan            string    `json:"plan"`
    Status          string    `json:"status"`
    NextBillingDate time.Time `json:"next_billing_date"`
    DataUsed        int64     `json:"data_used"`
    DataLimit       int64     `json:"data_limit"`
    DepositAmount   float64   `json:"deposit_amount"`
    DepositStatus   string    `json:"deposit_status"`
}

func (s *Server) handleStartTrial(c *gin.Context) {
    var req TrialRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 1. Charge $1 deposit (hold)
    depositCharge := chargeDeposit(req.PaymentMethodID, 1.00)
    if !depositCharge.Success {
        c.JSON(http.StatusPaymentRequired, gin.H{"error": "Deposit failed"})
        return
    }

    // 2. Charge $6.99 for first week
    weeklyCharge := chargeWeekly(req.PaymentMethodID, 6.99)
    if !weeklyCharge.Success {
        refundDeposit(depositCharge.ID)
        c.JSON(http.StatusPaymentRequired, gin.H{"error": "Weekly charge failed"})
        return
    }

    // 3. Create subscription
    subscription := createSubscription(req.PaymentMethodID, "weekly", 6.99)

    c.JSON(http.StatusOK, gin.H{
        "message": "Trial started",
        "plan": "starter",
        "next_billing_date": time.Now().Add(7 * 24 * time.Hour),
        "deposit_id": depositCharge.ID,
    })
}

func (s *Server) handleCancelSubscription(c *gin.Context) {
    // 1. Cancel recurring subscription
    cancelSubscription(c.GetString("user_id"))

    // 2. Schedule deposit refund (5-7 days)
    scheduleDepositRefund(c.GetString("user_id"), 7)

    c.JSON(http.StatusOK, gin.H{
        "message": "Subscription cancelled",
        "deposit_refund": "Processing (5-7 days)",
    })
}

func (s *Server) handleGetBillingStatus(c *gin.Context) {
    status := BillingStatus{
        Plan:            "starter",
        Status:          "active",
        NextBillingDate: time.Now().Add(7 * 24 * time.Hour),
        DataUsed:        2.5 * 1024 * 1024 * 1024,
        DataLimit:       10 * 1024 * 1024 * 1024,
        DepositAmount:   1.00,
        DepositStatus:   "held",
    }

    c.JSON(http.StatusOK, status)
}

// Payment processing functions (integrate with Stripe)
func chargeDeposit(paymentMethodID string, amount float64) ChargeResult {
    // Stripe: Create payment intent with capture_method=manual
    return ChargeResult{Success: true, ID: "dep_123"}
}

func chargeWeekly(paymentMethodID string, amount float64) ChargeResult {
    // Stripe: Create payment intent and capture immediately
    return ChargeResult{Success: true, ID: "ch_456"}
}

func createSubscription(paymentMethodID string, interval string, amount float64) string {
    // Stripe: Create subscription with 7-day interval
    return "sub_789"
}

func cancelSubscription(userID string) bool {
    // Stripe: Cancel subscription
    return true
}

func refundDeposit(chargeID string) bool {
    // Stripe: Refund deposit
    return true
}

func scheduleDepositRefund(userID string, days int) {
    // Schedule refund job
}

type ChargeResult struct {
    Success bool
    ID      string
}
```

---

## Frontend Implementation (2 hours)

### Task 3: Create Trial Signup Page
**File:** `atlantic-dashboard/app/trial/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function TrialSignupForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            const { paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (!paymentMethod) throw new Error('Payment method creation failed');

            const response = await fetch('/api/billing/trial/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method_id: paymentMethod.id }),
            });

            if (!response.ok) throw new Error('Trial start failed');

            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#fff',
                                '::placeholder': { color: '#6b7280' },
                            },
                        },
                    }}
                />
            </Card>

            <Card className="bg-sky-500/10 border-sky-500/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Charges Today</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-300">
                        <span>Refundable Deposit</span>
                        <span>$1.00</span>
                    </div>
                    <div className="flex justify-between text-white font-medium">
                        <span>First Week (10GB)</span>
                        <span>$6.99</span>
                    </div>
                    <div className="border-t border-neutral-600 pt-2 mt-2 flex justify-between text-lg font-bold text-white">
                        <span>Total Today</span>
                        <span>$7.99</span>
                    </div>
                </div>
                <p className="text-xs text-neutral-400 mt-4">
                    Auto-renews at $6.99/week. Cancel anytime. Deposit refunded in 5-7 days after cancellation.
                </p>
            </Card>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-sky-500 hover:bg-sky-600"
            >
                {loading ? 'Processing...' : 'Start Trial - $7.99'}
            </Button>
        </form>
    );
}

export default function TrialPage() {
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

                <Elements stripe={stripePromise}>
                    <TrialSignupForm />
                </Elements>
            </div>
        </div>
    );
}
```

### Task 4: Update Billing Page
**File:** `atlantic-dashboard/app/dashboard/billing/page.tsx`

```typescript
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
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBillingStatus();
    }, []);

    const loadBillingStatus = async () => {
        try {
            const response = await fetch('/api/billing/status');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to load billing status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Cancel subscription? Your deposit will be refunded in 5-7 days.')) return;

        try {
            await fetch('/api/billing/subscription/cancel', { method: 'POST' });
            await loadBillingStatus();
        } catch (error) {
            console.error('Failed to cancel:', error);
        }
    };

    if (loading || !status) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

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
```

---

## Payment Integration (1 hour)

### Stripe Setup

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Environment Variables:**
```env
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Stripe Configuration:**
1. Create product: "Starter Plan"
2. Create price: $6.99/week recurring
3. Enable payment methods: Card
4. Configure webhooks for subscription events

---

## Testing Checklist

- [ ] Test $1 deposit charge
- [ ] Test $6.99 first week charge
- [ ] Test subscription creation
- [ ] Test auto-renewal after 7 days
- [ ] Test cancellation flow
- [ ] Test deposit refund scheduling
- [ ] Test data usage tracking
- [ ] Test billing status display
- [ ] Test payment failure handling
- [ ] Test webhook processing

---

**Total Time:** 4-5 hours  
**Priority:** HIGH (required for Starter plan launch)

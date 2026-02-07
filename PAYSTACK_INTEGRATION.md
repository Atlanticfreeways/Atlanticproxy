# Paystack Integration - Trial Deposit & Weekly Billing

**Payment Provider:** Paystack (Nigerian market)  
**Time:** 3-4 hours | **Priority:** HIGH

---

## Overview

Paystack integration for:
- $1 refundable deposit (₦1,635)
- $6.99 weekly charge (₦11,445)
- Auto-renewal subscriptions
- Deposit refund on cancellation

**Exchange Rate:** $1 = ₦1,635 (as of Jan 2026)

---

## Backend Implementation

### Task 1: Environment Variables
**File:** `scripts/proxy-client/.env`

```env
PAYSTACK_SECRET_KEY=sk_test_dac14730d4acd736b4a70ebfb24cdeeded8e22d0
PAYSTACK_PUBLIC_KEY=pk_test_85582a966b679345c0340c13ba909b040a328d97
```

### Task 2: Paystack Client
**File:** `scripts/proxy-client/internal/payment/paystack.go` (new)

```go
package payment

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type PaystackClient struct {
    secretKey string
    baseURL   string
}

func NewPaystackClient() *PaystackClient {
    return &PaystackClient{
        secretKey: os.Getenv("PAYSTACK_SECRET_KEY"),
        baseURL:   "https://api.paystack.co",
    }
}

type ChargeRequest struct {
    Email     string `json:"email"`
    Amount    int    `json:"amount"` // in kobo (₦1 = 100 kobo)
    Reference string `json:"reference"`
}

type ChargeResponse struct {
    Status  bool   `json:"status"`
    Message string `json:"message"`
    Data    struct {
        Reference      string `json:"reference"`
        Status         string `json:"status"`
        AuthorizationURL string `json:"authorization_url"`
    } `json:"data"`
}

func (p *PaystackClient) InitializeTransaction(email string, amount int, reference string) (*ChargeResponse, error) {
    req := ChargeRequest{
        Email:     email,
        Amount:    amount,
        Reference: reference,
    }

    body, _ := json.Marshal(req)
    httpReq, _ := http.NewRequest("POST", p.baseURL+"/transaction/initialize", bytes.NewBuffer(body))
    httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result ChargeResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}

type SubscriptionRequest struct {
    Customer      string `json:"customer"`
    Plan          string `json:"plan"`
    Authorization string `json:"authorization"`
}

func (p *PaystackClient) CreateSubscription(customer, plan, authorization string) error {
    req := SubscriptionRequest{
        Customer:      customer,
        Plan:          plan,
        Authorization: authorization,
    }

    body, _ := json.Marshal(req)
    httpReq, _ := http.NewRequest("POST", p.baseURL+"/subscription", bytes.NewBuffer(body))
    httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    return nil
}

func (p *PaystackClient) CancelSubscription(code string) error {
    httpReq, _ := http.NewRequest("POST", p.baseURL+"/subscription/disable", nil)
    httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
    
    q := httpReq.URL.Query()
    q.Add("code", code)
    httpReq.URL.RawQuery = q.Encode()

    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    return nil
}

func (p *PaystackClient) RefundTransaction(reference string) error {
    body := map[string]string{"transaction": reference}
    jsonBody, _ := json.Marshal(body)
    
    httpReq, _ := http.NewRequest("POST", p.baseURL+"/refund", bytes.NewBuffer(jsonBody))
    httpReq.Header.Set("Authorization", "Bearer "+p.secretKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(httpReq)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    return nil
}
```

### Task 3: Update Billing Handler
**File:** `scripts/proxy-client/internal/api/billing.go`

```go
import (
    "github.com/atlanticproxy/proxy-client/internal/payment"
)

var paystackClient = payment.NewPaystackClient()

func (s *Server) handleStartTrial(c *gin.Context) {
    var req struct {
        Email string `json:"email" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 1. Initialize deposit transaction (₦1,635 = $1)
    depositRef := fmt.Sprintf("DEP-%d", time.Now().Unix())
    depositResp, err := paystackClient.InitializeTransaction(req.Email, 163500, depositRef)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Deposit initialization failed"})
        return
    }

    // 2. Initialize weekly charge (₦11,445 = $6.99)
    weeklyRef := fmt.Sprintf("WEEK-%d", time.Now().Unix())
    weeklyResp, err := paystackClient.InitializeTransaction(req.Email, 1144500, weeklyRef)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Weekly charge initialization failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "deposit_url": depositResp.Data.AuthorizationURL,
        "weekly_url":  weeklyResp.Data.AuthorizationURL,
        "deposit_ref": depositRef,
        "weekly_ref":  weeklyRef,
    })
}

func (s *Server) handleCancelSubscription(c *gin.Context) {
    subscriptionCode := c.Query("code")
    
    // Cancel subscription
    err := paystackClient.CancelSubscription(subscriptionCode)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Schedule deposit refund
    depositRef := c.Query("deposit_ref")
    go func() {
        time.Sleep(7 * 24 * time.Hour) // Wait 7 days
        paystackClient.RefundTransaction(depositRef)
    }()

    c.JSON(http.StatusOK, gin.H{
        "message": "Subscription cancelled",
        "deposit_refund": "Processing (5-7 days)",
    })
}
```

---

## Frontend Implementation

### Task 4: Update Trial Page
**File:** `atlantic-dashboard/app/trial/page.tsx`

```typescript
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
            const response = await fetch('/api/billing/trial/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            // Redirect to Paystack payment page
            window.location.href = data.deposit_url;
        } catch (error) {
            console.error('Failed to start trial:', error);
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
```

### Task 5: Payment Callback Page
**File:** `atlantic-dashboard/app/payment/callback/page.tsx` (new)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

    useEffect(() => {
        const reference = searchParams.get('reference');
        
        if (reference) {
            // Verify payment with backend
            fetch(`/api/billing/verify?reference=${reference}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setStatus('success');
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                    } else {
                        setStatus('failed');
                    }
                });
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <Card className="bg-neutral-800 border-neutral-700 p-8 text-center max-w-md">
                {status === 'loading' && (
                    <>
                        <div className="text-6xl mb-4">⏳</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
                        <p className="text-neutral-400">Please wait...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-neutral-400">Redirecting to dashboard...</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                        <p className="text-neutral-400">Please try again.</p>
                    </>
                )}
            </Card>
        </div>
    );
}
```

---

## Webhook Handler

### Task 6: Paystack Webhook
**File:** `scripts/proxy-client/internal/api/webhooks.go`

```go
func (s *Server) handlePaystackWebhook(c *gin.Context) {
    var event struct {
        Event string `json:"event"`
        Data  struct {
            Reference string `json:"reference"`
            Status    string `json:"status"`
            Amount    int    `json:"amount"`
            Customer  struct {
                Email string `json:"email"`
            } `json:"customer"`
        } `json:"data"`
    }

    if err := c.ShouldBindJSON(&event); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
        return
    }

    switch event.Event {
    case "charge.success":
        // Handle successful payment
        s.logger.Infof("Payment successful: %s", event.Data.Reference)
        
        // Update user subscription status
        // Store transaction in database
        
    case "subscription.create":
        // Handle subscription creation
        s.logger.Infof("Subscription created for: %s", event.Data.Customer.Email)
        
    case "subscription.disable":
        // Handle subscription cancellation
        s.logger.Infof("Subscription cancelled")
    }

    c.JSON(http.StatusOK, gin.H{"status": "success"})
}
```

---

## Testing

### Test Flow
1. Visit `/trial` page
2. Enter email address
3. Click "Continue to Payment"
4. Redirected to Paystack payment page
5. Complete payment with test card:
   - Card: 4084084084084081
   - Expiry: Any future date
   - CVV: 408
6. Redirected to `/payment/callback`
7. Verification completes
8. Redirected to `/dashboard`

---

## Pricing (Nigerian Market)

| Plan | USD | NGN (₦) |
|------|-----|---------|
| Deposit | $1.00 | ₦1,635 |
| Weekly | $6.99 | ₦11,445 |
| Total First Week | $7.99 | ₦13,080 |

**Exchange Rate:** $1 = ₦1,635

---

## Implementation Checklist

- [ ] Create Paystack client
- [ ] Update trial start handler
- [ ] Update cancellation handler
- [ ] Create payment callback page
- [ ] Update trial page with Paystack flow
- [ ] Test deposit payment
- [ ] Test weekly payment
- [ ] Test subscription creation
- [ ] Test cancellation
- [ ] Test deposit refund

---

**Time Estimate:** 3-4 hours  
**Status:** Ready to implement

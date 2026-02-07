# Pay-As-You-Go Credits System Implementation

**Time:** 1 week | **Priority:** HIGH

---

## 🎯 Objective

Implement unified credit-based system where users buy credits that unlock time-based access to premium features (city, state, ISP selection).

---

## 📊 Credit Packages

```
$5   → 5 credits   → ~6 hours
$10  → 10 credits  → ~12 hours
$25  → 25 credits  → ~30 hours
$50  → 50 credits  → ~60 hours
$100 → 100 credits → ~120 hours
```

**Consumption Rate:**
- Base (Country only): $0.50/hour (0.5 credits/hr)
- + City: $0.75/hour (0.75 credits/hr)
- + State: $0.85/hour (0.85 credits/hr)
- + ISP: $1.00/hour (1 credit/hr)

---

## 🗄️ Backend Tasks (3 days)

### Task 1: Database Schema
**File:** `scripts/proxy-client/migrations/006_credits_system.sql`

```sql
-- Credits wallet
CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(10,2) DEFAULT 0,
    total_purchased DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20), -- 'purchase', 'usage', 'refund'
    amount DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Active sessions with feature tracking
CREATE TABLE proxy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    features_used JSONB, -- {city: true, state: false, isp: false}
    credits_per_hour DECIMAL(10,2),
    total_credits_used DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE INDEX idx_credits_user ON user_credits(user_id);
CREATE INDEX idx_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_sessions_user_status ON proxy_sessions(user_id, status);
```

### Task 2: Credits Manager
**File:** `scripts/proxy-client/internal/billing/credits.go`

```go
package billing

import (
    "time"
    "errors"
)

type CreditsManager struct {
    db *sql.DB
}

type CreditPackage struct {
    Amount float64 `json:"amount"`
    Price  float64 `json:"price"`
    Bonus  float64 `json:"bonus"` // Extra credits
}

var Packages = []CreditPackage{
    {Amount: 5, Price: 5.00, Bonus: 0},
    {Amount: 10, Price: 10.00, Bonus: 0},
    {Amount: 25, Price: 25.00, Bonus: 2}, // +2 bonus
    {Amount: 50, Price: 50.00, Bonus: 5}, // +5 bonus
    {Amount: 100, Price: 100.00, Bonus: 15}, // +15 bonus
}

type FeatureSet struct {
    Country bool `json:"country"`
    City    bool `json:"city"`
    State   bool `json:"state"`
    ISP     bool `json:"isp"`
}

func (f FeatureSet) GetHourlyRate() float64 {
    rate := 0.50 // Base rate
    if f.City { rate = 0.75 }
    if f.State { rate = 0.85 }
    if f.ISP { rate = 1.00 }
    return rate
}

func (m *CreditsManager) GetBalance(userID string) (float64, error) {
    var balance float64
    err := m.db.QueryRow(
        "SELECT balance FROM user_credits WHERE user_id = $1",
        userID,
    ).Scan(&balance)
    return balance, err
}

func (m *CreditsManager) AddCredits(userID string, amount float64, description string) error {
    tx, _ := m.db.Begin()
    defer tx.Rollback()
    
    // Update balance
    _, err := tx.Exec(`
        INSERT INTO user_credits (user_id, balance, total_purchased)
        VALUES ($1, $2, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET balance = user_credits.balance + $2,
            total_purchased = user_credits.total_purchased + $2,
            updated_at = NOW()
    `, userID, amount)
    
    if err != nil { return err }
    
    // Get new balance
    var newBalance float64
    tx.QueryRow("SELECT balance FROM user_credits WHERE user_id = $1", userID).Scan(&newBalance)
    
    // Record transaction
    _, err = tx.Exec(`
        INSERT INTO credit_transactions (user_id, type, amount, balance_after, description)
        VALUES ($1, 'purchase', $2, $3, $4)
    `, userID, amount, newBalance, description)
    
    return tx.Commit()
}

func (m *CreditsManager) StartSession(userID string, features FeatureSet) (string, error) {
    balance, _ := m.GetBalance(userID)
    hourlyRate := features.GetHourlyRate()
    
    // Check minimum balance (1 hour)
    if balance < hourlyRate {
        return "", errors.New("insufficient credits")
    }
    
    var sessionID string
    err := m.db.QueryRow(`
        INSERT INTO proxy_sessions (user_id, features_used, credits_per_hour)
        VALUES ($1, $2, $3)
        RETURNING id
    `, userID, features, hourlyRate).Scan(&sessionID)
    
    return sessionID, err
}

func (m *CreditsManager) DeductCredits(sessionID string) error {
    // Called every minute by background worker
    tx, _ := m.db.Begin()
    defer tx.Rollback()
    
    var userID string
    var creditsPerHour float64
    var startedAt time.Time
    
    tx.QueryRow(`
        SELECT user_id, credits_per_hour, started_at
        FROM proxy_sessions WHERE id = $1 AND status = 'active'
    `, sessionID).Scan(&userID, &creditsPerHour, &startedAt)
    
    // Calculate credits for 1 minute
    minuteRate := creditsPerHour / 60.0
    
    // Deduct from balance
    _, err := tx.Exec(`
        UPDATE user_credits
        SET balance = balance - $1,
            total_spent = total_spent + $1
        WHERE user_id = $2 AND balance >= $1
    `, minuteRate, userID)
    
    if err != nil {
        // Insufficient balance - end session
        tx.Exec("UPDATE proxy_sessions SET status = 'ended', ended_at = NOW() WHERE id = $1", sessionID)
        return errors.New("session ended: insufficient credits")
    }
    
    // Update session
    tx.Exec(`
        UPDATE proxy_sessions
        SET total_credits_used = total_credits_used + $1
        WHERE id = $2
    `, minuteRate, sessionID)
    
    return tx.Commit()
}
```

### Task 3: API Endpoints
**File:** `scripts/proxy-client/internal/api/credits.go`

```go
package api

func (s *Server) setupCreditRoutes() {
    s.router.GET("/api/credits/balance", s.handleGetBalance)
    s.router.GET("/api/credits/packages", s.handleGetPackages)
    s.router.POST("/api/credits/purchase", s.handlePurchaseCredits)
    s.router.GET("/api/credits/transactions", s.handleGetTransactions)
    s.router.GET("/api/credits/features", s.handleGetAvailableFeatures)
}

func (s *Server) handleGetBalance(c *gin.Context) {
    userID := c.GetString("user_id")
    balance, _ := s.creditsManager.GetBalance(userID)
    
    c.JSON(200, gin.H{
        "balance": balance,
        "hours_remaining": map[string]float64{
            "country_only": balance / 0.50,
            "with_city": balance / 0.75,
            "with_state": balance / 0.85,
            "with_isp": balance / 1.00,
        },
    })
}

func (s *Server) handleGetPackages(c *gin.Context) {
    c.JSON(200, gin.H{"packages": billing.Packages})
}

func (s *Server) handlePurchaseCredits(c *gin.Context) {
    var req struct {
        Amount float64 `json:"amount"`
        Method string  `json:"method"` // paystack, crypto
    }
    c.BindJSON(&req)
    
    userID := c.GetString("user_id")
    
    // Find package
    var pkg billing.CreditPackage
    for _, p := range billing.Packages {
        if p.Amount == req.Amount {
            pkg = p
            break
        }
    }
    
    // Process payment (Paystack/Crypto)
    paymentID, err := s.billingManager.ProcessPayment(userID, pkg.Price, req.Method)
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Add credits (amount + bonus)
    totalCredits := pkg.Amount + pkg.Bonus
    s.creditsManager.AddCredits(userID, totalCredits, "Purchase: $"+fmt.Sprintf("%.2f", pkg.Price))
    
    c.JSON(200, gin.H{
        "payment_id": paymentID,
        "credits_added": totalCredits,
        "new_balance": s.creditsManager.GetBalance(userID),
    })
}

func (s *Server) handleGetAvailableFeatures(c *gin.Context) {
    userID := c.GetString("user_id")
    balance, _ := s.creditsManager.GetBalance(userID)
    
    c.JSON(200, gin.H{
        "can_use_city": balance >= 0.75,
        "can_use_state": balance >= 0.85,
        "can_use_isp": balance >= 1.00,
        "balance": balance,
    })
}
```

---

## 🎨 Frontend Tasks (2 days)

### Task 4: Credits Display Component
**File:** `atlantic-dashboard/components/CreditsBalance.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CreditsBalance() {
    const [balance, setBalance] = useState(0);
    const [hoursRemaining, setHoursRemaining] = useState({});

    useEffect(() => {
        loadBalance();
    }, []);

    const loadBalance = async () => {
        const data = await apiClient.getCreditsBalance();
        setBalance(data.balance);
        setHoursRemaining(data.hours_remaining);
    };

    return (
        <Card className="bg-neutral-800 border-neutral-700 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-neutral-400">Credits Balance</div>
                    <div className="text-3xl font-bold text-white">${balance.toFixed(2)}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                        ~{hoursRemaining.with_city?.toFixed(1)} hours with city selection
                    </div>
                </div>
                <Button onClick={() => window.location.href = '/dashboard/credits'}>
                    Add Credits
                </Button>
            </div>
        </Card>
    );
}
```

### Task 5: Credits Purchase Page
**File:** `atlantic-dashboard/app/dashboard/credits/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const packages = [
    { amount: 5, price: 5, hours: '~6 hours', popular: false },
    { amount: 10, price: 10, hours: '~12 hours', popular: false },
    { amount: 25, price: 25, hours: '~30 hours', bonus: 2, popular: true },
    { amount: 50, price: 50, hours: '~60 hours', bonus: 5, popular: false },
    { amount: 100, price: 100, hours: '~120 hours', bonus: 15, popular: false },
];

export default function CreditsPage() {
    const [purchasing, setPurchasing] = useState(false);

    const handlePurchase = async (amount: number) => {
        setPurchasing(true);
        try {
            await apiClient.purchaseCredits(amount, 'paystack');
            alert('Credits added successfully!');
        } catch (error) {
            alert('Purchase failed');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Buy Credits</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map(pkg => (
                    <Card key={pkg.amount} className={`p-6 ${pkg.popular ? 'border-sky-500' : 'border-neutral-700'}`}>
                        {pkg.popular && (
                            <div className="text-sky-500 text-sm font-semibold mb-2">MOST POPULAR</div>
                        )}
                        <div className="text-4xl font-bold text-white mb-2">${pkg.price}</div>
                        <div className="text-neutral-400 mb-4">
                            {pkg.amount} credits
                            {pkg.bonus && <span className="text-green-500"> +{pkg.bonus} bonus</span>}
                        </div>
                        <div className="text-sm text-neutral-500 mb-4">{pkg.hours}</div>
                        <Button
                            onClick={() => handlePurchase(pkg.amount)}
                            disabled={purchasing}
                            className="w-full"
                        >
                            Purchase
                        </Button>
                    </Card>
                ))}
            </div>

            <Card className="bg-neutral-800 border-neutral-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Feature Costs</h2>
                <div className="space-y-2 text-neutral-300">
                    <div className="flex justify-between">
                        <span>Country selection</span>
                        <span className="text-white">$0.50/hour</span>
                    </div>
                    <div className="flex justify-between">
                        <span>+ City selection</span>
                        <span className="text-white">$0.75/hour</span>
                    </div>
                    <div className="flex justify-between">
                        <span>+ State selection</span>
                        <span className="text-white">$0.85/hour</span>
                    </div>
                    <div className="flex justify-between">
                        <span>+ ISP selection</span>
                        <span className="text-white">$1.00/hour</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
```

### Task 6: Feature Gating in Locations
**File:** Update `atlantic-dashboard/app/dashboard/locations/page.tsx`

```typescript
const [features, setFeatures] = useState(null);

useEffect(() => {
    const data = await apiClient.getAvailableFeatures();
    setFeatures(data);
}, []);

// City selector
{features?.can_use_city ? (
    <Select onChange={(e) => setCity(e.target.value)}>
        <option>New York</option>
        <option>Los Angeles</option>
    </Select>
) : (
    <div className="text-neutral-500 text-sm">
        🔒 City selection requires $0.75/hour
        <Button size="sm" onClick={() => router.push('/dashboard/credits')}>
            Add Credits
        </Button>
    </div>
)}

// ISP selector
{features?.can_use_isp ? (
    <Select onChange={(e) => setISP(e.target.value)}>
        <option>Verizon</option>
        <option>AT&T</option>
    </Select>
) : (
    <div className="text-neutral-500 text-sm">
        🔒 ISP selection requires $1.00/hour (${features?.balance} available)
    </div>
)}
```

---

## ⚙️ Background Worker (1 day)

### Task 7: Credit Deduction Worker
**File:** `scripts/proxy-client/internal/workers/credits_worker.go`

```go
package workers

func StartCreditsWorker(manager *billing.CreditsManager) {
    ticker := time.NewTicker(1 * time.Minute)
    
    for range ticker.C {
        // Get all active sessions
        sessions := manager.GetActiveSessions()
        
        for _, session := range sessions {
            err := manager.DeductCredits(session.ID)
            if err != nil {
                // Session ended due to insufficient credits
                log.Printf("Session %s ended: %v", session.ID, err)
            }
        }
    }
}
```

---

## ✅ Testing (1 day)

### Test Cases:
```bash
# 1. Purchase credits
curl -X POST http://localhost:8082/api/credits/purchase \
  -d '{"amount": 25, "method": "paystack"}'

# 2. Check balance
curl http://localhost:8082/api/credits/balance

# 3. Start session with city
curl -X POST http://localhost:8082/api/proxy/connect \
  -d '{"country": "us", "city": "new_york"}'

# 4. Verify deduction after 1 minute
curl http://localhost:8082/api/credits/balance
# Should show balance reduced by 0.0125 (0.75/60)

# 5. Test insufficient credits
# Set balance to $0.50, try to use ISP ($1/hr)
# Should fail with "insufficient credits"
```

---

## 📊 Summary

**Implementation:**
- Backend: 3 days (DB + Credits manager + APIs)
- Frontend: 2 days (UI + Feature gating)
- Worker: 1 day (Background deduction)
- Testing: 1 day

**Total: 1 week**

**Features:**
- Unified credit system
- Time-based consumption
- Feature-based pricing
- Real-time deduction
- Bonus credits for larger purchases

**User Flow:**
1. Buy credits ($5-100)
2. Credits unlock features based on usage
3. $0.50-1.00/hour depending on features
4. Auto-deduct every minute
5. Session ends when credits run out

**Ready to implement?**

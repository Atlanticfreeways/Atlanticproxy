# PAYG Credits - Optimized Implementation

**Time:** 3 days | **Priority:** HIGH

---

## 💰 Simplified Pricing

```
$10  → 10 credits → ~12 hours (all features)
$25  → 27 credits → ~32 hours (+2 bonus)
$50  → 57 credits → ~68 hours (+7 bonus)
```

**Rate:** $0.80/hour (flat rate, all features included)

---

## 🗄️ Backend (1 day)

### Schema
```sql
CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY,
    balance DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY,
    user_id UUID,
    amount DECIMAL(10,2),
    type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Manager
```go
// scripts/proxy-client/internal/billing/credits.go
type CreditsManager struct { db *sql.DB }

func (m *CreditsManager) GetBalance(userID string) float64
func (m *CreditsManager) AddCredits(userID string, amount float64) error
func (m *CreditsManager) DeductPerMinute(userID string) error // Deducts $0.0133 (0.80/60)
```

### API
```go
// scripts/proxy-client/internal/api/credits.go
GET  /api/credits/balance
POST /api/credits/purchase  // Body: {amount: 10, method: "paystack"}
GET  /api/credits/packages  // Returns: [{amount: 10, price: 10}, ...]
```

---

## 🎨 Frontend (1 day)

### Balance Widget
```typescript
// atlantic-dashboard/components/CreditsWidget.tsx
<div>
  <div>Balance: ${balance}</div>
  <div>~{(balance / 0.80).toFixed(1)} hours</div>
  <Button>Add Credits</Button>
</div>
```

### Purchase Page
```typescript
// atlantic-dashboard/app/dashboard/credits/page.tsx
const packages = [
  {amount: 10, price: 10, hours: 12},
  {amount: 25, price: 25, hours: 32, bonus: 2},
  {amount: 50, price: 50, hours: 68, bonus: 7}
];

<Button onClick={() => purchase(pkg.amount)}>
  Buy ${pkg.price}
</Button>
```

### Feature Gate
```typescript
// In locations page
const balance = await apiClient.getBalance();
const canUse = balance >= 0.80; // Need 1 hour minimum

{canUse ? (
  <Select>Cities...</Select>
) : (
  <div>Need $0.80 to use <Button>Add Credits</Button></div>
)}
```

---

## ⚙️ Worker (1 day)

### Deduction Worker
```go
// scripts/proxy-client/cmd/service/main.go
go func() {
    ticker := time.NewTicker(1 * time.Minute)
    for range ticker.C {
        activeSessions := getActiveSessions()
        for _, session := range activeSessions {
            creditsManager.DeductPerMinute(session.UserID)
        }
    }
}()
```

---

## ✅ Implementation Steps

### Day 1: Backend
1. Add schema (10 min)
2. Create CreditsManager (30 min)
3. Add API endpoints (30 min)
4. Test with curl (20 min)

### Day 2: Frontend
1. Create CreditsWidget (30 min)
2. Create purchase page (1 hour)
3. Add feature gating (30 min)
4. Test UI flow (30 min)

### Day 3: Integration
1. Add deduction worker (1 hour)
2. Payment integration (2 hours)
3. E2E testing (1 hour)

---

## 🎯 Simplified Flow

```
1. User buys $10 → Gets 10 credits
2. User connects → Deducts $0.0133/min ($0.80/hr)
3. After 12 hours → Balance = $0
4. Session auto-ends
```

**All features included (country, city, state, ISP) - no tiering needed**

---

## 📊 Files to Create/Modify

**Create (5 files):**
- `migrations/006_credits.sql`
- `internal/billing/credits.go`
- `internal/api/credits.go`
- `app/dashboard/credits/page.tsx`
- `components/CreditsWidget.tsx`

**Modify (2 files):**
- `cmd/service/main.go` (add worker)
- `app/dashboard/locations/page.tsx` (add gate)

**Total: 7 files**

---

## 🚀 Quick Start

```bash
# Backend
cd scripts/proxy-client
psql < migrations/006_credits.sql
go run ./cmd/service

# Frontend
cd atlantic-dashboard
npm run dev

# Test
curl -X POST localhost:8082/api/credits/purchase -d '{"amount":10}'
```

**Ready to implement in 3 days?**

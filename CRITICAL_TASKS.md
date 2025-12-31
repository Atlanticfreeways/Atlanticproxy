# 🔴 CRITICAL TASKS - V1.0 BLOCKERS

**Created:** December 31, 2025  
**Priority:** HIGHEST  
**Timeline:** 6-8 weeks to production  
**Status:** 0/35 tasks complete

---

## 📊 OVERVIEW

These are the **blocking tasks** that must be completed before V1.0 launch. Everything else is polish or nice-to-have.

**Current Completion:** 65-70%  
**After Critical Tasks:** 90%+ (Production Ready)

---

## 🎯 WEEK 1: TESTING & VALIDATION (15 TASKS)

### Task 1: Rotation End-to-End Testing
**Priority:** 🔴 CRITICAL  
**Time:** 3-4 days  
**Status:** ❌ Not Started

**Context:**
- Rotation code is fully integrated in `internal/proxy/engine.go`
- Oxylabs client passes session IDs in `pkg/oxylabs/client.go`
- Dashboard UI exists in `atlantic-dashboard/app/dashboard/rotation/page.tsx`
- **Need to validate it actually works**

**Tasks:**
- [ ] 1.1 Test per-request rotation (new IP every request)
- [ ] 1.2 Test sticky-1min (same IP for 1 minute)
- [ ] 1.3 Test sticky-10min (same IP for 10 minutes)
- [ ] 1.4 Test sticky-30min (same IP for 30 minutes)
- [ ] 1.5 Test geographic targeting (US, GB, DE)
- [ ] 1.6 Test city targeting (New York, London, Berlin)
- [ ] 1.7 Test state targeting (CA, NY, TX)
- [ ] 1.8 Test session timer countdown in dashboard
- [ ] 1.9 Test "Change IP" button forces new session
- [ ] 1.10 Test rotation analytics tracking
- [ ] 1.11 Test rotation under load (100 concurrent requests)
- [ ] 1.12 Verify session persistence across requests
- [ ] 1.13 Test failover with rotation enabled
- [ ] 1.14 Measure rotation overhead (<50ms target)
- [ ] 1.15 Document any bugs found and fix them

**Test Commands:**
```bash
# Start service
cd scripts/proxy-client
go run ./cmd/service

# Test rotation
curl --proxy http://127.0.0.1:8080 https://httpbin.org/ip
# Should show different IPs on per-request mode

# Test geographic targeting
curl http://localhost:8082/api/rotation/geo -X POST \
  -d '{"country":"US","city":"New York"}'
curl --proxy http://127.0.0.1:8080 https://httpbin.org/ip
# Should show New York IP
```

**Acceptance Criteria:**
- ✅ All 4 rotation modes work correctly
- ✅ Geographic targeting changes IP location
- ✅ Dashboard displays accurate session info
- ✅ Analytics track rotation events
- ✅ Performance overhead <50ms

---

## 🎯 WEEK 1-2: DATABASE & PAYMENT (20 TASKS)

### Task 2: Database Setup & Schema
**Priority:** 🔴 CRITICAL  
**Time:** 2-3 days  
**Status:** ❌ Not Started

**Problem:** All data is in-memory. Restart = data loss.

**Tasks:**
- [ ] 2.1 Choose database (PostgreSQL recommended, SQLite for simplicity)
- [ ] 2.2 Install database locally for development
- [ ] 2.3 Create `schema.sql` with tables:
  - `users` (id, email, password_hash, created_at)
  - `plans` (id, name, price, data_quota, api_quota, features)
  - `subscriptions` (id, user_id, plan_id, status, start_date, end_date)
  - `usage_tracking` (id, user_id, date, data_used, api_calls, manual_rotations)
  - `payment_transactions` (id, user_id, amount, currency, status, gateway, created_at)
  - `sessions` (id, user_id, session_id, ip_address, location, created_at, expires_at)
- [ ] 2.4 Create migration scripts (`migrations/001_initial_schema.sql`)
- [ ] 2.5 Add database connection to `pkg/config/config.go`
- [ ] 2.6 Test database connection on startup

**Files to Create:**
```
scripts/proxy-client/
├── migrations/
│   └── 001_initial_schema.sql
├── pkg/
│   └── database/
│       ├── db.go          # Connection management
│       ├── users.go       # User CRUD
│       ├── subscriptions.go
│       └── usage.go
```

**Example Schema:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    data_quota_gb INT NOT NULL,
    api_quota_daily INT NOT NULL,
    features JSONB
);

CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    plan_id INT REFERENCES plans(id),
    status VARCHAR(20) NOT NULL,
    stripe_subscription_id VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    date DATE NOT NULL,
    data_used_bytes BIGINT DEFAULT 0,
    api_calls INT DEFAULT 0,
    manual_rotations INT DEFAULT 0,
    UNIQUE(user_id, date)
);
```

**Acceptance Criteria:**
- ✅ Database connects on service startup
- ✅ All tables created successfully
- ✅ Can insert/query test data
- ✅ Migration scripts work

---

### Task 3: Billing Manager Database Integration
**Priority:** 🔴 CRITICAL  
**Time:** 2 days  
**Status:** ❌ Not Started

**Problem:** Billing manager exists but uses in-memory storage.

**Files to Modify:**
- `scripts/proxy-client/internal/billing/manager.go`
- `scripts/proxy-client/internal/billing/plans.go`
- `scripts/proxy-client/internal/billing/usage.go`

**Tasks:**
- [ ] 3.1 Update `BillingManager` to use database instead of maps
- [ ] 3.2 Implement `GetSubscription(userID)` from database
- [ ] 3.3 Implement `CreateSubscription(userID, planID)` to database
- [ ] 3.4 Implement `UpdateSubscription(subID, planID)` to database
- [ ] 3.5 Implement `CancelSubscription(subID)` to database
- [ ] 3.6 Update `GetUsage(userID)` to query database
- [ ] 3.7 Implement `IncrementDataUsage(userID, bytes)` to database
- [ ] 3.8 Implement `IncrementAPIUsage(userID)` to database
- [ ] 3.9 Seed database with 4 plans (Starter, Personal, Team, Enterprise)
- [ ] 3.10 Test all billing operations with database

**Acceptance Criteria:**
- ✅ Subscriptions persist across restarts
- ✅ Usage tracking writes to database
- ✅ All billing API endpoints work with database
- ✅ No data loss on service restart

---

### Task 4: Stripe Integration
**Priority:** 🔴 CRITICAL  
**Time:** 3-4 days  
**Status:** ❌ Not Started

**Problem:** Stripe client exists but webhooks not implemented.

**Files to Create/Modify:**
- `scripts/proxy-client/internal/billing/stripe.go` (exists, needs webhooks)
- `scripts/proxy-client/internal/api/webhooks.go` (new)

**Tasks:**
- [ ] 4.1 Set up Stripe account (if not done)
- [ ] 4.2 Get Stripe API keys (test + production)
- [ ] 4.3 Create Stripe products for 4 plans
- [ ] 4.4 Create Stripe prices (monthly/annual)
- [ ] 4.5 Implement checkout session creation
- [ ] 4.6 Create webhook endpoint `/webhooks/stripe`
- [ ] 4.7 Implement webhook signature verification
- [ ] 4.8 Handle `checkout.session.completed` event
- [ ] 4.9 Handle `customer.subscription.created` event
- [ ] 4.10 Handle `customer.subscription.updated` event
- [ ] 4.11 Handle `customer.subscription.deleted` event
- [ ] 4.12 Handle `invoice.payment_succeeded` event
- [ ] 4.13 Handle `invoice.payment_failed` event
- [ ] 4.14 Test webhook with Stripe CLI
- [ ] 4.15 Test full payment flow end-to-end

**Webhook Handler Example:**
```go
// internal/api/webhooks.go
func (s *Server) handleStripeWebhook(w http.ResponseWriter, r *http.Request) {
    payload, _ := ioutil.ReadAll(r.Body)
    event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), webhookSecret)
    
    switch event.Type {
    case "checkout.session.completed":
        // Activate subscription
    case "invoice.payment_succeeded":
        // Extend subscription
    case "customer.subscription.deleted":
        // Cancel subscription
    }
}
```

**Test Commands:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:8082/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

**Acceptance Criteria:**
- ✅ Users can pay via Stripe
- ✅ Webhooks activate subscriptions automatically
- ✅ Payment failures handled gracefully
- ✅ Subscription status syncs with Stripe

---

### Task 5: Quota Enforcement in Proxy
**Priority:** 🔴 CRITICAL  
**Time:** 1-2 days  
**Status:** ❌ Not Started

**Problem:** Quota logic exists but not enforced in proxy flow.

**Files to Modify:**
- `scripts/proxy-client/internal/proxy/engine.go`
- `scripts/proxy-client/internal/api/server.go`

**Tasks:**
- [ ] 5.1 Add quota check before proxy request in `engine.go`
- [ ] 5.2 Track data usage in proxy response
- [ ] 5.3 Call `billingManager.IncrementDataUsage()` after each request
- [ ] 5.4 Return 429 error when quota exceeded
- [ ] 5.5 Add API rate limiting middleware
- [ ] 5.6 Track API calls per endpoint
- [ ] 5.7 Implement quota reset on billing cycle
- [ ] 5.8 Test quota enforcement end-to-end

**Implementation Example:**
```go
// In engine.go, before proxying request
func (e *Engine) handleRequest(w http.ResponseWriter, r *http.Request) {
    userID := getUserFromRequest(r) // From auth token
    
    // Check quota
    if !e.billingManager.CheckDataQuota(userID) {
        http.Error(w, "Data quota exceeded", http.StatusTooManyRequests)
        return
    }
    
    // Proxy request
    resp := e.proxyRequest(r)
    
    // Track usage
    bytesUsed := resp.ContentLength
    e.billingManager.IncrementDataUsage(userID, bytesUsed)
}
```

**Acceptance Criteria:**
- ✅ Requests blocked when quota exceeded
- ✅ Data usage tracked accurately
- ✅ API rate limits enforced
- ✅ Dashboard shows remaining quota

---

## 🎯 ADDITIONAL CRITICAL TASKS (NOT WEEK-SPECIFIC)

### Task 6: Currency Detection System
**Priority:** 🟡 HIGH (Not blocking, but important)  
**Time:** 2-3 days  
**Status:** ❌ Not Started

**Problem:** Only USD pricing shown. Need local currency.

**Tasks:**
- [ ] 6.1 Integrate IP geolocation API (ipapi.co or similar)
- [ ] 6.2 Detect user country from IP
- [ ] 6.3 Map country to currency (US→USD, GB→GBP, EU→EUR)
- [ ] 6.4 Integrate exchange rate API (exchangerate-api.com)
- [ ] 6.5 Convert prices to local currency
- [ ] 6.6 Display prices in local currency on dashboard
- [ ] 6.7 Allow manual currency selection
- [ ] 6.8 Cache exchange rates (update daily)

**Files to Create:**
```
scripts/proxy-client/
├── pkg/
│   └── currency/
│       ├── detector.go    # IP-based detection
│       ├── converter.go   # Exchange rate conversion
│       └── cache.go       # Rate caching
```

---

### Task 7: Invoice Generation
**Priority:** 🟡 HIGH  
**Time:** 2 days  
**Status:** ❌ Not Started

**Problem:** No invoices generated for payments.

**Tasks:**
- [ ] 7.1 Install PDF generation library (go-pdf or similar)
- [ ] 7.2 Create invoice template
- [ ] 7.3 Generate invoice on payment success
- [ ] 7.4 Store invoices in database
- [ ] 7.5 Add `GET /api/billing/invoices` endpoint
- [ ] 7.6 Add `GET /api/billing/invoices/:id/download` endpoint
- [ ] 7.7 Display invoices in dashboard
- [ ] 7.8 Email invoices to users

---

### Task 8: Testing Suite
**Priority:** 🟡 HIGH  
**Time:** 1 week  
**Status:** ❌ Not Started (15% coverage)

**Problem:** Minimal test coverage, high risk of bugs.

**Tasks:**
- [ ] 8.1 Write unit tests for billing manager
- [ ] 8.2 Write unit tests for rotation manager
- [ ] 8.3 Write unit tests for quota enforcement
- [ ] 8.4 Write integration tests for payment flow
- [ ] 8.5 Write integration tests for rotation flow
- [ ] 8.6 Write end-to-end tests for proxy flow
- [ ] 8.7 Set up CI/CD with automated testing
- [ ] 8.8 Achieve 70%+ code coverage

**Target Coverage:**
- Billing: 80%+
- Rotation: 80%+
- Proxy: 70%+
- API: 70%+

---

### Task 9: Production Installers
**Priority:** 🟡 HIGH  
**Time:** 1 week  
**Status:** ❌ Not Started

**Problem:** No one-click installers exist.

**Tasks:**
- [ ] 9.1 Create macOS .dmg installer
- [ ] 9.2 Create Windows .exe installer (NSIS)
- [ ] 9.3 Create Linux .deb package
- [ ] 9.4 Create Linux .rpm package
- [ ] 9.5 Sign all installers
- [ ] 9.6 Test on clean VMs
- [ ] 9.7 Create installation documentation

---

## 📋 TASK SUMMARY

| Category | Tasks | Priority | Time |
|----------|-------|----------|------|
| Testing & Validation | 15 | 🔴 CRITICAL | 3-4 days |
| Database Setup | 6 | 🔴 CRITICAL | 2-3 days |
| Billing Integration | 10 | 🔴 CRITICAL | 2 days |
| Stripe Integration | 15 | 🔴 CRITICAL | 3-4 days |
| Quota Enforcement | 8 | 🔴 CRITICAL | 1-2 days |
| Currency System | 8 | 🟡 HIGH | 2-3 days |
| Invoice Generation | 8 | 🟡 HIGH | 2 days |
| Testing Suite | 8 | 🟡 HIGH | 1 week |
| Installers | 7 | 🟡 HIGH | 1 week |
| **TOTAL** | **85** | - | **6-8 weeks** |

---

## 🎯 RECOMMENDED EXECUTION ORDER

### Week 1: Foundation
1. ✅ Task 1: Rotation Testing (validate what exists)
2. ✅ Task 2: Database Setup (enable persistence)

### Week 2: Payments
3. ✅ Task 3: Billing Database Integration
4. ✅ Task 4: Stripe Integration
5. ✅ Task 5: Quota Enforcement

### Week 3-4: Polish
6. ✅ Task 6: Currency System
7. ✅ Task 7: Invoice Generation
8. ✅ Task 8: Testing Suite

### Week 5-6: Distribution
9. ✅ Task 9: Production Installers
10. ✅ Final QA & Bug Fixes

---

## 🚀 QUICK START

### This Week (Week 1)
```bash
# 1. Test rotation
cd scripts/proxy-client
go run ./cmd/service
# Run tests from Task 1

# 2. Set up database
brew install postgresql  # or sqlite3
createdb atlanticproxy
psql atlanticproxy < migrations/001_initial_schema.sql
```

### Next Week (Week 2)
```bash
# 3. Integrate Stripe
stripe login
stripe listen --forward-to localhost:8082/webhooks/stripe

# 4. Test payment flow
curl -X POST http://localhost:8082/api/billing/subscribe \
  -d '{"plan_id": 2, "payment_method": "stripe"}'
```

---

## 📞 BLOCKERS & QUESTIONS

**Database Choice:**
- PostgreSQL (production-grade, more setup)
- SQLite (simpler, good for MVP)
- **Recommendation:** Start with SQLite, migrate to PostgreSQL later

**Stripe Account:**
- Need business Stripe account
- Need to create products/prices
- Need webhook endpoint URL (use ngrok for local testing)

**Testing Strategy:**
- Manual testing first (Week 1)
- Automated tests later (Week 3-4)
- Focus on critical paths

---

## ✅ COMPLETION CRITERIA

**V1.0 is ready when:**
- ✅ All rotation modes work correctly
- ✅ Database persists all data
- ✅ Stripe payments work end-to-end
- ✅ Quotas enforced in proxy
- ✅ Currency detection works
- ✅ Invoices generated automatically
- ✅ 70%+ test coverage
- ✅ One-click installers for all platforms
- ✅ Zero critical bugs

---

**Last Updated:** December 31, 2025  
**Next Review:** January 7, 2026  
**Status:** 0/35 critical tasks complete (65-70% overall project completion)

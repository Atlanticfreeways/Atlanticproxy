# AtlanticProxy - Complete Implementation Tasks

**Priority:** CRITICAL  
**Estimated Time:** 10-12 hours  
**Status:** Not Started  
**Coverage:** Core Business Flow + Technical Infrastructure

---

## 🎯 Objective

Complete production-ready implementation covering:
1. Core business logic (payment, billing, plan enforcement)
2. Dashboard connectivity and real-time updates
3. Full user journey from signup to usage

---

## 📊 Implementation Phases

### **Phase 0: Core Business Logic (CRITICAL)** - 4 hours
Payment processing, plan enforcement, usage tracking

### **Phase 1: Authentication & Onboarding** - 1.5 hours
User registration, login, trial signup

### **Phase 2: WebSocket & Real-time** - 1.5 hours
Real-time status updates, broadcasting

### **Phase 3: Dashboard Connectivity** - 2 hours
All 13 tabs connected to backend

### **Phase 4: Missing Endpoints** - 1 hour
Additional API routes

### **Phase 5: Error Handling & Polish** - 1 hour
UX improvements, testing

---

# PHASE 0: Core Business Logic (CRITICAL)

**Time:** 4 hours  
**Priority:** 🔴 MUST HAVE

## 0.1 Payment Processing (1.5 hours)

### Backend: Paystack Integration
**File:** `scripts/proxy-client/internal/payment/paystack.go`

- [ ] Initialize Paystack client with secret key
- [ ] Create checkout session endpoint
- [ ] Verify payment transaction
- [ ] Handle payment callbacks
- [ ] Store payment records in database

**Endpoints:**
```go
POST /api/billing/trial/start
POST /api/billing/checkout
POST /webhooks/paystack
GET  /api/billing/verify/:reference
```

### Frontend: Trial Signup Flow
**File:** `atlantic-dashboard/app/trial/page.tsx`

- [ ] Payment form with Paystack integration
- [ ] Charge breakdown display ($1 deposit + $6.99)
- [ ] Redirect to Paystack checkout
- [ ] Handle payment callback
- [ ] Redirect to dashboard on success

**File:** `atlantic-dashboard/app/payment/callback/page.tsx`

- [ ] Verify payment reference
- [ ] Show success/failure message
- [ ] Create user session
- [ ] Redirect to dashboard

---

## 0.2 Plan Enforcement (1 hour)

### Backend: Feature Gating
**File:** `scripts/proxy-client/internal/billing/plan_enforcement.go`

- [ ] Check user plan before allowing features
- [ ] Enforce protocol restrictions (Starter = HTTPS only)
- [ ] Enforce data quota limits
- [ ] Block features for expired subscriptions
- [ ] Return upgrade prompts for restricted features

**Logic:**
```go
func CanUseProtocol(user User, protocol string) error {
    if user.Plan == "starter" && protocol != "https" {
        return errors.New("Upgrade to PAYG for all protocols")
    }
    return nil
}

func CheckDataQuota(user User) error {
    if user.DataUsed >= user.DataLimit {
        return errors.New("Data limit reached")
    }
    return nil
}
```

### Middleware
**File:** `scripts/proxy-client/internal/middleware/plan_check.go`

- [ ] Create middleware to check plan before proxy connection
- [ ] Add to proxy connect endpoint
- [ ] Add to protocol change endpoint
- [ ] Return 403 with upgrade message

---

## 0.3 Usage Tracking (1 hour)

### Backend: Real-time Tracking
**File:** `scripts/proxy-client/internal/billing/usage_tracker.go`

- [ ] Track data transferred per request
- [ ] Track connection time for PAYG users
- [ ] Update user quota in real-time
- [ ] Trigger warnings at 80%, 100%
- [ ] Auto-disconnect on quota exceeded

**Database:**
```sql
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    bytes_transferred BIGINT,
    connection_seconds INT,
    protocol VARCHAR(20),
    timestamp TIMESTAMP
);
```

### PAYG Billing Worker
**File:** `scripts/proxy-client/internal/billing/payg_worker.go`

- [ ] Run every minute
- [ ] Calculate hourly charges ($1.20/hr)
- [ ] Deduct from user credits
- [ ] Disconnect if credits exhausted
- [ ] Send low balance warnings

---

## 0.4 Webhook Processing (30 min)

### Backend: Paystack Webhooks
**File:** `scripts/proxy-client/internal/api/webhooks.go`

- [ ] Verify webhook signature
- [ ] Handle `charge.success` event
- [ ] Handle `subscription.create` event
- [ ] Handle `subscription.disable` event
- [ ] Update user subscription status
- [ ] Send confirmation emails

**Events:**
```go
charge.success → Activate subscription
subscription.disable → Deactivate subscription
charge.failed → Send payment failure email
```

---

# PHASE 1: Authentication & Onboarding

**Time:** 1.5 hours  
**Priority:** 🔴 CRITICAL

## 1.1 User Registration (45 min)

### Backend
**File:** `scripts/proxy-client/internal/api/auth.go`

- [ ] Complete registration endpoint
- [ ] Hash passwords with bcrypt
- [ ] Generate JWT tokens
- [ ] Create user record with default plan
- [ ] Send welcome email

**Endpoint:**
```go
POST /api/auth/register
Body: {email, password}
Response: {token, user}
```

### Frontend
**File:** `atlantic-dashboard/app/register/page.tsx`

- [ ] Registration form (email, password, confirm)
- [ ] Form validation
- [ ] Call registration API
- [ ] Store JWT token
- [ ] Redirect to trial signup

---

## 1.2 Password Reset (30 min)

### Backend
**File:** `scripts/proxy-client/internal/api/auth.go`

- [ ] Generate reset token
- [ ] Send reset email
- [ ] Verify reset token
- [ ] Update password

**Endpoints:**
```go
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Frontend
**Files:**
- `atlantic-dashboard/app/forgot-password/page.tsx`
- `atlantic-dashboard/app/reset-password/page.tsx`

- [ ] Forgot password form
- [ ] Reset password form
- [ ] Token validation
- [ ] Success/error messages

---

## 1.3 Session Management (15 min)

### Frontend
**File:** `atlantic-dashboard/lib/api.ts`

- [ ] Token refresh logic
- [ ] Auto-logout on token expiry
- [ ] Persist session across tabs
- [ ] Clear session on logout

---

# PHASE 2: WebSocket & Real-time

**Time:** 1.5 hours  
**Priority:** 🟡 HIGH

## 2.1 WebSocket Backend (45 min)

### Broadcasting
**File:** `scripts/proxy-client/internal/api/websocket.go`

- [ ] Verify `/ws` endpoint registered
- [ ] Add JWT authentication to WebSocket
- [ ] Broadcast on connect/disconnect
- [ ] Broadcast on IP rotation
- [ ] Broadcast on kill switch toggle
- [ ] Broadcast on quota warnings

**Events:**
```go
{type: "status", data: {connected, ip, location}}
{type: "rotation", data: {new_ip, location}}
{type: "quota", data: {used, limit, percentage}}
{type: "killswitch", data: {enabled}}
```

---

## 2.2 WebSocket Frontend (45 min)

### API Client
**File:** `atlantic-dashboard/lib/api.ts`

- [ ] Fix WebSocket URL (ws://localhost:8765)
- [ ] Add reconnection logic (3 retries, 2s delay)
- [ ] Add heartbeat/ping every 30s
- [ ] Handle connection errors
- [ ] Fallback to polling on failure

**Code:**
```typescript
subscribeToStatus(callback) {
    let retries = 0;
    const connect = () => {
        const ws = new WebSocket('ws://localhost:8765/ws');
        ws.onmessage = (e) => callback(JSON.parse(e.data));
        ws.onerror = () => {
            if (retries++ < 3) setTimeout(connect, 2000);
        };
    };
    connect();
}
```

### Dashboard Integration
**File:** `atlantic-dashboard/app/dashboard/page.tsx`

- [ ] Re-enable subscribeToStatus()
- [ ] Remove manual polling
- [ ] Add connection indicator
- [ ] Handle disconnection gracefully

---

# PHASE 3: Dashboard Connectivity

**Time:** 2 hours  
**Priority:** 🟡 HIGH

## 3.1 Critical Tabs (1 hour)

### Locations Tab
**File:** `atlantic-dashboard/app/dashboard/locations/page.tsx`

- [ ] Fetch locations → `/api/locations/available`
- [ ] Connect to location → `/api/rotation/geo` + connect
- [ ] Search & filter
- [ ] Favorites (localStorage)
- [ ] Loading states

### Protocol Tab
**File:** `atlantic-dashboard/app/dashboard/protocol/page.tsx`

- [ ] Fetch current → `/api/protocol/current`
- [ ] Change protocol → `/api/protocol/set`
- [ ] Show credentials → `/api/protocol/credentials`
- [ ] Plan-based access (Personal+ only)
- [ ] Copy to clipboard

### IP Rotation Tab
**File:** `atlantic-dashboard/app/dashboard/rotation/page.tsx`

- [ ] Fetch config → `/api/rotation/config`
- [ ] Update mode → `/api/rotation/config` (POST)
- [ ] Force rotation → `/api/rotation/session/new`
- [ ] Fetch stats → `/api/rotation/stats`
- [ ] Real-time events

### Security Tab
**File:** `atlantic-dashboard/app/dashboard/security/page.tsx`

- [ ] Fetch status → `/api/security/status`
- [ ] Toggle kill switch → `/api/killswitch`
- [ ] Run leak test → `/api/security/test`
- [ ] Anonymity score display

---

## 3.2 Secondary Tabs (1 hour)

### Ad-Blocking Tab
**File:** `atlantic-dashboard/app/dashboard/adblock/page.tsx`

- [ ] Fetch stats → `/adblock/stats`
- [ ] Whitelist management → `/adblock/whitelist`
- [ ] Refresh lists → `/adblock/refresh`

### Statistics Tab
**File:** `atlantic-dashboard/app/dashboard/statistics/page.tsx`

- [ ] Fetch stats → `/api/statistics`
- [ ] Hourly data → `/api/statistics/hourly`
- [ ] Top countries → `/api/statistics/countries`
- [ ] Chart rendering

### Servers Tab
**File:** `atlantic-dashboard/app/dashboard/servers/page.tsx`

- [ ] Fetch list → `/api/servers/list`
- [ ] Server status → `/api/servers/status`
- [ ] Connect → `/api/servers/connect`

### Settings Tab
**File:** `atlantic-dashboard/app/dashboard/settings/page.tsx`

- [ ] Fetch settings → `/api/settings`
- [ ] Update settings → `/api/settings` (POST)
- [ ] Change password → `/api/auth/password`

### Usage Tab
**File:** `atlantic-dashboard/app/dashboard/usage/page.tsx`

- [ ] Fetch usage → `/api/billing/usage`
- [ ] Protocol breakdown → `/api/statistics/protocols`
- [ ] Daily usage → `/api/statistics/daily`
- [ ] Charts

### Activity Tab
**File:** `atlantic-dashboard/app/dashboard/activity/page.tsx`

- [ ] Fetch log → `/api/activity/log`
- [ ] Filters (type, date)
- [ ] Pagination
- [ ] Real-time updates

---

# PHASE 4: Missing API Endpoints

**Time:** 1 hour  
**Priority:** 🟡 HIGH

## 4.1 Backend Endpoints
**File:** `scripts/proxy-client/internal/api/server.go`

### Protocol Endpoints
- [ ] `GET /api/protocol/current`
- [ ] `POST /api/protocol/set`
- [ ] `GET /api/protocol/credentials`

### Server Endpoints
- [ ] `GET /api/servers/list`
- [ ] `GET /api/servers/status`
- [ ] `POST /api/servers/connect`

### Statistics Endpoints
- [ ] `GET /api/statistics/hourly`
- [ ] `GET /api/statistics/countries`
- [ ] `GET /api/statistics/protocols`
- [ ] `GET /api/statistics/daily`

### Activity Endpoints
- [ ] `GET /api/activity/log`

### Settings Endpoints
- [ ] `GET /api/settings`
- [ ] `POST /api/settings`
- [ ] `POST /api/settings/preferences`
- [ ] `POST /api/auth/password`

### Billing Endpoints
- [ ] `POST /api/billing/payment-method`
- [ ] `GET /api/billing/invoices`
- [ ] `GET /api/billing/invoices/:id`

---

# PHASE 5: Error Handling & Polish

**Time:** 1 hour  
**Priority:** 🟢 MEDIUM

## 5.1 Error Handling (30 min)

### Global Error Handler
**File:** `atlantic-dashboard/components/ErrorBoundary.tsx`

- [ ] Create error boundary component
- [ ] Catch React errors
- [ ] Display user-friendly messages
- [ ] Log errors to console

### Toast Notifications
**File:** `atlantic-dashboard/components/ui/toast.tsx`

- [ ] Create toast component
- [ ] Success, error, warning, info types
- [ ] Auto-dismiss after 5s
- [ ] Stack multiple toasts

### API Error Handling
**File:** `atlantic-dashboard/lib/api.ts`

- [ ] Standardize error responses
- [ ] Show toast on API errors
- [ ] Retry logic for network errors
- [ ] Offline detection

---

## 5.2 Loading States (30 min)

### Components
- [ ] Skeleton loaders for data fetching
- [ ] Button loading spinners
- [ ] Page-level loading indicators
- [ ] Progress bars for uploads

### Optimistic Updates
- [ ] Update UI before API response
- [ ] Rollback on error
- [ ] Show pending state

---

# 🧪 Testing Checklist

## Core Business Flow
- [ ] User can register
- [ ] User can start trial with payment
- [ ] Payment is verified via webhook
- [ ] User can connect to proxy
- [ ] Data usage is tracked
- [ ] Quota limits are enforced
- [ ] PAYG billing works
- [ ] Plan restrictions work (Starter = HTTPS only)
- [ ] User can upgrade plan
- [ ] User can cancel subscription

## WebSocket
- [ ] Connects on dashboard load
- [ ] Receives real-time updates
- [ ] Reconnects on disconnect
- [ ] Falls back to polling

## Dashboard
- [ ] All 13 tabs load
- [ ] All buttons work
- [ ] All forms submit
- [ ] Errors display correctly
- [ ] Loading states work

## Integration
- [ ] End-to-end user journey works
- [ ] Payment → Activation → Usage → Billing
- [ ] All features work together

---

# 📝 Implementation Timeline

## Week 1: Core Business (CRITICAL)
**Days 1-2 (8 hours)**
- Phase 0: Payment, plan enforcement, usage tracking
- Phase 1: Auth & onboarding

## Week 2: Dashboard & Polish
**Days 3-4 (6 hours)**
- Phase 2: WebSocket
- Phase 3: Dashboard connectivity
- Phase 4: Missing endpoints
- Phase 5: Error handling

## Week 3: Testing & Launch
**Days 5-7**
- Full integration testing
- Bug fixes
- Staging deployment
- Production launch

---

# 🚀 Quick Start

## Day 1: Payment Processing
```bash
# Backend
cd scripts/proxy-client
# Create internal/payment/paystack.go
# Implement checkout and webhook handlers
go run ./cmd/service

# Frontend
cd atlantic-dashboard
# Fix app/trial/page.tsx
# Fix app/payment/callback/page.tsx
npm run dev

# Test
# Visit http://localhost:3456/trial
# Complete payment with test card
# Verify webhook received
```

## Day 2: Plan Enforcement
```bash
# Backend
# Create internal/billing/plan_enforcement.go
# Add middleware to check plans
# Test protocol restrictions

# Frontend
# Add upgrade prompts
# Test feature gating
```

## Day 3: WebSocket & Dashboard
```bash
# Fix WebSocket connection
# Connect all dashboard tabs
# Test real-time updates
```

---

# 📊 Success Criteria

## Must Have (Production Blockers)
- [ ] Users can sign up and pay
- [ ] Payment webhooks work
- [ ] Plan restrictions enforced
- [ ] Usage tracking works
- [ ] Proxy connection works
- [ ] Dashboard loads without errors

## Should Have (Launch Ready)
- [ ] WebSocket real-time updates
- [ ] All 13 tabs functional
- [ ] Error handling
- [ ] Loading states

## Nice to Have (Post-Launch)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Team management
- [ ] API documentation

---

# 📁 Files Summary

## New Files to Create (15)
- `scripts/proxy-client/internal/payment/paystack.go`
- `scripts/proxy-client/internal/billing/plan_enforcement.go`
- `scripts/proxy-client/internal/billing/usage_tracker.go`
- `scripts/proxy-client/internal/billing/payg_worker.go`
- `scripts/proxy-client/internal/middleware/plan_check.go`
- `scripts/proxy-client/internal/api/webhooks.go`
- `atlantic-dashboard/app/register/page.tsx`
- `atlantic-dashboard/app/forgot-password/page.tsx`
- `atlantic-dashboard/app/reset-password/page.tsx`
- `atlantic-dashboard/app/payment/callback/page.tsx`
- `atlantic-dashboard/components/ErrorBoundary.tsx`
- `atlantic-dashboard/components/ui/toast.tsx`
- `atlantic-dashboard/lib/websocket.ts`
- Database migrations for usage tracking
- Email templates

## Files to Modify (20+)
- All 13 dashboard tab pages
- `scripts/proxy-client/internal/api/server.go`
- `scripts/proxy-client/internal/api/auth.go`
- `atlantic-dashboard/lib/api.ts`
- `atlantic-dashboard/app/trial/page.tsx`
- And more...

---

**Status:** Ready to implement  
**Priority:** Start with Phase 0 (Core Business Logic)  
**Estimated Total Time:** 10-12 hours  
**Production Ready:** After all phases complete

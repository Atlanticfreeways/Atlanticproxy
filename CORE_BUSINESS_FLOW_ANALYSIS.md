# Core Business Flow Analysis

**Date:** February 9, 2026  
**Status:** Gap Analysis

---

## 🎯 Core Business Flow

### **User Journey:**
1. **Sign Up** → Trial/Payment
2. **Connect** → Select Location/Protocol
3. **Use Proxy** → Browse/Scrape
4. **Monitor** → Usage/Security
5. **Manage** → Billing/Settings

---

## ✅ What WEBSOCKET_DASHBOARD_TASKS.md Covers

### ✅ **Covered (Technical Infrastructure):**
- WebSocket real-time updates
- Dashboard tab connectivity
- API endpoint integration
- Error handling
- Loading states

### ❌ **NOT Covered (Core Business Flow):**

---

## 🚨 MISSING: Core Business Flow Tasks

### 1️⃣ **User Onboarding Flow** ❌

**Missing:**
- [ ] Registration page functionality
- [ ] Email verification
- [ ] Trial signup flow (Paystack integration)
- [ ] First-time user tutorial
- [ ] Welcome email

**Files Needed:**
- `atlantic-dashboard/app/register/page.tsx`
- `atlantic-dashboard/app/trial/page.tsx`
- `scripts/proxy-client/internal/api/auth.go`

---

### 2️⃣ **Payment & Billing Flow** ⚠️ Partial

**Covered:**
- ✅ Fetch subscription
- ✅ Fetch usage
- ✅ Cancel subscription

**Missing:**
- [ ] Trial payment processing (Paystack)
- [ ] Payment verification callback
- [ ] Subscription upgrade flow
- [ ] PAYG credit purchase
- [ ] Invoice generation
- [ ] Payment failure handling
- [ ] Deposit refund automation

**Critical Files:**
- `atlantic-dashboard/app/payment/callback/page.tsx`
- `scripts/proxy-client/internal/payment/paystack.go`
- `scripts/proxy-client/internal/billing/subscriptions.go`

---

### 3️⃣ **Proxy Connection Flow** ⚠️ Partial

**Covered:**
- ✅ Connect/Disconnect buttons
- ✅ IP rotation
- ✅ Location selection

**Missing:**
- [ ] Plan-based feature gating (Starter vs Personal vs Team)
- [ ] Protocol restriction by plan (HTTPS only for Starter)
- [ ] Data quota enforcement (10GB/week for Starter)
- [ ] Connection time tracking (PAYG hourly billing)
- [ ] Automatic disconnection on quota exceeded
- [ ] Upgrade prompts when limits reached

**Critical Logic:**
```go
// Check if user can use feature based on plan
if user.Plan == "starter" && protocol != "https" {
    return errors.New("Upgrade to PAYG for all protocols")
}

// Check data quota
if user.DataUsed >= user.DataLimit {
    return errors.New("Data limit reached. Upgrade or wait for reset")
}
```

---

### 4️⃣ **Usage Tracking & Billing** ❌

**Missing:**
- [ ] Real-time data usage tracking
- [ ] Hourly billing for PAYG users
- [ ] Data quota warnings (80%, 100%)
- [ ] Auto-renewal processing
- [ ] Usage analytics per session
- [ ] Cost calculation display

**Files Needed:**
- `scripts/proxy-client/internal/billing/usage_tracker.go`
- `scripts/proxy-client/internal/billing/payg_billing.go`
- `atlantic-dashboard/components/UsageWarning.tsx`

---

### 5️⃣ **Plan Management & Upgrades** ❌

**Missing:**
- [ ] View available plans
- [ ] Compare plans feature
- [ ] Upgrade flow (Starter → Personal → Team)
- [ ] Downgrade flow
- [ ] Plan change confirmation
- [ ] Prorated billing calculation
- [ ] Feature unlock on upgrade

**Files Needed:**
- `atlantic-dashboard/app/dashboard/plans/page.tsx`
- `atlantic-dashboard/app/dashboard/upgrade/page.tsx`
- `scripts/proxy-client/internal/billing/plan_changes.go`

---

### 6️⃣ **Authentication & Authorization** ⚠️ Partial

**Covered:**
- ✅ Login page
- ✅ JWT token storage

**Missing:**
- [ ] Registration endpoint implementation
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session management
- [ ] Token refresh logic
- [ ] Plan-based route protection

**Files Needed:**
- `atlantic-dashboard/app/forgot-password/page.tsx`
- `atlantic-dashboard/app/reset-password/page.tsx`
- `scripts/proxy-client/internal/api/auth.go` (complete)

---

### 7️⃣ **Webhook Processing** ❌

**Missing:**
- [ ] Paystack webhook handler
- [ ] Payment success processing
- [ ] Payment failure handling
- [ ] Subscription renewal webhook
- [ ] Subscription cancellation webhook
- [ ] Deposit refund webhook

**Critical File:**
- `scripts/proxy-client/internal/api/webhooks.go`

---

### 8️⃣ **Email Notifications** ❌

**Missing:**
- [ ] Welcome email
- [ ] Payment confirmation
- [ ] Trial expiry warning
- [ ] Subscription renewal reminder
- [ ] Cancellation confirmation
- [ ] Deposit refund notification
- [ ] Usage limit warnings

**Files Needed:**
- `scripts/proxy-client/internal/email/templates.go`
- `scripts/proxy-client/internal/email/sender.go`

---

## 📊 Coverage Analysis

| Business Flow | Coverage | Priority |
|---------------|----------|----------|
| User Onboarding | 20% | 🔴 CRITICAL |
| Payment & Billing | 40% | 🔴 CRITICAL |
| Proxy Connection | 60% | 🟡 HIGH |
| Usage Tracking | 10% | 🔴 CRITICAL |
| Plan Management | 0% | 🟡 HIGH |
| Authentication | 50% | 🟡 HIGH |
| Webhooks | 30% | 🔴 CRITICAL |
| Email Notifications | 0% | 🟢 MEDIUM |

**Overall Core Business Flow Coverage: 35%**

---

## 🚨 Critical Gaps

### **Blockers for Production:**

1. **Payment Processing** - Users can't actually pay
2. **Plan Enforcement** - No feature gating by plan
3. **Usage Tracking** - No billing for PAYG users
4. **Webhooks** - Payments won't be verified
5. **Registration** - Users can't sign up

---

## ✅ What to Add to Task File

### **New Phase 0: Core Business Logic (4 hours)**

#### 0.1 User Registration & Auth
- [ ] Complete registration endpoint
- [ ] Email verification
- [ ] Password reset flow
- [ ] Session management

#### 0.2 Payment Processing
- [ ] Paystack checkout integration
- [ ] Payment callback handler
- [ ] Webhook processing
- [ ] Payment verification

#### 0.3 Plan Enforcement
- [ ] Feature gating by plan
- [ ] Protocol restrictions
- [ ] Data quota enforcement
- [ ] Connection time tracking

#### 0.4 Usage Tracking & Billing
- [ ] Real-time data tracking
- [ ] PAYG hourly billing
- [ ] Quota warnings
- [ ] Auto-renewal processing

#### 0.5 Plan Management
- [ ] Upgrade/downgrade flows
- [ ] Plan comparison page
- [ ] Prorated billing
- [ ] Feature unlock logic

---

## 🎯 Revised Priority

### **Phase 0: Core Business (CRITICAL)** - 4 hours
- Payment processing
- Plan enforcement
- Usage tracking
- Webhooks

### **Phase 1-5: Dashboard & WebSocket** - 4-6 hours
- (Existing tasks)

**Total: 8-10 hours for production-ready**

---

## 💡 Recommendation

**The current task file covers technical infrastructure but MISSES core business logic.**

### **What You Need:**

1. **CORE_BUSINESS_FLOW_TASKS.md** (NEW) - Payment, billing, plan enforcement
2. **WEBSOCKET_DASHBOARD_TASKS.md** (EXISTING) - UI/UX connectivity

### **Priority Order:**

1. ✅ Core Business Flow (Can't launch without this)
2. ⚠️ Dashboard Connectivity (Can launch with basic UI)
3. ✅ WebSocket (Nice to have, not critical)

---

## 📋 Next Steps

1. Create **CORE_BUSINESS_FLOW_TASKS.md**
2. Implement payment processing first
3. Add plan enforcement
4. Then fix dashboard connectivity
5. WebSocket is last priority

---

**Bottom Line:** Current task file is 35% of what's needed for production. Core business logic is missing.

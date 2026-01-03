# AtlanticProxy Business Model - How It Works

## Overview
AtlanticProxy acts as a **proxy reseller/aggregator** using Oxylabs as the infrastructure provider.

---

## The Flow

### 1️⃣ **You (AtlanticProxy Owner)**

**What You Do:**
- Buy **ONE** Oxylabs Residential Proxies plan
- Get credentials: `customer-yourcompany` / `password123`
- Pay Oxylabs based on **your usage** (all your users combined)

**Oxylabs Plan Recommendation:**
- **Residential Proxies** with:
  - ✅ Global coverage (all countries/states)
  - ✅ Unlimited concurrent sessions
  - ✅ Pay-as-you-go or monthly bandwidth package

---

### 2️⃣ **Your Users (AtlanticProxy Customers)**

**What They Do:**
- Sign up on AtlanticProxy
- Buy a subscription plan (Starter/Personal/Team/Enterprise)
- Pay **YOU** via Paystack
- Get access to proxy service

**What They DON'T Do:**
- ❌ Never interact with Oxylabs directly
- ❌ Don't need Oxylabs account
- ❌ Don't know Oxylabs exists (white-label)

---

## How It Works Technically

### **Single Oxylabs Account = Shared Pool**

```
┌─────────────────────────────────────────────────┐
│         YOUR OXYLABS ACCOUNT                    │
│  customer-atlanticproxy / password123           │
│                                                 │
│  ✅ Access to ALL regions (US, UK, NG, etc.)   │
│  ✅ Access to ALL states (NY, CA, TX, etc.)    │
│  ✅ Unlimited sessions                          │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        │   AtlanticProxy Service   │
        │   (Your Application)      │
        └─────────────┬─────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        │                           │
    User A          User B      User C
   (Starter)      (Personal)   (Team)
```

### **How Users Access IPs**

**User A requests proxy:**
```
User A → AtlanticProxy → Oxylabs (with User A's session ID)
                      ← Returns IP from US
```

**User B requests proxy (same time):**
```
User B → AtlanticProxy → Oxylabs (with User B's session ID)
                      ← Returns different IP from UK
```

**Key Point:** All users share YOUR Oxylabs credentials, but each gets:
- ✅ Unique session IDs (isolated IPs)
- ✅ Different geo-locations (based on their choice)
- ✅ Separate bandwidth tracking (in your app)

---

## Session Isolation

### **How AtlanticProxy Keeps Users Separate**

```go
// User A connects
proxyURL := oxylabs.GetProxyWithConfig(ctx, ProxyConfig{
    SessionID: "user_abc123_session_1",  // Unique to User A
    Country: "US",
    City: "newyork"
})
// Returns: http://customer-atlanticproxy-sessid-user_abc123_session_1-cc-US-city-newyork:password@pr.oxylabs.io:7777

// User B connects (simultaneously)
proxyURL := oxylabs.GetProxyWithConfig(ctx, ProxyConfig{
    SessionID: "user_xyz789_session_1",  // Unique to User B
    Country: "UK",
    City: "london"
})
// Returns: http://customer-atlanticproxy-sessid-user_xyz789_session_1-cc-UK-city-london:password@pr.oxylabs.io:7777
```

**Result:**
- User A gets a sticky US IP (New York)
- User B gets a sticky UK IP (London)
- Both use YOUR Oxylabs account
- Oxylabs sees 2 concurrent sessions from your account

---

## Billing Model

### **Two-Tier Billing**

#### **Tier 1: Oxylabs → You**
- Oxylabs charges YOU for total bandwidth/requests
- Example: 100GB used across all users = You pay for 100GB

#### **Tier 2: You → Your Users**
- You charge users based on their plan
- Example:
  - User A (Starter): $9/month for 500MB
  - User B (Personal): $29/month for 5GB
  - User C (Team): $99/month for 50GB

**Your Revenue:**
```
Income:  $9 + $29 + $99 = $137/month
Expense: Oxylabs bill (based on actual usage)
Profit:  $137 - Oxylabs cost
```

---

## Quota Management

### **How AtlanticProxy Enforces Limits**

**User A (Starter Plan - 500MB limit):**

1. User A makes requests through proxy
2. AtlanticProxy tracks bandwidth in SQLite:
   ```sql
   UPDATE usage_tracking 
   SET data_transferred_bytes = data_transferred_bytes + 1048576
   WHERE user_id = 'user_abc123'
   ```
3. When User A hits 500MB:
   ```go
   if usage.DataTransferredMB >= plan.DataQuotaGB * 1024 {
       return 429 // Too Many Requests
   }
   ```
4. User A must upgrade or wait for monthly reset

**Oxylabs doesn't care** - they just see bandwidth usage from your account.

---

## Geographic Access

### **All Regions Available to All Users**

**Your Oxylabs Plan:**
- ✅ 195+ countries
- ✅ All US states
- ✅ Major cities worldwide

**User Control:**
```json
// User can choose any location
POST /api/rotation/geo
{
  "country": "US",
  "state": "California",
  "city": "Los Angeles"
}
```

**AtlanticProxy forwards to Oxylabs:**
```
http://customer-atlanticproxy-cc-US-st-california-city-losangeles-sessid-user123:pass@pr.oxylabs.io:7777
```

**No per-user Oxylabs accounts needed** - your one account provides all locations.

---

## Cost Structure

### **Example Scenario**

**Your Oxylabs Plan:**
- Pay-as-you-go: $15/GB
- Monthly package: $500 for 50GB ($10/GB)

**Your Users:**
- 10 Starter users: 10 × 500MB = 5GB
- 5 Personal users: 5 × 5GB = 25GB  
- 2 Team users: 2 × 50GB = 100GB
- **Total potential:** 130GB

**Your Revenue:**
- Starter: 10 × $9 = $90
- Personal: 5 × $29 = $145
- Team: 2 × $99 = $198
- **Total:** $433/month

**Your Cost (if all users max out):**
- 130GB × $10/GB = $1,300
- **Profit:** $433 - $1,300 = **-$867 loss** ⚠️

### **Solution: Oversubscription**

**Reality:** Most users don't use full quota
- Average usage: 30-40% of quota
- Actual usage: 130GB × 0.35 = 45.5GB
- **Cost:** 45.5GB × $10 = $455
- **Profit:** $433 - $455 = **-$22** (break-even)

**Better Pricing Strategy:**
- Increase prices OR
- Negotiate better Oxylabs rates at scale OR
- Implement usage-based pricing

---

## Security & Isolation

### **How Users Are Isolated**

1. **Session IDs:** Each user gets unique session identifier
2. **IP Stickiness:** Sessions maintain same IP for duration
3. **Bandwidth Tracking:** Per-user quota enforcement
4. **Rate Limiting:** Per-user request limits

**Users CANNOT:**
- ❌ See other users' traffic
- ❌ Access other users' sessions
- ❌ Know Oxylabs credentials
- ❌ Bypass their quota limits

---

## Summary

### **The Model**

```
┌──────────────────────────────────────────────┐
│  YOU buy ONE Oxylabs account                 │
│  - Global access                             │
│  - All regions/states                        │
│  - Pay for total usage                       │
└──────────────────┬───────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────┐
│  AtlanticProxy Service                       │
│  - Manages user sessions                     │
│  - Tracks individual quotas                  │
│  - Enforces rate limits                      │
│  - Handles billing                           │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     User A     User B     User C
   (Pays you) (Pays you) (Pays you)
```

### **Key Points**

✅ **One Oxylabs Account** - Shared infrastructure  
✅ **Multiple Users** - Each with unique sessions  
✅ **White-Label** - Users don't know about Oxylabs  
✅ **Quota Enforcement** - You control limits in your app  
✅ **Revenue Model** - Resell Oxylabs bandwidth with markup  

### **Next Steps**

1. Buy Oxylabs Residential Proxies plan
2. Get credentials (username/password)
3. Update `.env` with credentials
4. Test end-to-end proxy flow
5. Launch and start acquiring users!

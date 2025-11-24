# Backend Integration Guide - Phase 4

**Status:** Ready for Backend Integration  
**Date:** January 20, 2024  
**Frontend API Client:** `frontend/lib/api/proxyApi.ts`

---

## 📋 Overview

This guide provides all necessary information for integrating Phase 4 frontend components with the Go backend.

---

## 🔌 API Endpoints Required

### **Billing Endpoints**

#### `POST /api/billing/calculate-price`
Calculate final price based on customization.

**Request:**
```json
{
  "planId": "pro",
  "protocol": "https",
  "ispTier": "premium",
  "billingCycle": "monthly"
}
```

**Response:**
```json
{
  "totalPrice": 36.99,
  "breakdown": {
    "basePrice": 29.99,
    "protocolAdjustment": 1.00,
    "ispTierAdjustment": 5.00
  }
}
```

#### `POST /api/billing/checkout`
Process subscription purchase.

**Request:**
```json
{
  "planId": "pro",
  "protocol": "https",
  "ispTier": "premium",
  "billingCycle": "monthly",
  "paymentMethodId": "pm_123"
}
```

**Response:**
```json
{
  "orderId": "ord_123",
  "status": "completed"
}
```

#### `GET /api/billing/payment-methods`
Get user's payment methods.

**Response:**
```json
[
  {
    "id": "pm_123",
    "type": "card",
    "name": "Visa",
    "lastFour": "4242",
    "expiryDate": "12/25",
    "isDefault": true
  }
]
```

#### `POST /api/billing/payment-methods`
Add new payment method.

**Request:**
```json
{
  "type": "card",
  "name": "Visa",
  "lastFour": "4242",
  "expiryDate": "12/25",
  "isDefault": false
}
```

#### `DELETE /api/billing/payment-methods/{id}`
Delete payment method.

#### `PUT /api/billing/payment-methods/{id}/default`
Set as default payment method.

#### `GET /api/billing/invoices?status=paid&limit=10`
Get invoices with optional filters.

**Response:**
```json
[
  {
    "id": "INV-2024-001",
    "date": "2024-01-20",
    "amount": 29.99,
    "status": "paid",
    "description": "Professional Plan - Monthly",
    "downloadUrl": "/api/billing/invoices/INV-2024-001/download"
  }
]
```

#### `GET /api/billing/invoices/{id}/download`
Download invoice as PDF/CSV.

#### `GET /api/billing/cost-analysis?period=month`
Get cost analysis data.

**Response:**
```json
{
  "totalCost": 89.97,
  "avgCost": 29.99,
  "maxCost": 36.99,
  "data": [
    {
      "date": "2024-01-01",
      "cost": 29.99,
      "bandwidth": 100
    }
  ]
}
```

---

### **Proxy Configuration Endpoints**

#### `GET /api/proxy/locations`
Get all proxy locations.

**Response:**
```json
[
  {
    "id": "1",
    "country": "United States",
    "city": "New York",
    "region": "us-east",
    "servers": 150,
    "latency": 12,
    "uptime": 99.9,
    "available": true
  }
]
```

#### `GET /api/proxy/locations?region=us-east`
Get locations by region.

#### `POST /api/proxy/configuration`
Save proxy configuration.

**Request:**
```json
{
  "protocol": "https",
  "ispTier": "premium",
  "locations": ["1", "2", "3"],
  "loadBalancingMode": "round-robin"
}
```

#### `GET /api/proxy/configuration`
Get current proxy configuration.

#### `PUT /api/proxy/session-settings`
Update session persistence settings.

**Request:**
```json
{
  "enabled": true,
  "sessionDuration": 30,
  "sessionTimeout": 60,
  "ipStickiness": true,
  "cookiePreservation": true,
  "headerPreservation": true
}
```

#### `PUT /api/proxy/custom-headers`
Update custom HTTP headers.

**Request:**
```json
{
  "headers": [
    {
      "name": "User-Agent",
      "value": "Mozilla/5.0...",
      "enabled": true
    }
  ]
}
```

#### `PUT /api/proxy/throttling-settings`
Update request throttling.

**Request:**
```json
{
  "enabled": true,
  "requestsPerSecond": 10,
  "burstSize": 20,
  "delayBetweenRequests": 100,
  "connectionLimit": 50,
  "bandwidthLimit": 100
}
```

#### `PUT /api/proxy/authentication`
Update proxy authentication.

**Request:**
```json
{
  "username": "user123",
  "password": "pass123",
  "authMethod": "basic"
}
```

---

### **Account Endpoints**

#### `GET /api/account/security`
Get account security information.

**Response:**
```json
{
  "lastLogin": "2024-01-20 14:32 UTC",
  "lastLoginIP": "192.168.1.100",
  "lastPasswordChange": "2024-01-10",
  "twoFactorEnabled": true,
  "activeDevices": 2,
  "loginAttempts": 0
}
```

#### `GET /api/account/sessions`
Get active sessions.

**Response:**
```json
[
  {
    "device": "Chrome on macOS",
    "ip": "192.168.1.100",
    "lastActive": "2 minutes ago",
    "current": true
  }
]
```

#### `DELETE /api/account/sessions/{id}`
Logout specific device.

#### `POST /api/account/sessions/logout-all`
Logout all devices.

#### `DELETE /api/account/delete`
Delete account.

**Request:**
```json
{
  "password": "user_password"
}
```

#### `POST /api/account/change-password`
Change password.

**Request:**
```json
{
  "oldPassword": "old_pass",
  "newPassword": "new_pass"
}
```

---

### **Notifications Endpoints**

#### `GET /api/notifications/settings`
Get notification settings.

**Response:**
```json
{
  "emailNotifications": {
    "dailyReport": true,
    "weeklyReport": true,
    "monthlyReport": false,
    "usageAlerts": true,
    "billingAlerts": true,
    "securityAlerts": true,
    "maintenanceNotices": true,
    "newFeatures": false,
    "reportTime": "09:00"
  },
  "pushNotifications": {
    "enabled": true,
    "connectionStatus": true,
    "usageAlerts": true,
    "billingAlerts": true,
    "securityAlerts": true,
    "sound": true,
    "badge": true
  }
}
```

#### `PUT /api/notifications/settings`
Update all notification settings.

#### `PUT /api/notifications/email-settings`
Update email notification settings.

#### `PUT /api/notifications/push-settings`
Update push notification settings.

---

### **Analytics Endpoints**

#### `POST /api/analytics/export`
Export data in various formats.

**Request:**
```json
{
  "format": "csv",
  "dateRange": "month",
  "includeMetrics": true,
  "includeBilling": true,
  "includeConnections": true,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:** Binary file (CSV/JSON/PDF)

#### `GET /api/analytics/usage-trends?period=month`
Get usage trends.

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "bandwidth": 45,
    "requests": 1200,
    "avgLatency": 25
  }
]
```

#### `GET /api/analytics/connection-metrics`
Get connection metrics.

**Response:**
```json
{
  "totalConnections": 5000,
  "activeConnections": 42,
  "avgLatency": 28,
  "successRate": 99.8
}
```

---

## 🔐 Authentication

All endpoints require JWT authentication (except login/register).

**Header:**
```
Authorization: Bearer <jwt_token>
```

---

## 📝 Database Schema Updates

### **New Tables Needed**

#### `customizations`
```sql
CREATE TABLE customizations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  protocol VARCHAR(20) NOT NULL,
  isp_tier VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `proxy_configurations`
```sql
CREATE TABLE proxy_configurations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  protocol VARCHAR(20) NOT NULL,
  isp_tier VARCHAR(20) NOT NULL,
  locations JSONB NOT NULL,
  load_balancing_mode VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `session_settings`
```sql
CREATE TABLE session_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  enabled BOOLEAN DEFAULT true,
  session_duration INTEGER NOT NULL,
  session_timeout INTEGER NOT NULL,
  ip_stickiness BOOLEAN DEFAULT true,
  cookie_preservation BOOLEAN DEFAULT true,
  header_preservation BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `custom_headers`
```sql
CREATE TABLE custom_headers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `throttling_settings`
```sql
CREATE TABLE throttling_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  enabled BOOLEAN DEFAULT true,
  requests_per_second INTEGER NOT NULL,
  burst_size INTEGER NOT NULL,
  delay_between_requests INTEGER NOT NULL,
  connection_limit INTEGER NOT NULL,
  bandwidth_limit INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Integration Steps

### **Step 1: Backend Setup**
1. Create API endpoints (see above)
2. Update database schema
3. Implement pricing calculation logic
4. Set up payment processing (Stripe/PayPal)

### **Step 2: Frontend Integration**
1. Import API client: `import proxyApi from '@/lib/api/proxyApi'`
2. Use in components:
```tsx
const handleCheckout = async () => {
  try {
    const result = await proxyApi.billing.checkout({
      planId: 'pro',
      protocol: 'https',
      ispTier: 'premium',
      billingCycle: 'monthly',
      paymentMethodId: 'pm_123',
    });
    console.log('Order:', result);
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

### **Step 3: Testing**
1. Test all API endpoints
2. Verify calculations
3. Test payment flow
4. Test error handling

### **Step 4: Deployment**
1. Deploy backend
2. Deploy frontend
3. Monitor for errors
4. Gather user feedback

---

## 🛠️ Implementation Checklist

### **Backend**
- [ ] Create all API endpoints
- [ ] Implement pricing calculation
- [ ] Set up payment processing
- [ ] Add database migrations
- [ ] Implement error handling
- [ ] Add request validation
- [ ] Set up logging
- [ ] Add rate limiting

### **Frontend**
- [ ] Import API client
- [ ] Connect components to API
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add success messages
- [ ] Test all flows
- [ ] Optimize performance
- [ ] Add analytics tracking

### **Testing**
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Payment flow tests
- [ ] Error scenario tests
- [ ] Performance tests
- [ ] Security tests

---

## 📊 Pricing Calculation Logic

```go
// Backend pseudocode
func CalculatePrice(planID, protocol, ispTier, billingCycle string) float64 {
  basePrices := map[string]float64{
    "starter": 9.99,
    "pro": 29.99,
    "enterprise": 99.99,
  }
  
  protocolAdjustments := map[string]float64{
    "http": 0,
    "https": 1.00,
    "socks5": 2.00,
  }
  
  tierAdjustments := map[string]float64{
    "budget": -3.00,
    "standard": 0,
    "premium": 5.00,
  }
  
  basePrice := basePrices[planID]
  protocolAdj := protocolAdjustments[protocol]
  tierAdj := tierAdjustments[ispTier]
  
  monthlyPrice := basePrice + protocolAdj + tierAdj
  
  if billingCycle == "annual" {
    return monthlyPrice * 12 * 0.83 // 17% discount
  }
  
  return monthlyPrice
}
```

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Frontend API client configured
- [ ] Payment processing active
- [ ] Error logging enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Security audit completed
- [ ] Performance optimized

---

## 📞 Support

For questions or issues:
1. Check API endpoint documentation
2. Review error responses
3. Check backend logs
4. Review frontend console
5. Contact development team

---

**Status: READY FOR BACKEND INTEGRATION ✅**


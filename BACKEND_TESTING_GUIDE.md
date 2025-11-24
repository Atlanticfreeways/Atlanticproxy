# Backend Testing Guide - Phase 4 API Endpoints

**Status:** Ready for Testing  
**Date:** January 20, 2024  
**Total Endpoints:** 25  
**Test Coverage:** All endpoints

---

## 🧪 Testing Setup

### **Prerequisites**
- Go 1.24+
- PostgreSQL 13+
- Postman or curl
- Docker (optional)

### **Environment Setup**

Create `.env.test`:
```bash
DATABASE_URL=postgres://user:password@localhost:5432/atlantic_proxy_test
JWT_SECRET=test_secret_key
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=test_client_id
PAYSTACK_SECRET_KEY=test_secret_key
PAYMENT_PROVIDER=stripe
```

### **Database Setup**

```bash
# Create test database
createdb atlantic_proxy_test

# Run migrations
psql atlantic_proxy_test < backend/internal/database/migrations/001_initial.sql
psql atlantic_proxy_test < backend/internal/database/migrations/002_auth.sql
psql atlantic_proxy_test < backend/internal/database/migrations/003_proxy.sql
psql atlantic_proxy_test < backend/internal/database/migrations/004_phase4_tables.sql
```

---

## 📋 Test Cases

### **1. Billing Endpoints**

#### Test: Calculate Price
```bash
curl -X POST http://localhost:5000/api/billing/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro",
    "protocol": "https",
    "ispTier": "premium",
    "billingCycle": "monthly"
  }'

# Expected Response:
{
  "totalPrice": 36.99,
  "breakdown": {
    "basePrice": 29.99,
    "protocolAdjustment": 1.00,
    "ispTierAdjustment": 5.00,
    "billingDiscount": 0
  }
}
```

#### Test: Checkout
```bash
curl -X POST http://localhost:5000/api/billing/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "planId": "pro",
    "protocol": "https",
    "ispTier": "premium",
    "billingCycle": "monthly",
    "paymentMethodId": "pm_123"
  }'

# Expected Response:
{
  "orderId": "ord_1234567890",
  "status": "completed"
}
```

#### Test: Get Payment Methods
```bash
curl -X GET http://localhost:5000/api/billing/payment-methods \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
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

#### Test: Add Payment Method
```bash
curl -X POST http://localhost:5000/api/billing/payment-methods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "card",
    "name": "Visa",
    "lastFour": "4242",
    "expiryDate": "12/25",
    "isDefault": false
  }'
```

#### Test: Get Invoices
```bash
curl -X GET "http://localhost:5000/api/billing/invoices?status=paid&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Get Cost Analysis
```bash
curl -X GET "http://localhost:5000/api/billing/cost-analysis?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

---

### **2. Proxy Endpoints**

#### Test: Get Locations
```bash
curl -X GET http://localhost:5000/api/proxy/locations

# Optional: Filter by region
curl -X GET "http://localhost:5000/api/proxy/locations?region=us-east"
```

#### Test: Save Configuration
```bash
curl -X POST http://localhost:5000/api/proxy/configuration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "protocol": "https",
    "ispTier": "premium",
    "locations": ["loc_us_east_1", "loc_eu_west_1"],
    "loadBalancingMode": "round-robin"
  }'
```

#### Test: Update Session Settings
```bash
curl -X PUT http://localhost:5000/api/proxy/session-settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "enabled": true,
    "sessionDuration": 30,
    "sessionTimeout": 60,
    "ipStickiness": true,
    "cookiePreservation": true,
    "headerPreservation": true
  }'
```

#### Test: Update Custom Headers
```bash
curl -X PUT http://localhost:5000/api/proxy/custom-headers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "headers": [
      {
        "name": "User-Agent",
        "value": "Mozilla/5.0...",
        "enabled": true
      }
    ]
  }'
```

---

### **3. Account Endpoints**

#### Test: Get Security Info
```bash
curl -X GET http://localhost:5000/api/account/security \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Get Active Sessions
```bash
curl -X GET http://localhost:5000/api/account/sessions \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Change Password
```bash
curl -X POST http://localhost:5000/api/account/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "old_pass",
    "newPassword": "new_pass_123"
  }'
```

---

### **4. Notifications Endpoints**

#### Test: Get Settings
```bash
curl -X GET http://localhost:5000/api/notifications/settings \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Update Email Settings
```bash
curl -X PUT http://localhost:5000/api/notifications/email-settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dailyReport": true,
    "weeklyReport": true,
    "monthlyReport": false,
    "usageAlerts": true,
    "billingAlerts": true,
    "securityAlerts": true,
    "maintenanceNotices": true,
    "newFeatures": false,
    "reportTime": "09:00"
  }'
```

---

### **5. Analytics Endpoints**

#### Test: Get Usage Trends
```bash
curl -X GET "http://localhost:5000/api/analytics/usage-trends?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Get Connection Metrics
```bash
curl -X GET http://localhost:5000/api/analytics/connection-metrics \
  -H "Authorization: Bearer $TOKEN"
```

#### Test: Export Data
```bash
curl -X POST http://localhost:5000/api/analytics/export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "format": "csv",
    "dateRange": "month",
    "includeMetrics": true,
    "includeBilling": true,
    "includeConnections": true
  }' \
  -o export.csv
```

---

## 🧬 Unit Tests

Create `backend/internal/services/billing_test.go`:

```go
package services

import (
	"testing"
)

func TestCalculatePrice(t *testing.T) {
	service := &BillingService{}

	tests := []struct {
		name         string
		planID       string
		protocol     string
		ispTier      string
		billingCycle string
		expected     float64
	}{
		{
			name:         "Starter HTTP Budget Monthly",
			planID:       "starter",
			protocol:     "http",
			ispTier:      "budget",
			billingCycle: "monthly",
			expected:     6.99,
		},
		{
			name:         "Pro HTTPS Standard Monthly",
			planID:       "pro",
			protocol:     "https",
			ispTier:      "standard",
			billingCycle: "monthly",
			expected:     30.99,
		},
		{
			name:         "Enterprise SOCKS5 Premium Annual",
			planID:       "enterprise",
			protocol:     "socks5",
			ispTier:      "premium",
			billingCycle: "annual",
			expected:     1008.34, // (99.99 + 2 + 5) * 12 * 0.83
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			price, _, err := service.CalculatePrice(tt.planID, tt.protocol, tt.ispTier, tt.billingCycle)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if price != tt.expected {
				t.Errorf("got %f, want %f", price, tt.expected)
			}
		})
	}
}
```

---

## 🔄 Integration Tests

Create `backend/internal/api/handlers/billing_test.go`:

```go
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/atlanticproxy/backend/internal/services"
)

func TestCalculatePriceHandler(t *testing.T) {
	router := gin.Default()
	billingService := services.NewBillingService(nil)
	handler := NewBillingHandler(billingService)

	router.POST("/api/billing/calculate-price", handler.CalculatePrice)

	payload := map[string]string{
		"planId":       "pro",
		"protocol":     "https",
		"ispTier":      "premium",
		"billingCycle": "monthly",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/billing/calculate-price", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["totalPrice"] == nil {
		t.Error("expected totalPrice in response")
	}
}
```

---

## 🚀 Running Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific test
go test -run TestCalculatePrice ./internal/services

# Run with verbose output
go test -v ./...

# Run with race detector
go test -race ./...
```

---

## ✅ Test Checklist

### **Billing Tests**
- [ ] Calculate price for all plan/protocol/tier combinations
- [ ] Checkout with valid payment method
- [ ] Checkout with invalid payment method
- [ ] Add payment method
- [ ] Delete payment method
- [ ] Set default payment method
- [ ] Get invoices with filters
- [ ] Get cost analysis for different periods

### **Proxy Tests**
- [ ] Get all locations
- [ ] Get locations by region
- [ ] Save configuration
- [ ] Get configuration
- [ ] Update session settings
- [ ] Update custom headers
- [ ] Update throttling settings
- [ ] Update proxy authentication

### **Account Tests**
- [ ] Get security info
- [ ] Get active sessions
- [ ] Logout device
- [ ] Logout all devices
- [ ] Change password with correct old password
- [ ] Change password with incorrect old password
- [ ] Delete account

### **Notifications Tests**
- [ ] Get default settings
- [ ] Update email settings
- [ ] Update push settings
- [ ] Update all settings

### **Analytics Tests**
- [ ] Get usage trends for different periods
- [ ] Get connection metrics
- [ ] Export data as CSV
- [ ] Export data as JSON
- [ ] Export with date range

---

## 🔐 Security Tests

- [ ] Endpoints require authentication
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Users can only access their own data
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are blocked
- [ ] CSRF protection is enabled

---

## 📊 Performance Tests

- [ ] Response time < 200ms
- [ ] Database queries < 100ms
- [ ] Concurrent requests handled
- [ ] Memory usage is stable
- [ ] No memory leaks

---

## 🐛 Error Handling Tests

- [ ] Invalid input returns 400
- [ ] Unauthorized returns 401
- [ ] Forbidden returns 403
- [ ] Not found returns 404
- [ ] Server errors return 500
- [ ] Error messages are helpful

---

**Status: READY FOR TESTING ✅**


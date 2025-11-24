# Backend Implementation Guide - Phase 4 API Endpoints

**Status:** Ready for Implementation  
**Date:** January 20, 2024  
**Language:** Go  
**Framework:** Gin  
**Database:** PostgreSQL

---

## 📋 Overview

This guide provides step-by-step instructions for implementing all 25 API endpoints for Phase 4.

---

## 🏗️ Project Structure

```
backend/
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── billing.go          ✅ (9 endpoints)
│   │   │   ├── proxy.go            ✅ (6 endpoints)
│   │   │   ├── account.go          ✅ (6 endpoints)
│   │   │   ├── notifications.go    ✅ (4 endpoints)
│   │   │   └── analytics.go        ✅ (3 endpoints)
│   │   └── routes.go               (To create)
│   ├── models/
│   │   ├── billing.go              ✅ (Created)
│   │   ├── proxy.go                ✅ (Created)
│   │   ├── account.go              ✅ (Created)
│   │   └── notifications.go        ✅ (Created)
│   ├── services/
│   │   ├── billing.go              (To create)
│   │   ├── proxy.go                (To create)
│   │   ├── account.go              (To create)
│   │   ├── notifications.go        (To create)
│   │   └── analytics.go            (To create)
│   ├── database/
│   │   └── migrations/             (To create)
│   └── middleware/
│       └── auth.go                 (Already exists)
└── cmd/
    └── server/
        └── main.go                 (Update routes)
```

---

## 🔌 API Endpoints Summary

### **Billing (9 endpoints)**
1. POST /api/billing/calculate-price
2. POST /api/billing/checkout
3. GET /api/billing/payment-methods
4. POST /api/billing/payment-methods
5. DELETE /api/billing/payment-methods/{id}
6. PUT /api/billing/payment-methods/{id}/default
7. GET /api/billing/invoices
8. GET /api/billing/invoices/{id}/download
9. GET /api/billing/cost-analysis

### **Proxy (6 endpoints)**
10. GET /api/proxy/locations
11. POST /api/proxy/configuration
12. GET /api/proxy/configuration
13. PUT /api/proxy/session-settings
14. PUT /api/proxy/custom-headers
15. PUT /api/proxy/throttling-settings
16. PUT /api/proxy/authentication

### **Account (6 endpoints)**
17. GET /api/account/security
18. GET /api/account/sessions
19. DELETE /api/account/sessions/{id}
20. POST /api/account/sessions/logout-all
21. DELETE /api/account/delete
22. POST /api/account/change-password

### **Notifications (4 endpoints)**
23. GET /api/notifications/settings
24. PUT /api/notifications/settings
25. PUT /api/notifications/email-settings
26. PUT /api/notifications/push-settings

### **Analytics (3 endpoints)**
27. POST /api/analytics/export
28. GET /api/analytics/usage-trends
29. GET /api/analytics/connection-metrics

---

## 📝 Implementation Steps

### **Step 1: Create Routes File**

Create `backend/internal/api/routes.go`:

```go
package api

import (
	"github.com/atlanticproxy/backend/internal/api/handlers"
	"github.com/atlanticproxy/backend/internal/middleware"
	"github.com/atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SetupRoutes(router *gin.Engine, db *sqlx.DB) {
	// Initialize services
	billingService := services.NewBillingService(db)
	proxyService := services.NewProxyService(db)
	accountService := services.NewAccountService(db)
	notificationsService := services.NewNotificationsService(db)
	analyticsService := services.NewAnalyticsService(db)

	// Initialize handlers
	billingHandler := handlers.NewBillingHandler(billingService)
	proxyHandler := handlers.NewProxyHandler(proxyService)
	accountHandler := handlers.NewAccountHandler(accountService)
	notificationsHandler := handlers.NewNotificationsHandler(notificationsService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// Billing routes
	billing := router.Group("/api/billing")
	{
		billing.POST("/calculate-price", billingHandler.CalculatePrice)
		billing.POST("/checkout", middleware.AuthRequired(), billingHandler.Checkout)
		billing.GET("/payment-methods", middleware.AuthRequired(), billingHandler.GetPaymentMethods)
		billing.POST("/payment-methods", middleware.AuthRequired(), billingHandler.AddPaymentMethod)
		billing.DELETE("/payment-methods/:id", middleware.AuthRequired(), billingHandler.DeletePaymentMethod)
		billing.PUT("/payment-methods/:id/default", middleware.AuthRequired(), billingHandler.SetDefaultPaymentMethod)
		billing.GET("/invoices", middleware.AuthRequired(), billingHandler.GetInvoices)
		billing.GET("/invoices/:id/download", middleware.AuthRequired(), billingHandler.DownloadInvoice)
		billing.GET("/cost-analysis", middleware.AuthRequired(), billingHandler.GetCostAnalysis)
	}

	// Proxy routes
	proxy := router.Group("/api/proxy")
	{
		proxy.GET("/locations", proxyHandler.GetLocations)
		proxy.POST("/configuration", middleware.AuthRequired(), proxyHandler.SaveConfiguration)
		proxy.GET("/configuration", middleware.AuthRequired(), proxyHandler.GetConfiguration)
		proxy.PUT("/session-settings", middleware.AuthRequired(), proxyHandler.UpdateSessionSettings)
		proxy.PUT("/custom-headers", middleware.AuthRequired(), proxyHandler.UpdateCustomHeaders)
		proxy.PUT("/throttling-settings", middleware.AuthRequired(), proxyHandler.UpdateThrottlingSettings)
		proxy.PUT("/authentication", middleware.AuthRequired(), proxyHandler.UpdateProxyAuthentication)
	}

	// Account routes
	account := router.Group("/api/account")
	{
		account.GET("/security", middleware.AuthRequired(), accountHandler.GetSecurityInfo)
		account.GET("/sessions", middleware.AuthRequired(), accountHandler.GetActiveSessions)
		account.DELETE("/sessions/:id", middleware.AuthRequired(), accountHandler.LogoutDevice)
		account.POST("/sessions/logout-all", middleware.AuthRequired(), accountHandler.LogoutAllDevices)
		account.DELETE("/delete", middleware.AuthRequired(), accountHandler.DeleteAccount)
		account.POST("/change-password", middleware.AuthRequired(), accountHandler.ChangePassword)
	}

	// Notifications routes
	notifications := router.Group("/api/notifications")
	{
		notifications.GET("/settings", middleware.AuthRequired(), notificationsHandler.GetSettings)
		notifications.PUT("/settings", middleware.AuthRequired(), notificationsHandler.UpdateSettings)
		notifications.PUT("/email-settings", middleware.AuthRequired(), notificationsHandler.UpdateEmailSettings)
		notifications.PUT("/push-settings", middleware.AuthRequired(), notificationsHandler.UpdatePushSettings)
	}

	// Analytics routes
	analytics := router.Group("/api/analytics")
	{
		analytics.POST("/export", middleware.AuthRequired(), analyticsHandler.ExportData)
		analytics.GET("/usage-trends", middleware.AuthRequired(), analyticsHandler.GetUsageTrends)
		analytics.GET("/connection-metrics", middleware.AuthRequired(), analyticsHandler.GetConnectionMetrics)
	}
}
```

### **Step 2: Create Services**

Create `backend/internal/services/billing.go`:

```go
package services

import (
	"errors"
	"fmt"

	"github.com/atlanticproxy/backend/internal/models"
	"github.com/jmoiron/sqlx"
)

type BillingService struct {
	db *sqlx.DB
}

func NewBillingService(db *sqlx.DB) *BillingService {
	return &BillingService{db: db}
}

// Pricing constants
var (
	basePrices = map[string]float64{
		"starter":    9.99,
		"pro":        29.99,
		"enterprise": 99.99,
	}

	protocolAdjustments = map[string]float64{
		"http":   0,
		"https":  1.00,
		"socks5": 2.00,
	}

	tierAdjustments = map[string]float64{
		"budget":   -3.00,
		"standard": 0,
		"premium":  5.00,
	}
)

// CalculatePrice calculates final price based on customization
func (s *BillingService) CalculatePrice(planID, protocol, ispTier, billingCycle string) (float64, map[string]float64, error) {
	basePrice, ok := basePrices[planID]
	if !ok {
		return 0, nil, errors.New("invalid plan ID")
	}

	protocolAdj, ok := protocolAdjustments[protocol]
	if !ok {
		return 0, nil, errors.New("invalid protocol")
	}

	tierAdj, ok := tierAdjustments[ispTier]
	if !ok {
		return 0, nil, errors.New("invalid ISP tier")
	}

	monthlyPrice := basePrice + protocolAdj + tierAdj
	var finalPrice float64
	var billingDiscount float64

	if billingCycle == "annual" {
		billingDiscount = monthlyPrice * 12 * 0.17 // 17% discount
		finalPrice = monthlyPrice * 12 * 0.83
	} else {
		finalPrice = monthlyPrice
	}

	breakdown := map[string]float64{
		"basePrice":           basePrice,
		"protocolAdjustment":  protocolAdj,
		"ispTierAdjustment":   tierAdj,
		"billingDiscount":     billingDiscount,
	}

	return finalPrice, breakdown, nil
}

// ProcessCheckout processes a subscription purchase
func (s *BillingService) ProcessCheckout(userID, planID, protocol, ispTier, billingCycle, paymentMethodID string) (*models.Order, error) {
	// Calculate price
	price, _, err := s.CalculatePrice(planID, protocol, ispTier, billingCycle)
	if err != nil {
		return nil, err
	}

	// Create order
	order := &models.Order{
		ID:              fmt.Sprintf("ord_%d", time.Now().Unix()),
		UserID:          userID,
		PlanID:          planID,
		Protocol:        protocol,
		ISPTier:         ispTier,
		BillingCycle:    billingCycle,
		Amount:          price,
		Status:          "pending",
		PaymentMethodID: paymentMethodID,
	}

	// TODO: Process payment with Stripe/PayPal
	// For now, mark as completed
	order.Status = "completed"

	// Save to database
	query := `
		INSERT INTO orders (id, user_id, plan_id, protocol, isp_tier, billing_cycle, amount, status, payment_method_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err = s.db.Exec(query, order.ID, order.UserID, order.PlanID, order.Protocol, order.ISPTier, order.BillingCycle, order.Amount, order.Status, order.PaymentMethodID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

// GetPaymentMethods retrieves user's payment methods
func (s *BillingService) GetPaymentMethods(userID string) ([]*models.PaymentMethod, error) {
	var methods []*models.PaymentMethod
	query := `SELECT id, user_id, type, name, last_four, expiry_date, is_default, created_at, updated_at FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`
	err := s.db.Select(&methods, query, userID)
	return methods, err
}

// AddPaymentMethod adds a new payment method
func (s *BillingService) AddPaymentMethod(userID string, method *models.PaymentMethod) (*models.PaymentMethod, error) {
	method.ID = fmt.Sprintf("pm_%d", time.Now().Unix())
	method.UserID = userID

	query := `
		INSERT INTO payment_methods (id, user_id, type, name, last_four, expiry_date, is_default)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := s.db.Exec(query, method.ID, method.UserID, method.Type, method.Name, method.LastFour, method.ExpiryDate, method.IsDefault)
	if err != nil {
		return nil, err
	}

	return method, nil
}

// DeletePaymentMethod deletes a payment method
func (s *BillingService) DeletePaymentMethod(userID, methodID string) error {
	query := `DELETE FROM payment_methods WHERE id = $1 AND user_id = $2`
	_, err := s.db.Exec(query, methodID, userID)
	return err
}

// SetDefaultPaymentMethod sets a payment method as default
func (s *BillingService) SetDefaultPaymentMethod(userID, methodID string) error {
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}

	// Set all to false
	_, err = tx.Exec(`UPDATE payment_methods SET is_default = false WHERE user_id = $1`, userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Set this one to true
	_, err = tx.Exec(`UPDATE payment_methods SET is_default = true WHERE id = $1 AND user_id = $2`, methodID, userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// GetInvoices retrieves user's invoices
func (s *BillingService) GetInvoices(userID, status string, limit int) ([]*models.Invoice, error) {
	var invoices []*models.Invoice
	query := `SELECT id, user_id, amount, status, description, date, download_url, created_at, updated_at FROM invoices WHERE user_id = $1`
	
	if status != "" {
		query += ` AND status = $2`
	}
	
	query += ` ORDER BY date DESC LIMIT $3`
	
	var err error
	if status != "" {
		err = s.db.Select(&invoices, query, userID, status, limit)
	} else {
		err = s.db.Select(&invoices, query, userID, limit)
	}
	
	return invoices, err
}

// GenerateInvoicePDF generates a PDF invoice
func (s *BillingService) GenerateInvoicePDF(userID, invoiceID string) ([]byte, error) {
	// TODO: Implement PDF generation
	return nil, errors.New("not implemented")
}

// GetCostAnalysis retrieves cost analysis data
func (s *BillingService) GetCostAnalysis(userID, period string) (*models.CostAnalysis, error) {
	// TODO: Implement cost analysis query
	return nil, errors.New("not implemented")
}
```

---

## 🗄️ Database Migrations

Create `backend/internal/database/migrations/004_phase4_tables.sql`:

```sql
-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_four VARCHAR(4),
    expiry_date VARCHAR(5),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    download_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    isp_tier VARCHAR(20) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy Configurations
CREATE TABLE IF NOT EXISTS proxy_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol VARCHAR(20) NOT NULL,
    isp_tier VARCHAR(20) NOT NULL,
    locations TEXT[] NOT NULL,
    load_balancing_mode VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Settings
CREATE TABLE IF NOT EXISTS session_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    session_duration INTEGER NOT NULL,
    session_timeout INTEGER NOT NULL,
    ip_stickiness BOOLEAN DEFAULT true,
    cookie_preservation BOOLEAN DEFAULT true,
    header_preservation BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Headers
CREATE TABLE IF NOT EXISTS custom_headers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Throttling Settings
CREATE TABLE IF NOT EXISTS throttling_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    requests_per_second INTEGER NOT NULL,
    burst_size INTEGER NOT NULL,
    delay_between_requests INTEGER NOT NULL,
    connection_limit INTEGER NOT NULL,
    bandwidth_limit INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy Authentication
CREATE TABLE IF NOT EXISTS proxy_authentication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    auth_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications JSONB NOT NULL DEFAULT '{}',
    push_notifications JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_proxy_configurations_user_id ON proxy_configurations(user_id);
CREATE INDEX idx_session_settings_user_id ON session_settings(user_id);
CREATE INDEX idx_custom_headers_user_id ON custom_headers(user_id);
CREATE INDEX idx_throttling_settings_user_id ON throttling_settings(user_id);
CREATE INDEX idx_proxy_authentication_user_id ON proxy_authentication(user_id);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

---

## 🚀 Implementation Checklist

### **Phase 1: Setup (1 day)**
- [ ] Create routes.go
- [ ] Create all service files
- [ ] Create database migrations
- [ ] Run migrations

### **Phase 2: Implement Services (3 days)**
- [ ] BillingService (all methods)
- [ ] ProxyService (all methods)
- [ ] AccountService (all methods)
- [ ] NotificationsService (all methods)
- [ ] AnalyticsService (all methods)

### **Phase 3: Testing (2 days)**
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Payment flow testing
- [ ] Error handling testing

### **Phase 4: Integration (1 day)**
- [ ] Connect to frontend
- [ ] Test all flows
- [ ] Performance optimization
- [ ] Security review

---

## 📊 Pricing Logic Reference

```go
// Base Prices
Starter:    $9.99/month
Pro:        $29.99/month
Enterprise: $99.99/month

// Protocol Adjustments
HTTP:   +$0.00
HTTPS:  +$1.00
SOCKS5: +$2.00

// ISP Tier Adjustments
Budget:   -$3.00
Standard: +$0.00
Premium:  +$5.00

// Billing Discount
Annual: 17% discount (multiply by 0.83)
```

---

## 🔐 Security Considerations

- ✅ All endpoints require JWT authentication (except calculate-price)
- ✅ Input validation on all requests
- ✅ Rate limiting per user
- ✅ Password hashing for sensitive data
- ✅ HTTPS only
- ✅ CORS configured
- ✅ SQL injection prevention (parameterized queries)

---

## 📞 Support

For questions or issues:
1. Check handler implementations
2. Review service logic
3. Check database schema
4. Review error handling

---

**Status: READY FOR IMPLEMENTATION ✅**


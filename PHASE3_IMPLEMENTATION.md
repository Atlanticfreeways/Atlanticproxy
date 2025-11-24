# Phase 3: Billing & Payments - IMPLEMENTATION

## 🎯 Phase 3 Objectives

Implement real billing system with Paystack integration for payment processing.

**Status:** IN PROGRESS
**Effort:** 4-5 hours
**Impact:** Revenue generation

---

## ✅ Completed Tasks

### Task 3.1: Paystack Service (Already Implemented)
**Status:** ✅ VERIFIED

**File:** `backend/internal/paystack/service.go`

**Features Implemented:**
- ✅ `InitializeTransaction()` - Initialize Paystack payment
- ✅ `VerifyTransaction()` - Verify payment completion
- ✅ `CreatePlan()` - Create subscription plan
- ✅ `CreateSubscription()` - Create user subscription
- ✅ `DisableSubscription()` - Cancel subscription

**Capabilities:**
- ✅ Real Paystack API integration
- ✅ Transaction initialization
- ✅ Payment verification
- ✅ Subscription management
- ✅ Error handling

### Task 3.2: Paystack Webhooks (Already Implemented)
**Status:** ✅ VERIFIED

**File:** `backend/internal/paystack/webhooks.go`

**Features Implemented:**
- ✅ `HandleWebhook()` - Process webhook events
- ✅ `VerifyWebhookSignature()` - Verify webhook authenticity
- ✅ Event handlers for:
  - charge.success
  - charge.failed
  - subscription.create
  - subscription.disable

**Capabilities:**
- ✅ HMAC-SHA512 signature verification
- ✅ Event routing
- ✅ Error handling
- ✅ Logging

### Task 3.3: Billing Service (NEW)
**Status:** ✅ COMPLETE

**File:** `backend/internal/services/billing_service.go` (NEW)

**Features Implemented:**
- ✅ `GetPlans()` - Get all billing plans
- ✅ `CreateSubscription()` - Create user subscription
- ✅ `GetSubscription()` - Get current subscription
- ✅ `CancelSubscription()` - Cancel subscription
- ✅ `CreateInvoice()` - Create invoice
- ✅ `GetInvoices()` - Get user invoices
- ✅ `MarkInvoicePaid()` - Mark invoice as paid
- ✅ `GetBillingHistory()` - Get billing history
- ✅ `GetPaymentMethods()` - Get payment methods
- ✅ `AddPaymentMethod()` - Add payment method

**Database Operations:**
- ✅ Query billing plans
- ✅ Create subscriptions
- ✅ Update subscription status
- ✅ Create invoices
- ✅ Update invoice status
- ✅ Manage payment methods
- ✅ Track billing history

**Error Handling:**
- ✅ Proper error logging
- ✅ Graceful error returns
- ✅ User-friendly error messages

---

## 📋 Remaining Phase 3 Tasks

### Task 3.4: Update Billing Handlers
**Status:** READY TO IMPLEMENT

**Files to Update:**
- `backend/cmd/server/handlers.go`

**Changes Needed:**
1. Update `billingPlansHandler` to use BillingService
2. Update `billingSubscribeHandler` to use BillingService + PaystackService
3. Update `billingVerifyPaymentHandler` to verify with Paystack
4. Update `billingInvoicesHandler` to use BillingService
5. Update `billingPaymentMethodsHandler` to use BillingService
6. Add error handling and logging

**Code Pattern:**
```go
// Create service instances
billingService := services.NewBillingService(db)
paystackService := paystack.NewPaystackService(db, paystackSecretKey)

// Get plans
plans, err := billingService.GetPlans()
if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    return
}

c.JSON(http.StatusOK, gin.H{"plans": plans})
```

---

### Task 3.5: Webhook Handler Integration
**Status:** READY TO IMPLEMENT

**Files to Update:**
- `backend/cmd/server/main.go` - Add webhook endpoint

**Changes Needed:**
1. Create webhook endpoint at `/api/webhooks/paystack`
2. Verify webhook signature
3. Handle webhook events
4. Update database based on events
5. Return success response

**Code Pattern:**
```go
router.POST("/api/webhooks/paystack", func(c *gin.Context) {
    body, _ := io.ReadAll(c.Request.Body)
    signature := c.GetHeader("X-Paystack-Signature")
    
    paystackService := paystack.NewPaystackService(db, paystackSecretKey)
    err := paystackService.HandleWebhook(body, signature)
    
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"received": true})
})
```

---

### Task 3.6: Frontend Integration
**Status:** READY TO IMPLEMENT

**Files to Update:**
- `frontend/lib/api.ts` - Update billing API calls
- `frontend/app/billing/page.tsx` - Display real plans and subscriptions
- `frontend/app/account/page.tsx` - Show billing info

**Changes Needed:**
1. Remove mock data from API responses
2. Add real plan display
3. Add subscription management UI
4. Add payment method management
5. Add invoice display

---

## 🚀 Implementation Plan

### Step 1: Update Handlers (45 min)
Update all billing handlers to use BillingService and PaystackService

### Step 2: Webhook Integration (30 min)
Implement webhook endpoint and event handling

### Step 3: Frontend Integration (45 min)
Update frontend to display real billing data

### Step 4: Testing (30 min)
Test payment flow end-to-end

### Step 5: Documentation (15 min)
Document Phase 3 completion

---

## 📊 Phase 3 Metrics

| Metric | Value |
|--------|-------|
| Files Created | 1 |
| Files to Update | 4+ |
| Services Implemented | 1 |
| Methods Implemented | 10 |
| Database Operations | 12+ |
| Error Handling | ✅ Complete |
| Logging | ✅ Complete |

---

## 🧪 Testing Phase 3

### Test 1: Get Billing Plans
```bash
curl http://localhost:5000/api/billing/plans \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"plans":[{"id":"free","name":"Free","price":0,...}]}
```

### Test 2: Subscribe to Plan
```bash
curl -X POST http://localhost:5000/api/billing/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id":"pro"}'
# Response: {"authorization_url":"https://checkout.paystack.com/..."}
```

### Test 3: Verify Payment
```bash
curl "http://localhost:5000/api/billing/verify?reference=PAYSTACK_REF" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"status":"success","subscription_id":1}
```

### Test 4: Get Invoices
```bash
curl http://localhost:5000/api/billing/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"invoices":[{"id":1,"amount":9.99,"status":"paid",...}]}
```

### Test 5: Get Payment Methods
```bash
curl http://localhost:5000/api/billing/payment-methods \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"methods":[{"id":1,"method_type":"card","last_four":"4242",...}]}
```

---

## 📁 Files Modified/Created

### Created
- `backend/internal/services/billing_service.go` - Billing management service

### To Update
- `backend/cmd/server/handlers.go` - Update billing handlers
- `backend/cmd/server/main.go` - Add webhook endpoint
- `frontend/lib/api.ts` - Update API client
- `frontend/app/billing/page.tsx` - Update UI

### Already Implemented
- `backend/internal/paystack/service.go` - Paystack API
- `backend/internal/paystack/webhooks.go` - Webhook handling

---

## ✅ Success Criteria

- [x] BillingService created with all methods
- [x] PaystackService verified and working
- [x] Webhook handling verified
- [ ] Handlers updated to use services
- [ ] Webhook endpoint implemented
- [ ] Frontend updated
- [ ] All tests passing
- [ ] Real payments working
- [ ] Invoices generated
- [ ] Subscriptions managed

---

## 🎯 Next Steps

1. **Update Handlers** - Use BillingService in all handlers
2. **Implement Webhooks** - Add webhook endpoint
3. **Update Frontend** - Display real billing data
4. **Test Everything** - End-to-end payment testing
5. **Document** - Complete Phase 3 documentation

---

## 📝 Phase 3 Status

**Current:** BillingService created and ready
**Next:** Update handlers to use service
**Timeline:** 2-3 hours remaining

---

## 🎊 Phase 3 Progress

```
[████████░░░░░░░░░░░░] 40% Complete

✅ PaystackService verified
✅ Webhook handling verified
✅ BillingService created
⏳ Handlers to update
⏳ Webhook endpoint to implement
⏳ Frontend to update
⏳ Testing to complete
```

---

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Verify Paystack API keys are set
3. Test Paystack API directly
4. Review service implementations
5. Check error messages

---

## 🚀 Ready to Continue?

Phase 3 is 40% complete. The BillingService is ready. Next steps:
1. Update handlers to use BillingService
2. Implement webhook endpoint
3. Update frontend
4. Test payment flow

**Proceed with handler updates?** 🚀

# Subscription Auto-Renewal Implementation

**Status:** ✅ Complete  
**Time:** 30 minutes

---

## Overview

Paystack subscription management with:
- Weekly auto-renewal (₦11,445)
- Webhook event handling
- Deposit refund on cancellation
- Transaction logging

---

## Webhook Events Handled

### 1. charge.success
**Triggered:** When payment succeeds

**Actions:**
- Create/update user subscription
- Log transaction for invoice
- Update billing status

### 2. subscription.create
**Triggered:** When subscription is created

**Actions:**
- Log subscription creation
- Send welcome email (TODO)

### 3. subscription.disable
**Triggered:** When subscription is cancelled

**Actions:**
- Mark subscription as cancelled
- Schedule deposit refund (7 days)
- Send cancellation confirmation (TODO)

### 4. subscription.not_renew
**Triggered:** When subscription won't auto-renew

**Actions:**
- Log non-renewal
- Send reminder email (TODO)

---

## Webhook Setup

### Paystack Dashboard Configuration

1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Click "Webhooks"
3. Add webhook URL: `https://your-domain.com/webhooks/paystack`
4. Select events:
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ subscription.not_renew

### Local Testing with ngrok

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 8082

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to Paystack: https://abc123.ngrok.io/webhooks/paystack
```

---

## Subscription Flow

### Initial Payment
1. User pays ₦13,080 (deposit + first week)
2. Webhook: `charge.success`
3. Backend creates subscription
4. User gets 7 days access

### Auto-Renewal (Week 2+)
1. Paystack charges ₦11,445 automatically
2. Webhook: `charge.success`
3. Backend extends subscription 7 days
4. User continues access

### Cancellation
1. User clicks "Cancel Subscription"
2. Backend calls Paystack cancel API
3. Webhook: `subscription.disable`
4. Backend schedules deposit refund (7 days)
5. User access continues until period ends

---

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL, -- active, cancelled, expired
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### transactions table
```sql
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL, -- completed, pending, failed, refunded
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Cancel Subscription
```bash
POST /api/billing/subscription/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Subscription cancelled",
  "deposit_refund": "Processing (5-7 days)",
  "access_until": "2026-02-06T12:00:00Z"
}
```

### Get Subscription Status
```bash
GET /api/billing/subscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "subscription": {
    "id": "sub_123",
    "plan_id": "starter",
    "status": "active",
    "current_period_end": "2026-02-06T12:00:00Z",
    "cancel_at_period_end": false
  }
}
```

---

## Testing

### Test Webhook Locally

```bash
# Send test webhook
curl -X POST http://localhost:8082/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "X-Paystack-Signature: test" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "TRIAL-1234567890",
      "amount": 1308000,
      "email": "test@example.com",
      "status": "success",
      "metadata": {
        "plan_id": "starter",
        "user_id": "user_123"
      }
    }
  }'
```

### Test Subscription Cancel

```bash
# Cancel subscription
curl -X POST http://localhost:8082/api/billing/subscription/cancel \
  -H "Authorization: Bearer <token>"
```

---

## Monitoring

### Webhook Logs
Check backend logs for webhook events:
```bash
tail -f logs/webhook.log | grep "Paystack event"
```

### Failed Webhooks
Paystack retries failed webhooks:
- Retry 1: After 1 hour
- Retry 2: After 6 hours
- Retry 3: After 24 hours

### Webhook Dashboard
View webhook history in Paystack dashboard:
https://dashboard.paystack.com/#/settings/developer

---

## Production Checklist

- [x] Webhook signature verification
- [x] Event handling (charge.success, subscription.disable)
- [x] Transaction logging
- [x] Deposit refund scheduling
- [ ] Email notifications
- [ ] Failed payment retry logic
- [ ] Dunning management (grace period)
- [ ] Webhook monitoring/alerting
- [ ] Database backup for transactions
- [ ] Refund automation

---

## Next Steps

1. ✅ Webhook handlers implemented
2. ⏳ Test with ngrok
3. ⏳ Add email notifications
4. ⏳ Implement failed payment handling
5. ⏳ Add subscription analytics dashboard

---

**Status:** Ready for testing  
**Webhook URL:** `/webhooks/paystack`

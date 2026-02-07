# Paystack Payment Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd scripts/proxy-client
go run ./cmd/service
```
Backend runs on: http://localhost:8082

### 2. Start Frontend
```bash
cd atlantic-dashboard
npm run dev
```
Frontend runs on: http://localhost:3000

### 3. Test Payment Flow

#### Step 1: Visit Trial Page
Open: http://localhost:3000/trial

#### Step 2: Enter Email
- Enter any email (e.g., test@example.com)
- Click "Continue to Payment - ₦13,080"

#### Step 3: Paystack Payment Page
You'll be redirected to Paystack's payment page

**Test Card Details:**
- Card Number: `4084084084084081`
- Expiry: Any future date (e.g., 12/25)
- CVV: `408`
- PIN: `0000`

#### Step 4: Complete Payment
- Enter card details
- Click "Pay ₦13,080"
- Enter PIN when prompted

#### Step 5: Verification
- Redirected to: http://localhost:3000/payment/callback
- Payment verified automatically
- Redirected to dashboard

---

## Payment Breakdown

| Item | NGN (₦) | USD ($) |
|------|---------|---------|
| Refundable Deposit | ₦1,635 | $1.00 |
| First Week (10GB) | ₦11,445 | $6.99 |
| **Total** | **₦13,080** | **$7.99** |

---

## Test Cards

### Success
- **Card:** 4084084084084081
- **CVV:** 408
- **PIN:** 0000

### Insufficient Funds
- **Card:** 5060666666666666666
- **CVV:** 123
- **PIN:** 0000

### Declined
- **Card:** 5060666666666666666
- **CVV:** 123
- **PIN:** 0000

---

## API Endpoints

### Initialize Payment
```bash
POST http://localhost:8082/api/billing/trial/start
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "TRIAL-1234567890"
}
```

### Verify Payment
```bash
GET http://localhost:8082/api/billing/verify?reference=TRIAL-1234567890
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment verified",
  "amount": 1308000
}
```

### Get Billing Status
```bash
GET http://localhost:8082/api/billing/status
```

**Response:**
```json
{
  "plan": "starter",
  "status": "active",
  "next_billing_date": "2026-02-06T12:00:00Z",
  "data_used": 2684354560,
  "data_limit": 10737418240,
  "deposit_amount": 1.00,
  "deposit_status": "held"
}
```

---

## Troubleshooting

### Backend not starting
```bash
# Check if port 8082 is in use
lsof -i :8082

# Kill process if needed
kill -9 <PID>
```

### Frontend not starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Payment initialization fails
- Check Paystack API key in `paystack.go`
- Verify internet connection
- Check backend logs for errors

### Payment verification fails
- Check reference parameter in URL
- Verify backend is running
- Check Paystack dashboard for transaction status

---

## Next Steps

1. ✅ Test successful payment
2. ✅ Test failed payment
3. ⏳ Implement webhook for subscription renewal
4. ⏳ Add email notifications
5. ⏳ Store transactions in database
6. ⏳ Implement deposit refund automation

---

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update callback URL to production domain
- [ ] Set up webhook endpoint
- [ ] Configure webhook secret
- [ ] Add transaction logging
- [ ] Add error monitoring
- [ ] Test with real cards
- [ ] Set up email notifications
- [ ] Configure deposit refund automation
- [ ] Add payment retry logic

---

**Status:** Ready for testing  
**Time to test:** 5-10 minutes

# AtlanticProxy API Reference

**Base URL:** `http://localhost:8082`  
**Server Port:** 8082 (API) | 8080 (HTTP Proxy) | 1080 (SOCKS5)  
**Authentication:** JWT Bearer Token (where required)

---

## Core Proxy Control

### `POST /connect`
Connect to the proxy service.

**Response:**
```json
{
  "status": "connected",
  "message": "Proxy connected successfully"
}
```

---

### `POST /disconnect`
Disconnect from the proxy service.

**Response:**
```json
{
  "status": "disconnected"
}
```

---

### `GET /status`
Get current proxy connection status.

**Response:**
```json
{
  "connected": true,
  "proxy_address": "127.0.0.1:8080",
  "socks_address": "127.0.0.1:1080"
}
```

---

## Kill Switch

### `POST /killswitch`
Enable/disable network kill switch.

**Request:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "enabled": true,
  "message": "Kill switch updated"
}
```

---

### `GET /killswitch`
Get kill switch status.

**Response:**
```json
{
  "enabled": false
}
```

---

## Health & Monitoring

### `GET /health`
Service health check.

**Response:**
```json
{
  "status": "ok"
}
```

**Headers:**
- `X-Request-ID`: Unique request identifier for tracing

---

### `GET /ws`
WebSocket endpoint for real-time status updates.

**Protocol:** WebSocket  
**Events:** Connection status, quota updates, kill switch changes

---

## Ad-Blocking

### `GET /adblock/whitelist`
Get whitelisted domains.

**Response:**
```json
{
  "whitelist": ["example.com", "trusted-site.com"]
}
```

---

### `POST /adblock/whitelist`
Add domain to whitelist.

**Request:**
```json
{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "message": "Domain added to whitelist"
}
```

---

### `DELETE /adblock/whitelist`
Remove domain from whitelist.

**Request:**
```json
{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "message": "Domain removed from whitelist"
}
```

---

### `GET /adblock/custom`
Get custom blocking rules.

**Response:**
```json
{
  "rules": ["ads.tracker.com", "malware.site.com"]
}
```

---

### `POST /adblock/custom`
Add custom blocking rules.

**Request:**
```json
{
  "rules": ["ads.example.com", "tracker.site.com"]
}
```

**Response:**
```json
{
  "message": "Custom rules updated"
}
```

---

### `POST /adblock/refresh`
Refresh ad-block lists from remote sources.

**Response:**
```json
{
  "message": "Blocklists refreshed successfully"
}
```

---

### `GET /adblock/stats`
Get ad-blocking statistics.

**Response:**
```json
{
  "ads_blocked": 1523,
  "threats_blocked": 42,
  "total_requests": 5000
}
```

---

## Proxy Rotation

### `GET /api/rotation/config`
Get rotation configuration.

**Response:**
```json
{
  "enabled": true,
  "interval_seconds": 300,
  "strategy": "round-robin"
}
```

---

### `POST /api/rotation/config`
Update rotation configuration.

**Request:**
```json
{
  "enabled": true,
  "interval_seconds": 600,
  "strategy": "random"
}
```

**Response:**
```json
{
  "message": "Rotation config updated"
}
```

---

### `POST /api/rotation/session/new`
Force new proxy session (rotate immediately).

**Response:**
```json
{
  "session_id": "abc123",
  "proxy_ip": "45.67.89.123"
}
```

---

### `GET /api/rotation/session/current`
Get current proxy session details.

**Response:**
```json
{
  "session_id": "abc123",
  "proxy_ip": "45.67.89.123",
  "country": "US",
  "started_at": "2026-01-01T14:00:00Z"
}
```

---

### `GET /api/rotation/stats`
Get rotation statistics.

**Response:**
```json
{
  "total_rotations": 145,
  "success_rate": 98.5,
  "avg_session_duration": 285
}
```

---

### `POST /api/rotation/geo`
Set geographic location for proxy.

**Request:**
```json
{
  "country": "US",
  "city": "New York"
}
```

**Response:**
```json
{
  "message": "Geo location updated",
  "country": "US",
  "city": "New York"
}
```

---

## Billing & Subscriptions

### `GET /api/billing/plans`
Get available subscription plans (localized pricing).

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price_monthly": 9,
      "display_price_monthly": 13635,
      "currency": "NGN",
      "symbol": "₦",
      "data_quota_gb": 0.5,
      "request_limit": 1000,
      "concurrent_connections": 5,
      "features": ["Basic Support", "Shared Pool"]
    }
  ]
}
```

---

### `GET /api/billing/subscription`
Get current user's subscription.

**Auth:** Required  
**Response:**
```json
{
  "subscription": {
    "id": "sub_123",
    "plan_id": "personal",
    "status": "active",
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-02-01T00:00:00Z",
    "auto_renew": true
  },
  "plan": {
    "id": "personal",
    "name": "Personal",
    "price_monthly": 29
  }
}
```

---

### `POST /api/billing/subscribe`
Update subscription plan.

**Auth:** Required  
**Request:**
```json
{
  "plan_id": "personal"
}
```

**Response:**
```json
{
  "message": "Subscription updated",
  "subscription": { ... }
}
```

---

### `POST /api/billing/checkout`
Create checkout session for payment.

**Auth:** Required  
**Request:**
```json
{
  "plan_id": "personal",
  "billing_cycle": "monthly",
  "payment_method": "paystack"
}
```

**Response:**
```json
{
  "checkout_url": "https://paystack.com/pay/abc123",
  "reference": "ref_abc123"
}
```

---

### `POST /api/billing/cancel`
Cancel subscription auto-renewal.

**Auth:** Required  
**Response:**
```json
{
  "message": "Subscription canceled"
}
```

---

### `GET /api/billing/usage`
Get current usage statistics.

**Auth:** Required  
**Response:**
```json
{
  "data_transferred_mb": 245.5,
  "requests_made": 3420,
  "ads_blocked": 1523,
  "threats_blocked": 42,
  "quota_remaining_mb": 254.5
}
```

---

### `GET /api/billing/invoices/:id`
Download invoice PDF.

**Auth:** Required  
**Parameters:**
- `id` - Transaction ID or "test" for sample

**Response:** PDF file (application/pdf)

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=invoice_{id}.pdf`

---

## Authentication

### `POST /api/auth/register`
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### `POST /api/auth/login`
Login to existing account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### `GET /api/auth/me`
Get current user profile.

**Auth:** Required  
**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### `POST /api/auth/logout`
Logout current user.

**Auth:** Required  
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Webhooks

### `POST /webhooks/paystack`
Paystack payment webhook (internal use).

**Headers:**
- `X-Paystack-Signature`: HMAC-SHA512 signature

**Request:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_abc123",
    "amount": 1363500,
    "email": "user@example.com",
    "metadata": {
      "plan_id": "personal",
      "user_id": "user_123"
    }
  }
}
```

**Response:** `200 OK`

---

## Rate Limiting

All API endpoints are rate-limited based on subscription plan:

| Plan | Rate Limit |
|------|------------|
| **Unauthenticated** | 100 req/min (IP-based) |
| **Starter** | 10 req/sec |
| **Personal** | 50 req/sec |
| **Team** | 500 req/sec |
| **Enterprise** | 10,000 req/sec |

**Rate Limit Headers:**
- `X-Request-ID`: Unique request identifier

**429 Response:**
```json
{
  "error": "Too many requests. Please upgrade your plan for higher limits."
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Token Expiry:** 24 hours  
**Refresh:** Re-login to get new token

---

## CORS

**Allowed Origin:** `http://localhost:3000`  
**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers:** Content-Type, Authorization

---

## Examples

### cURL - Get Plans
```bash
curl http://localhost:8082/api/billing/plans
```

### cURL - Login
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### cURL - Get Subscription (Authenticated)
```bash
curl http://localhost:8082/api/billing/subscription \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### cURL - Download Invoice
```bash
curl http://localhost:8082/api/billing/invoices/test \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o invoice.pdf
```

---

## Notes

- All timestamps are in RFC3339 format (ISO 8601)
- Currency amounts are localized based on detected region
- WebSocket endpoint provides real-time updates
- Health endpoint useful for monitoring/uptime checks
- Request IDs in headers enable request tracing in logs

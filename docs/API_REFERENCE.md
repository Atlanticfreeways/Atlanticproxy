# API Reference

**Last Updated:** February 14, 2026  
**Base URL:** `http://localhost:8082` (development)  
**Version:** 1.0.0

---

## 🔐 Authentication

All protected endpoints require JWT authentication via `Authorization` header.

```http
Authorization: Bearer <jwt_token>
```

**Token Expiration:** 24 hours  
**Refresh:** Re-login required

---

## 📋 Endpoints Overview

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Auth | 4 | Partial |
| Billing | 9 | Yes |
| Proxy | 6 | No |
| Rotation | 5 | Yes |
| Statistics | 3 | No |
| Servers | 2 | No |
| Activity | 1 | Yes |
| Settings | 2 | Yes |
| Ad-blocking | 7 | No |
| Security | 1 | Yes |
| Protocol | 1 | Yes |
| Locations | 1 | No |
| Webhooks | 1 | No |

**Total:** 43 endpoints

---

## 🔑 Authentication API

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "created_at": "2026-02-14T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Invalid email/password
- `409` - Email already exists

---

### POST /api/auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Missing fields

---

### GET /api/auth/me
Get current user information.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "created_at": "2026-02-14T10:00:00Z"
}
```

---

### POST /api/auth/logout
Logout current user.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## 💳 Billing API

### GET /api/billing/plans
Get all available pricing plans.

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price_cents": 699,
      "currency": "USD",
      "data_quota_mb": 10240,
      "request_limit": 10000,
      "concurrent_conns": 5,
      "features": ["HTTPS Only", "Kill Switch", "Ad-Blocking"]
    }
  ]
}
```

---

### GET /api/billing/subscription
Get current user's subscription.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "subscription": {
    "id": "sub_123",
    "plan_id": "personal",
    "status": "active",
    "start_date": "2026-02-01T00:00:00Z",
    "end_date": "2026-03-01T00:00:00Z",
    "auto_renew": true
  },
  "plan": {
    "id": "personal",
    "name": "Personal",
    "price_cents": 2900
  }
}
```

---

### POST /api/billing/checkout
Create checkout session for plan purchase.

**Auth:** Required

**Request:**
```json
{
  "plan_id": "personal",
  "email": "user@example.com",
  "method": "paystack",
  "currency": "USD"
}
```

**Response:** `200 OK`
```json
{
  "url": "https://checkout.paystack.com/...",
  "payment_id": "pay_123"
}
```

---

### GET /api/billing/usage
Get current usage statistics.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "period_start": "2026-02-01T00:00:00Z",
  "period_end": "2026-03-01T00:00:00Z",
  "data_transferred_bytes": 5368709120,
  "requests_made": 15420,
  "ads_blocked": 3240,
  "threats_blocked": 12,
  "active_connections": 3
}
```

---

### POST /api/billing/cancel
Cancel current subscription.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "message": "Subscription cancelled",
  "end_date": "2026-03-01T00:00:00Z"
}
```

---

### GET /api/billing/verify
Verify payment transaction.

**Query Parameters:**
- `reference` - Payment reference from Paystack

**Response:** `200 OK`
```json
{
  "status": "success",
  "subscription": {
    "id": "sub_123",
    "plan_id": "personal",
    "status": "active"
  }
}
```

---

## 🔄 Proxy API

### POST /connect
Connect to proxy service.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "proxy_password",
  "endpoint": "us-east-1"
}
```

**Response:** `200 OK`
```json
{
  "message": "Connected successfully"
}
```

---

### GET /status
Get current proxy connection status.

**Response:** `200 OK`
```json
{
  "connected": true,
  "ip_address": "192.168.1.100",
  "location": "New York, US",
  "isp": "Verizon",
  "asn": "AS701",
  "lat": 40.7128,
  "lon": -74.0060,
  "latency": 15,
  "protection_level": "High",
  "last_check": "2026-02-14T10:30:00Z"
}
```

---

### POST /disconnect
Disconnect from proxy service.

**Response:** `200 OK`
```json
{
  "message": "Disconnected successfully"
}
```

---

### GET /ws
WebSocket connection for real-time status updates.

**Protocol:** WebSocket  
**URL:** `ws://localhost:8082/ws`

**Messages:**
```json
// Status update
{
  "connected": true,
  "ip_address": "192.168.1.100",
  "location": "New York, US",
  "latency": 15
}

// Ping (client → server)
{"type": "ping"}

// Pong (server → client)
{"type": "pong"}
```

---

## 🔄 Rotation API

### GET /api/rotation/config
Get current rotation configuration.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "mode": "sticky-10min",
  "country": "US",
  "city": "New York",
  "state": "NY"
}
```

---

### POST /api/rotation/config
Update rotation configuration.

**Auth:** Required

**Request:**
```json
{
  "mode": "per-request",
  "country": "UK",
  "city": "London"
}
```

**Response:** `200 OK`
```json
{
  "message": "Configuration updated"
}
```

---

### GET /api/rotation/session/current
Get current rotation session.

**Response:** `200 OK`
```json
{
  "id": "sess_123",
  "created_at": "2026-02-14T10:00:00Z",
  "expires_at": "2026-02-14T10:10:00Z",
  "duration": 600,
  "ip": "192.168.1.100",
  "location": "New York, US"
}
```

---

### POST /api/rotation/session/new
Force new rotation session.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "session": {
    "id": "sess_124",
    "created_at": "2026-02-14T10:15:00Z",
    "ip": "192.168.1.101"
  }
}
```

---

### GET /api/rotation/stats
Get rotation statistics.

**Response:** `200 OK`
```json
{
  "total_rotations": 1523,
  "success_count": 1520,
  "failure_count": 3,
  "success_rate": 99.8,
  "geo_stats": {
    "US": 850,
    "UK": 420,
    "DE": 253
  },
  "hourly_stats": {
    "2026-02-14-10": 45,
    "2026-02-14-09": 52
  }
}
```

---

## 📊 Statistics API

### GET /api/statistics/hourly
Get hourly usage statistics.

**Response:** `200 OK`
```json
{
  "data": [
    {"hour": "2026-02-14-10", "count": 45},
    {"hour": "2026-02-14-09", "count": 52}
  ]
}
```

---

### GET /api/statistics/countries
Get usage by country.

**Response:** `200 OK`
```json
{
  "countries": [
    {"country": "US", "count": 850},
    {"country": "UK", "count": 420}
  ]
}
```

---

### GET /api/statistics/protocols
Get usage by protocol.

**Response:** `200 OK`
```json
{
  "protocols": [
    {"protocol": "HTTPS", "count": 1250, "percentage": 62.5},
    {"protocol": "SOCKS5", "count": 500, "percentage": 25.0}
  ]
}
```

---

## 🖥️ Servers API

### GET /api/servers/list
Get list of available proxy servers.

**Response:** `200 OK`
```json
{
  "servers": [
    {
      "id": "us-east-1",
      "name": "US East (New York)",
      "country": "United States",
      "city": "New York",
      "status": "online",
      "latency": 15,
      "load": 45,
      "protocol": "HTTPS"
    }
  ]
}
```

---

### GET /api/servers/status
Get specific server status.

**Query Parameters:**
- `id` - Server ID

**Response:** `200 OK`
```json
{
  "id": "us-east-1",
  "status": "online",
  "latency": 15,
  "load": 45
}
```

---

## 📝 Activity API

### GET /api/activity/log
Get user activity log.

**Auth:** Required

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20)
- `type` - Filter by type (optional)

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "id": "1",
      "timestamp": "2026-02-14T10:00:00Z",
      "type": "connection",
      "status": "success",
      "details": "Connected to US East server",
      "ip": "192.168.1.1",
      "location": "New York, US"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

---

## ⚙️ Settings API

### GET /api/settings
Get user settings.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "account": {
    "email": "user@example.com",
    "username": "user123"
  },
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  },
  "security": {
    "twoFactorEnabled": false,
    "sessions": [...]
  }
}
```

---

### POST /api/settings
Update user settings.

**Auth:** Required

**Request:**
```json
{
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Settings updated successfully"
}
```

---

## 🚫 Rate Limiting

### Rate Limits by Plan

| Plan | Rate Limit | Burst |
|------|------------|-------|
| Starter | 10 req/sec | 50 |
| PAYG | 10 req/sec | 50 |
| Personal | 50 req/sec | 200 |
| Team | 500 req/sec | 1000 |
| Enterprise | 10000 req/sec | 10000 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707912000
```

### Rate Limit Response
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**Status Code:** `429 Too Many Requests`

---

## ❌ Error Responses

### Standard Error Format
```json
{
  "error": "Error message here"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🔧 Testing

### Test Mode
Use test credentials for Paystack:
- **Test Card:** 4084084084084081
- **CVV:** 408
- **Expiry:** Any future date
- **PIN:** 0000

### Postman Collection
Coming soon...

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Get Usage (with auth):**
```bash
curl -X GET http://localhost:8082/api/billing/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**For complete implementation details, see the source code in `internal/api/`**

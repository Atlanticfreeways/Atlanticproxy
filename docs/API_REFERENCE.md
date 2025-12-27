# Atlantic Proxy API Reference

**Version:** 1.0.0  
**Base URL:** `https://api.atlanticproxy.com` (Production) | `http://localhost:8080` (Development)

---

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication via Bearer token.

**Header:**
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-25T10:00:00Z"
  }
}
```

**Error Codes:**
- `400` - Invalid input or validation error
- `409` - User already exists

---

#### Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Codes:**
- `400` - Invalid credentials
- `401` - Unauthorized

---

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Codes:**
- `401` - Unauthorized

---

#### Refresh Token
```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Codes:**
- `401` - Invalid refresh token

---

### Proxies

#### List Proxies
```
GET /api/proxies?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "proxy_123",
      "user_id": "user_123",
      "name": "US Proxy 1",
      "host": "proxy.example.com",
      "port": 8080,
      "protocol": "http",
      "status": "active",
      "created_at": "2025-11-25T10:00:00Z"
    }
  ],
  "total": 5
}
```

**Error Codes:**
- `401` - Unauthorized

---

#### Create Proxy
```
POST /api/proxies
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "US Proxy 1",
  "host": "proxy.example.com",
  "port": 8080,
  "protocol": "http",
  "username": "user",
  "password": "pass"
}
```

**Response (201):**
```json
{
  "id": "proxy_123",
  "user_id": "user_123",
  "name": "US Proxy 1",
  "host": "proxy.example.com",
  "port": 8080,
  "protocol": "http",
  "status": "active",
  "created_at": "2025-11-25T10:00:00Z"
}
```

**Error Codes:**
- `400` - Invalid input
- `401` - Unauthorized

---

#### Get Proxy
```
GET /api/proxies/{id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "proxy_123",
  "user_id": "user_123",
  "name": "US Proxy 1",
  "host": "proxy.example.com",
  "port": 8080,
  "protocol": "http",
  "status": "active",
  "created_at": "2025-11-25T10:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Proxy not found

---

#### Update Proxy
```
PUT /api/proxies/{id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Updated Proxy Name",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "id": "proxy_123",
  "name": "Updated Proxy Name",
  "status": "inactive",
  "updated_at": "2025-11-25T11:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Proxy not found

---

#### Delete Proxy
```
DELETE /api/proxies/{id}
Authorization: Bearer <token>
```

**Response (204):** No content

**Error Codes:**
- `401` - Unauthorized
- `404` - Proxy not found

---

#### Test Proxy
```
POST /api/proxies/{id}/test
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "latency": 45
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Proxy not found

---

### Analytics

#### Get Usage Analytics
```
GET /api/analytics/usage?proxy_id=proxy_123&start_date=2025-11-01&end_date=2025-11-25
Authorization: Bearer <token>
```

**Query Parameters:**
- `proxy_id` (optional) - Filter by proxy
- `start_date` (optional) - Start date (YYYY-MM-DD)
- `end_date` (optional) - End date (YYYY-MM-DD)

**Response (200):**
```json
{
  "total_requests": 10000,
  "total_bandwidth": 5120.5,
  "average_latency": 45.2,
  "data": [
    {
      "date": "2025-11-25",
      "requests": 500,
      "bandwidth": 256.5,
      "latency": 45.2
    }
  ]
}
```

**Error Codes:**
- `401` - Unauthorized

---

#### Get Performance Metrics
```
GET /api/analytics/metrics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "uptime": 99.95,
  "success_rate": 98.5,
  "average_response_time": 45.2
}
```

**Error Codes:**
- `401` - Unauthorized

---

### Billing

#### Get Plans
```
GET /api/billing/plans
```

**Response (200):**
```json
[
  {
    "id": "plan_basic",
    "name": "Basic",
    "price": 9.99,
    "billing_cycle": "monthly",
    "features": ["5 proxies", "1GB bandwidth", "Email support"]
  },
  {
    "id": "plan_pro",
    "name": "Pro",
    "price": 29.99,
    "billing_cycle": "monthly",
    "features": ["50 proxies", "100GB bandwidth", "Priority support"]
  }
]
```

---

#### Get Subscription
```
GET /api/billing/subscription
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "sub_123",
  "user_id": "user_123",
  "plan_id": "plan_pro",
  "status": "active",
  "current_period_start": "2025-11-01T00:00:00Z",
  "current_period_end": "2025-12-01T00:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized

---

#### Create/Update Subscription
```
POST /api/billing/subscription
Authorization: Bearer <token>
```

**Request:**
```json
{
  "plan_id": "plan_pro",
  "payment_method": "card_123"
}
```

**Response (201):**
```json
{
  "id": "sub_123",
  "user_id": "user_123",
  "plan_id": "plan_pro",
  "status": "active",
  "current_period_start": "2025-11-25T10:00:00Z",
  "current_period_end": "2025-12-25T10:00:00Z"
}
```

**Error Codes:**
- `400` - Invalid input
- `401` - Unauthorized

---

#### Get Invoices
```
GET /api/billing/invoices?page=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number

**Response (200):**
```json
{
  "data": [
    {
      "id": "inv_123",
      "subscription_id": "sub_123",
      "amount": 29.99,
      "status": "paid",
      "created_at": "2025-11-01T00:00:00Z",
      "due_date": "2025-11-15T00:00:00Z"
    }
  ],
  "total": 3
}
```

**Error Codes:**
- `401` - Unauthorized

---

### Account

#### Get Profile
```
GET /api/account/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-11-25T10:00:00Z",
  "updated_at": "2025-11-25T10:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized

---

#### Update Profile
```
PUT /api/account/profile
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "updated_at": "2025-11-25T11:00:00Z"
}
```

**Error Codes:**
- `400` - Invalid input
- `401` - Unauthorized

---

#### Change Password
```
POST /api/account/password
Authorization: Bearer <token>
```

**Request:**
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Codes:**
- `400` - Invalid input
- `401` - Unauthorized

---

### Referrals

#### Get Referral Info
```
GET /api/referrals
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "referral_code": "REF_ABC123",
  "referral_link": "https://atlanticproxy.com?ref=REF_ABC123",
  "total_referrals": 5,
  "earnings": 49.95
}
```

**Error Codes:**
- `401` - Unauthorized

---

### Support

#### List Tickets
```
GET /api/support/tickets?status=open
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: `open`, `closed`, `pending`

**Response (200):**
```json
[
  {
    "id": "ticket_123",
    "user_id": "user_123",
    "subject": "Proxy not connecting",
    "message": "My proxy is not connecting...",
    "status": "open",
    "created_at": "2025-11-25T10:00:00Z"
  }
]
```

**Error Codes:**
- `401` - Unauthorized

---

#### Create Ticket
```
POST /api/support/tickets
Authorization: Bearer <token>
```

**Request:**
```json
{
  "subject": "Proxy not connecting",
  "message": "My proxy is not connecting to the server"
}
```

**Response (201):**
```json
{
  "id": "ticket_123",
  "user_id": "user_123",
  "subject": "Proxy not connecting",
  "message": "My proxy is not connecting to the server",
  "status": "open",
  "created_at": "2025-11-25T10:00:00Z"
}
```

**Error Codes:**
- `400` - Invalid input
- `401` - Unauthorized

---

#### Get Ticket
```
GET /api/support/tickets/{id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "ticket_123",
  "user_id": "user_123",
  "subject": "Proxy not connecting",
  "message": "My proxy is not connecting to the server",
  "status": "open",
  "created_at": "2025-11-25T10:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Ticket not found

---

#### Update Ticket
```
PUT /api/support/tickets/{id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "status": "closed",
  "message": "Issue resolved"
}
```

**Response (200):**
```json
{
  "id": "ticket_123",
  "status": "closed",
  "updated_at": "2025-11-25T11:00:00Z"
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Ticket not found

---

## Rate Limiting

All endpoints are rate limited to prevent abuse:
- **Standard:** 100 requests per minute
- **Authentication:** 5 requests per minute
- **Billing:** 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "status": 400
}
```

**Common Error Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

**Last Updated:** November 25, 2025

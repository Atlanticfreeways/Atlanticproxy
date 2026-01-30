# Atlantic Proxy Developer Guide

**Version:** 1.0.0  
**Last Updated:** November 25, 2025

---

## Getting Started

### Prerequisites
- API key or user account
- HTTP client (cURL, Postman, etc.)
- Basic understanding of REST APIs

### Base URLs
- **Production:** `https://api.atlanticproxy.com`
- **Development:** `http://localhost:8080`

---

## Authentication

### JWT Bearer Token

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Getting a Token

**Step 1: Register**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

**Step 2: Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Token Expiration

Tokens expire after 24 hours. Use the refresh token to get a new one:

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Making Requests

### Basic Request Structure

```bash
curl -X METHOD http://localhost:8080/api/endpoint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Request Headers

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

### Query Parameters

```bash
# Pagination
curl "http://localhost:8080/api/proxies?page=1&limit=10" \
  -H "Authorization: Bearer <token>"

# Filtering
curl "http://localhost:8080/api/analytics/usage?proxy_id=proxy_123" \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "invalid_request",
  "message": "Email is required",
  "status": 400
}
```

### Common Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | bad_request | Invalid input or validation error |
| 401 | unauthorized | Missing or invalid token |
| 403 | forbidden | Insufficient permissions |
| 404 | not_found | Resource not found |
| 429 | rate_limited | Too many requests |
| 500 | server_error | Internal server error |

### Error Handling in Code

**JavaScript:**
```javascript
try {
  const response = await fetch('http://localhost:8080/api/proxies', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error: ${error.message}`);
    return;
  }

  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('Network error:', error);
}
```

**Python:**
```python
import requests

try:
    response = requests.get(
        'http://localhost:8080/api/proxies',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    )
    response.raise_for_status()
    data = response.json()
    print(data)
except requests.exceptions.HTTPError as e:
    error = e.response.json()
    print(f"Error: {error['message']}")
except requests.exceptions.RequestException as e:
    print(f"Network error: {e}")
```

**Go:**
```go
package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    req, _ := http.NewRequest("GET", "http://localhost:8080/api/proxies", nil)
    req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Network error:", err)
        return
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        fmt.Printf("Error: %s\n", string(body))
        return
    }

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

---

## Retry Logic

Implement exponential backoff for retries:

**JavaScript:**
```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

**Python:**
```python
import time
import requests

def make_request_with_retry(url, headers, max_retries=3):
    for i in range(max_retries):
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response
            
            if response.status_code in [429, 500, 502, 503]:
                delay = 2 ** i
                time.sleep(delay)
                continue
            
            return response
        except requests.exceptions.RequestException as e:
            if i == max_retries - 1:
                raise
            delay = 2 ** i
            time.sleep(delay)
```

---

## Rate Limiting

The API enforces rate limits to prevent abuse:

- **Standard endpoints:** 100 requests/minute
- **Authentication:** 5 requests/minute
- **Billing:** 10 requests/minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

### Handling Rate Limits

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    const delay = (resetTime * 1000) - Date.now();
    console.log(`Rate limited. Retry after ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

---

## Pagination

List endpoints support pagination:

```bash
# Get page 2 with 20 items per page
curl "http://localhost:8080/api/proxies?page=2&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "data": [...],
  "total": 50,
  "page": 2,
  "limit": 20
}
```

---

## Filtering & Sorting

### Filtering

```bash
# Filter by status
curl "http://localhost:8080/api/support/tickets?status=open" \
  -H "Authorization: Bearer <token>"

# Filter by date range
curl "http://localhost:8080/api/analytics/usage?start_date=2025-11-01&end_date=2025-11-25" \
  -H "Authorization: Bearer <token>"
```

### Sorting

Most endpoints support sorting via query parameters:

```bash
curl "http://localhost:8080/api/proxies?sort=created_at&order=desc" \
  -H "Authorization: Bearer <token>"
```

---

## Best Practices

### 1. Use Environment Variables

```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const API_TOKEN = process.env.API_TOKEN;
```

### 2. Implement Caching

```javascript
const cache = new Map();

async function getCachedProxies(token) {
  const cacheKey = 'proxies';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const response = await fetch(`${API_BASE_URL}/api/proxies`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  cache.set(cacheKey, data);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return data;
}
```

### 3. Validate Input

```javascript
function validateProxyInput(proxy) {
  if (!proxy.name || proxy.name.length < 3) {
    throw new Error('Proxy name must be at least 3 characters');
  }
  if (!proxy.host || !proxy.port) {
    throw new Error('Host and port are required');
  }
  if (proxy.port < 1 || proxy.port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }
}
```

### 4. Log Requests

```javascript
async function loggedFetch(url, options) {
  console.log(`[${new Date().toISOString()}] ${options.method} ${url}`);
  const response = await fetch(url, options);
  console.log(`[${new Date().toISOString()}] Response: ${response.status}`);
  return response;
}
```

### 5. Handle Timeouts

```javascript
async function fetchWithTimeout(url, options, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## Code Examples

### Create a Proxy

**JavaScript:**
```javascript
async function createProxy(token, proxyData) {
  const response = await fetch('http://localhost:8080/api/proxies', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(proxyData)
  });

  if (!response.ok) {
    throw new Error(`Failed to create proxy: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const proxy = await createProxy(token, {
  name: 'US Proxy 1',
  host: 'proxy.example.com',
  port: 8080,
  protocol: 'http'
});
```

**Python:**
```python
import requests

def create_proxy(token, proxy_data):
    response = requests.post(
        'http://localhost:8080/api/proxies',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json=proxy_data
    )
    response.raise_for_status()
    return response.json()

# Usage
proxy = create_proxy(token, {
    'name': 'US Proxy 1',
    'host': 'proxy.example.com',
    'port': 8080,
    'protocol': 'http'
})
```

### Get Analytics

**JavaScript:**
```javascript
async function getAnalytics(token, proxyId, startDate, endDate) {
  const params = new URLSearchParams({
    proxy_id: proxyId,
    start_date: startDate,
    end_date: endDate
  });

  const response = await fetch(
    `http://localhost:8080/api/analytics/usage?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  return response.json();
}
```

---

## Troubleshooting

### 401 Unauthorized
- Token is missing or invalid
- Token has expired (use refresh token)
- Token format is incorrect

### 429 Too Many Requests
- Implement exponential backoff
- Check rate limit headers
- Wait before retrying

### 500 Internal Server Error
- Server is experiencing issues
- Retry with exponential backoff
- Contact support if persists

---

## Support

For issues or questions:
- Email: support@atlanticproxy.com
- Documentation: https://docs.atlanticproxy.com
- Status: https://status.atlanticproxy.com

---

**Happy coding!**

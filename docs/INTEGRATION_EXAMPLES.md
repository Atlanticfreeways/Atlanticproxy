# Atlantic Proxy Integration Examples

**Version:** 1.0.0  
**Last Updated:** November 25, 2025

---

## User Registration & Login Flow

### JavaScript/Node.js

```javascript
const API_BASE_URL = 'http://localhost:8080';

class AtlanticProxyClient {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  async register(email, password, name) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    this.token = data.token;
    this.refreshToken = data.refresh_token;
    return data.user;
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    this.token = data.token;
    this.refreshToken = data.refresh_token;
    return data.user;
  }

  async refreshAccessToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.token = data.token;
    this.refreshToken = data.refresh_token;
  }

  async logout() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    this.token = null;
    this.refreshToken = null;
  }
}

// Usage
const client = new AtlanticProxyClient();
const user = await client.register('user@example.com', 'password123', 'John Doe');
console.log('Registered:', user);
```

### Python

```python
import requests
import json

class AtlanticProxyClient:
    def __init__(self, base_url='http://localhost:8080'):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None

    def register(self, email, password, name):
        response = requests.post(
            f'{self.base_url}/api/auth/register',
            json={'email': email, 'password': password, 'name': name}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data['token']
        self.refresh_token = data['refresh_token']
        return data['user']

    def login(self, email, password):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data['token']
        self.refresh_token = data['refresh_token']
        return data['user']

    def refresh_access_token(self):
        response = requests.post(
            f'{self.base_url}/api/auth/refresh',
            json={'refresh_token': self.refresh_token}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data['token']
        self.refresh_token = data['refresh_token']

    def logout(self):
        requests.post(
            f'{self.base_url}/api/auth/logout',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        self.token = None
        self.refresh_token = None

# Usage
client = AtlanticProxyClient()
user = client.register('user@example.com', 'password123', 'John Doe')
print('Registered:', user)
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type AtlanticProxyClient struct {
    BaseURL      string
    Token        string
    RefreshToken string
}

type AuthResponse struct {
    Token        string `json:"token"`
    RefreshToken string `json:"refresh_token"`
    User         map[string]interface{} `json:"user"`
}

func (c *AtlanticProxyClient) Register(email, password, name string) (map[string]interface{}, error) {
    payload := map[string]string{
        "email":    email,
        "password": password,
        "name":     name,
    }
    body, _ := json.Marshal(payload)

    resp, err := http.Post(
        fmt.Sprintf("%s/api/auth/register", c.BaseURL),
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var data AuthResponse
    json.NewDecoder(resp.Body).Decode(&data)
    c.Token = data.Token
    c.RefreshToken = data.RefreshToken
    return data.User, nil
}

// Usage
client := &AtlanticProxyClient{BaseURL: "http://localhost:8080"}
user, _ := client.Register("user@example.com", "password123", "John Doe")
fmt.Println("Registered:", user)
```

---

## Proxy Management

### Create & List Proxies

**JavaScript:**
```javascript
async function manageProxies(client) {
  // Create proxy
  const createResponse = await fetch(`${API_BASE_URL}/api/proxies`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${client.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'US Proxy 1',
      host: 'proxy.example.com',
      port: 8080,
      protocol: 'http',
      username: 'user',
      password: 'pass'
    })
  });

  const proxy = await createResponse.json();
  console.log('Created proxy:', proxy);

  // List proxies
  const listResponse = await fetch(`${API_BASE_URL}/api/proxies?page=1&limit=10`, {
    headers: { 'Authorization': `Bearer ${client.token}` }
  });

  const proxies = await listResponse.json();
  console.log('Proxies:', proxies.data);

  // Test proxy
  const testResponse = await fetch(
    `${API_BASE_URL}/api/proxies/${proxy.id}/test`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${client.token}` }
    }
  );

  const testResult = await testResponse.json();
  console.log('Test result:', testResult);
}
```

**Python:**
```python
def manage_proxies(client):
    # Create proxy
    proxy = requests.post(
        f'{client.base_url}/api/proxies',
        headers={'Authorization': f'Bearer {client.token}'},
        json={
            'name': 'US Proxy 1',
            'host': 'proxy.example.com',
            'port': 8080,
            'protocol': 'http',
            'username': 'user',
            'password': 'pass'
        }
    ).json()
    print('Created proxy:', proxy)

    # List proxies
    proxies = requests.get(
        f'{client.base_url}/api/proxies?page=1&limit=10',
        headers={'Authorization': f'Bearer {client.token}'}
    ).json()
    print('Proxies:', proxies['data'])

    # Test proxy
    test_result = requests.post(
        f'{client.base_url}/api/proxies/{proxy["id"]}/test',
        headers={'Authorization': f'Bearer {client.token}'}
    ).json()
    print('Test result:', test_result)
```

---

## Analytics Retrieval

### Get Usage Data

**JavaScript:**
```javascript
async function getAnalytics(client, proxyId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days
  const endDate = new Date();

  const response = await fetch(
    `${API_BASE_URL}/api/analytics/usage?` +
    `proxy_id=${proxyId}&` +
    `start_date=${startDate.toISOString().split('T')[0]}&` +
    `end_date=${endDate.toISOString().split('T')[0]}`,
    {
      headers: { 'Authorization': `Bearer ${client.token}` }
    }
  );

  const analytics = await response.json();
  console.log('Total requests:', analytics.total_requests);
  console.log('Total bandwidth:', analytics.total_bandwidth);
  console.log('Average latency:', analytics.average_latency);
  console.log('Daily data:', analytics.data);
}
```

**Python:**
```python
from datetime import datetime, timedelta

def get_analytics(client, proxy_id):
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')

    analytics = requests.get(
        f'{client.base_url}/api/analytics/usage',
        headers={'Authorization': f'Bearer {client.token}'},
        params={
            'proxy_id': proxy_id,
            'start_date': start_date,
            'end_date': end_date
        }
    ).json()

    print('Total requests:', analytics['total_requests'])
    print('Total bandwidth:', analytics['total_bandwidth'])
    print('Average latency:', analytics['average_latency'])
    print('Daily data:', analytics['data'])
```

---

## Billing Operations

### Manage Subscription

**JavaScript:**
```javascript
async function manageBilling(client) {
  // Get available plans
  const plansResponse = await fetch(`${API_BASE_URL}/api/billing/plans`);
  const plans = await plansResponse.json();
  console.log('Available plans:', plans);

  // Create subscription
  const subResponse = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${client.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: plans[0].id,
      payment_method: 'card_123'
    })
  });

  const subscription = await subResponse.json();
  console.log('Subscription created:', subscription);

  // Get invoices
  const invoicesResponse = await fetch(`${API_BASE_URL}/api/billing/invoices`, {
    headers: { 'Authorization': `Bearer ${client.token}` }
  });

  const invoices = await invoicesResponse.json();
  console.log('Invoices:', invoices.data);
}
```

**Python:**
```python
def manage_billing(client):
    # Get available plans
    plans = requests.get(f'{client.base_url}/api/billing/plans').json()
    print('Available plans:', plans)

    # Create subscription
    subscription = requests.post(
        f'{client.base_url}/api/billing/subscription',
        headers={'Authorization': f'Bearer {client.token}'},
        json={
            'plan_id': plans[0]['id'],
            'payment_method': 'card_123'
        }
    ).json()
    print('Subscription created:', subscription)

    # Get invoices
    invoices = requests.get(
        f'{client.base_url}/api/billing/invoices',
        headers={'Authorization': f'Bearer {client.token}'}
    ).json()
    print('Invoices:', invoices['data'])
```

---

## Error Handling Patterns

### Retry with Exponential Backoff

**JavaScript:**
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // Retry on server errors or rate limiting
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Don't retry on client errors
      const error = await response.json();
      throw new Error(`${response.status}: ${error.message}`);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

**Python:**
```python
import time

def fetch_with_retry(url, headers, max_retries=3):
    for i in range(max_retries):
        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                return response

            # Retry on server errors or rate limiting
            if response.status_code in [429, 500, 502, 503]:
                delay = 2 ** i
                print(f'Retrying after {delay}s...')
                time.sleep(delay)
                continue

            # Don't retry on client errors
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            if i == max_retries - 1:
                raise
            delay = 2 ** i
            time.sleep(delay)
```

---

## Authentication Patterns

### Token Refresh Middleware

**JavaScript:**
```javascript
async function makeAuthenticatedRequest(url, options = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${client.token}`
  };

  let response = await fetch(url, { ...options, headers });

  // If token expired, refresh and retry
  if (response.status === 401) {
    try {
      await client.refreshAccessToken();
      headers['Authorization'] = `Bearer ${client.token}`;
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      // Redirect to login
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
}
```

**Python:**
```python
def make_authenticated_request(client, url, method='GET', **kwargs):
    headers = kwargs.get('headers', {})
    headers['Authorization'] = f'Bearer {client.token}'

    response = requests.request(method, url, headers=headers, **kwargs)

    # If token expired, refresh and retry
    if response.status_code == 401:
        try:
            client.refresh_access_token()
            headers['Authorization'] = f'Bearer {client.token}'
            response = requests.request(method, url, headers=headers, **kwargs)
        except Exception as e:
            # Redirect to login
            raise Exception('Session expired. Please login again.')

    return response
```

---

## Complete Example: Full Workflow

**JavaScript:**
```javascript
async function completeWorkflow() {
  const client = new AtlanticProxyClient();

  try {
    // 1. Register
    const user = await client.register(
      'user@example.com',
      'password123',
      'John Doe'
    );
    console.log('✓ Registered:', user.email);

    // 2. Create proxy
    const proxyResponse = await fetch(`${API_BASE_URL}/api/proxies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${client.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'My Proxy',
        host: 'proxy.example.com',
        port: 8080,
        protocol: 'http'
      })
    });
    const proxy = await proxyResponse.json();
    console.log('✓ Created proxy:', proxy.name);

    // 3. Get analytics
    const analyticsResponse = await fetch(
      `${API_BASE_URL}/api/analytics/usage?proxy_id=${proxy.id}`,
      { headers: { 'Authorization': `Bearer ${client.token}` } }
    );
    const analytics = await analyticsResponse.json();
    console.log('✓ Analytics:', analytics.total_requests, 'requests');

    // 4. Get subscription
    const subResponse = await fetch(`${API_BASE_URL}/api/billing/subscription`, {
      headers: { 'Authorization': `Bearer ${client.token}` }
    });
    const subscription = await subResponse.json();
    console.log('✓ Subscription:', subscription.status);

    // 5. Logout
    await client.logout();
    console.log('✓ Logged out');
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

completeWorkflow();
```

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Create Proxy
```bash
curl -X POST http://localhost:8080/api/proxies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "US Proxy",
    "host": "proxy.example.com",
    "port": 8080,
    "protocol": "http"
  }'
```

### Get Analytics
```bash
curl -X GET "http://localhost:8080/api/analytics/usage?proxy_id=proxy_123" \
  -H "Authorization: Bearer <token>"
```

### Create Support Ticket
```bash
curl -X POST http://localhost:8080/api/support/tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Proxy not working",
    "message": "My proxy is not connecting"
  }'
```

---

**Happy integrating!**

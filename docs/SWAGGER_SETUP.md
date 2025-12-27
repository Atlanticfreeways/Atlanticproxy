# Swagger UI Setup Guide

**Version:** 1.0.0  
**Last Updated:** November 25, 2025

---

## Overview

Swagger UI provides an interactive interface for exploring and testing the Atlantic Proxy API. It's automatically generated from the OpenAPI specification and integrated into the backend server.

---

## Installation

### Prerequisites
- Go 1.21+
- Backend dependencies installed

### Step 1: Install Swagger Tools

The required dependencies have been added to `backend/go.mod`:
- `github.com/swaggo/swag` - Swagger documentation generator
- `github.com/swaggo/gin-swagger` - Gin middleware for Swagger UI
- `github.com/swaggo/files` - Swagger UI files

### Step 2: Download Dependencies

```bash
cd backend
go mod download
go mod tidy
```

### Step 3: Generate Swagger Documentation

```bash
# Install swag CLI tool
go install github.com/swaggo/swag/cmd/swag@latest

# Generate Swagger docs from OpenAPI spec
swag init -g cmd/server/main.go
```

This will create/update `backend/docs/docs.go` with the Swagger documentation.

---

## Running the Server

### Start the Backend Server

```bash
cd backend
go run cmd/server/main.go
```

You should see:
```
📚 Swagger UI available at http://localhost:5000/api/docs/index.html
```

### Access Swagger UI

Open your browser and navigate to:
```
http://localhost:5000/api/docs/index.html
```

---

## Using Swagger UI

### 1. Explore Endpoints

The Swagger UI displays all available endpoints organized by tags:
- **Authentication** - Register, login, logout, refresh token
- **Proxies** - Proxy management operations
- **Analytics** - Usage and performance metrics
- **Billing** - Plans, subscriptions, invoices
- **Account** - Profile and security settings
- **Referrals** - Referral information
- **Support** - Support tickets

### 2. Test Endpoints

#### Without Authentication

1. Click on an endpoint (e.g., `POST /api/auth/register`)
2. Click "Try it out"
3. Fill in the request body
4. Click "Execute"
5. View the response

#### With Authentication

1. First, register or login to get a token
2. Copy the token from the response
3. Click the "Authorize" button at the top
4. Enter: `Bearer <your_token>`
5. Click "Authorize"
6. Now you can test authenticated endpoints

### 3. View Request/Response

Each endpoint shows:
- **Request body** - JSON schema and example
- **Response** - Status codes and response schemas
- **Parameters** - Query parameters and path parameters
- **Headers** - Required headers

---

## API Documentation Structure

### Endpoint Details

Each endpoint displays:

```
GET /api/proxies
├── Summary: List user proxies
├── Description: Get all proxies for the authenticated user
├── Parameters:
│   ├── page (query, optional)
│   └── limit (query, optional)
├── Responses:
│   ├── 200 - Success
│   ├── 401 - Unauthorized
│   └── 429 - Rate Limited
└── Security: Bearer Token
```

### Schema Definitions

Common schemas are defined once and reused:
- `RegisterRequest` - User registration data
- `LoginRequest` - Login credentials
- `AuthResponse` - Authentication response
- `UserProfile` - User information
- `Proxy` - Proxy configuration
- `BillingPlan` - Billing plan details
- `Subscription` - Subscription information
- `Invoice` - Invoice details
- `SupportTicket` - Support ticket

---

## Authentication in Swagger UI

### Step 1: Get a Token

1. Navigate to **Authentication** section
2. Click `POST /api/auth/register` or `POST /api/auth/login`
3. Click "Try it out"
4. Fill in credentials
5. Click "Execute"
6. Copy the `token` from the response

### Step 2: Authorize

1. Click the green "Authorize" button at the top
2. In the dialog, enter: `Bearer <your_token>`
3. Click "Authorize"
4. Click "Close"

### Step 3: Test Authenticated Endpoints

Now you can test any endpoint that requires authentication. The token will be automatically included in requests.

---

## Common Tasks

### Test User Registration

1. Go to **Authentication** → `POST /api/auth/register`
2. Click "Try it out"
3. Enter:
```json
{
  "email": "test@example.com",
  "password": "securepassword123",
  "name": "Test User"
}
```
4. Click "Execute"
5. Copy the token from response

### Test Proxy Creation

1. Authorize with a token (see Authentication section)
2. Go to **Proxies** → `POST /api/proxies`
3. Click "Try it out"
4. Enter:
```json
{
  "name": "US Proxy",
  "host": "proxy.example.com",
  "port": 8080,
  "protocol": "http"
}
```
5. Click "Execute"

### Test Analytics

1. Authorize with a token
2. Go to **Analytics** → `GET /api/analytics/usage`
3. Click "Try it out"
4. Add query parameters:
   - `proxy_id`: (optional) proxy ID
   - `start_date`: (optional) YYYY-MM-DD
   - `end_date`: (optional) YYYY-MM-DD
5. Click "Execute"

---

## Troubleshooting

### Swagger UI Not Loading

**Problem:** 404 error when accessing `/api/docs/index.html`

**Solution:**
1. Ensure server is running: `go run cmd/server/main.go`
2. Check that Swagger dependencies are installed: `go mod tidy`
3. Verify the endpoint is registered in main.go

### Endpoints Not Showing

**Problem:** Swagger UI loads but endpoints are missing

**Solution:**
1. Regenerate Swagger docs: `swag init -g cmd/server/main.go`
2. Restart the server
3. Clear browser cache (Ctrl+Shift+Delete)

### Authorization Not Working

**Problem:** Token not being sent with requests

**Solution:**
1. Click "Authorize" button
2. Enter token in format: `Bearer <token>`
3. Ensure token is valid (not expired)
4. Check that endpoint requires authentication

### CORS Errors

**Problem:** Requests fail with CORS error

**Solution:**
1. CORS is configured in main.go
2. Ensure server is running on correct port (5000)
3. Check browser console for specific error

---

## Customization

### Change Swagger UI Title

Edit `backend/docs/docs.go`:
```go
Title:       "Atlantic Proxy API",
Description: "Enterprise proxy management API",
```

### Change API Host

Edit `backend/docs/docs.go`:
```go
Host:     "api.atlanticproxy.com",
BasePath: "/",
```

### Add More Endpoints

1. Add endpoint handler in main.go
2. Add documentation comments
3. Run: `swag init -g cmd/server/main.go`
4. Restart server

---

## Production Deployment

### Disable Swagger UI in Production

Add environment variable check:

```go
if os.Getenv("ENVIRONMENT") != "production" {
    router.GET("/api/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
```

### Secure Swagger UI

Protect with authentication:

```go
router.GET("/api/docs/*any", 
    authMiddleware(jwtSecret),
    ginSwagger.WrapHandler(swaggerFiles.Handler),
)
```

---

## Integration with CI/CD

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
- name: Generate Swagger Docs
  run: |
    go install github.com/swaggo/swag/cmd/swag@latest
    cd backend
    swag init -g cmd/server/main.go
```

---

## Resources

- **Swagger UI Documentation:** https://swagger.io/tools/swagger-ui/
- **Swaggo Documentation:** https://github.com/swaggo/swag
- **OpenAPI Specification:** https://spec.openapis.org/oas/v3.0.0

---

## Support

For issues or questions:
- Check Swagger UI troubleshooting section
- Review OpenAPI specification: `backend/openapi.yaml`
- Check API Reference: `docs/API_REFERENCE.md`
- Contact support: support@atlanticproxy.com

---

**Swagger UI is now ready for interactive API testing!**

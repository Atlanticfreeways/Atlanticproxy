# AtlanticProxy Go Backend

VPN-grade standby proxy platform backend API built with Go.

## 🚀 Quick Start

### 1. Setup Database

```bash
# Install PostgreSQL (if not installed)
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb atlanticproxy

# Run schema
psql atlanticproxy < internal/database/schema.sql
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Run Server

```bash
# Development mode
go run cmd/server/main.go

# Or build and run
go build -o bin/server cmd/server/main.go
./bin/server
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Get current user (requires auth)
GET /api/auth/me
Authorization: Bearer <token>
```

### Proxy Management

```bash
# Connect to proxy (requires auth)
POST /api/proxy/connect
Authorization: Bearer <token>

# Get connection status
GET /api/proxy/status
Authorization: Bearer <token>

# Disconnect
POST /api/proxy/disconnect
Authorization: Bearer <token>
```

### Health Check

```bash
GET /health
```

## 🧪 Test API

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get status (use token from login)
curl http://localhost:5000/api/proxy/status \
  -H "Authorization: Bearer <your-token>"
```

## 📁 Project Structure

```
backend-go/
├── cmd/server/          # Main application
├── internal/
│   ├── api/
│   │   ├── handlers/    # HTTP handlers
│   │   └── middleware/  # Middleware
│   ├── models/          # Data models
│   ├── database/        # Database connection
│   └── config/          # Configuration
├── pkg/
│   └── jwt/             # JWT utilities
└── .env                 # Environment variables
```

## 🔧 Development

```bash
# Install dependencies
go mod download

# Run tests
go test ./...

# Format code
go fmt ./...

# Build
go build -o bin/server cmd/server/main.go
```

## 🚀 Next Steps

1. ✅ Basic authentication - DONE
2. ✅ Proxy connection management - DONE
3. 🔄 WebSocket for real-time updates
4. 🔄 Usage tracking
5. 🔄 Stripe billing integration
6. 🔄 Advanced anonymity verification

## 📊 Database Schema

See `internal/database/schema.sql` for complete schema.

Tables:
- `users` - User accounts
- `proxy_connections` - Active/historical connections
- `proxy_usage` - Bandwidth and usage metrics
- `anonymity_logs` - Leak detection results

## 🎯 Integration with Proxy Client

The backend issues credentials that the Go proxy client uses to connect to Oxylabs:

1. User logs in via frontend
2. Frontend calls `/api/proxy/connect`
3. Backend returns Oxylabs credentials
4. Frontend passes credentials to proxy client
5. Client connects to Oxylabs using credentials
6. Client reports status back to backend

**Backend is ready to serve the AtlanticProxy platform!** 🚀
AtlanticProxy

**Enterprise-Grade Residential Proxy Service with Advanced Billing & Geo-Targeting**

AtlanticProxy is a production-ready proxy reseller platform that provides seamless access to Oxylabs residential proxy infrastructure with built-in billing, quota management, and multi-currency support.

---

 PROJECT STATUS

**Version:** 1.0.0-beta  
**Progress:** 75% Complete  
**Status:**  Ready for Testing (Pending Oxylabs Credentials)  
**Last Updated:** January 2, 2026

###  Completed Features
- Authentication & User Management
- Paystack Payment Integration
- Invoice Generation (PDF)
- Currency Localization (USD, NGN, EUR, GBP)
- Quota Enforcement & Rate Limiting
- Transaction Storage
- Structured Logging & Monitoring
- Kill Switch & Ad-Blocking
- API Server (40+ endpoints)

 Pending
- End-to-End Proxy Testing (Waiting for Oxylabs Residential Proxies credentials)
- Production Installers
- Comprehensive Testing Suite

---

QUICK START

### Prerequisites
- Go 1.21+
- SQLite
- Oxylabs Residential Proxies account
- Paystack account (for payments)

### Installation

```bash
# Clone repository
git clone https://github.com/yourcompany/atlanticproxy.git
cd atlanticproxy/scripts/proxy-client

# Install dependencies
go mod download

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build and run
go build -o service ./cmd/service
./service
```

Service will start on:
- **API Server:** `http://localhost:8082`
- **HTTP Proxy:** `http://localhost:8080`
- **SOCKS5 Proxy:** `socks5://localhost:1080`

---

CORE FEATURES

###  Authentication & Billing
- **JWT Authentication** - Secure user sessions
- **Multi-User Support** - Isolated sessions and quotas
- **Paystack Integration** - Automated payment processing
- **Invoice Generation** - PDF invoices for all transactions
- **Currency Localization** - Auto-detect user region and display prices in local currency

 Proxy Management
- **Oxylabs Integration** - Access to residential proxy pool
- **Geo-Targeting** - Select country, state, and city
- **Session Management** - Sticky IPs with configurable duration
- **Automatic Rotation** - Time-based or per-request rotation
- **Health Monitoring** - Endpoint failover and health checks

### Quota & Usage
- **Real-Time Tracking** - Monitor bandwidth and request usage
- **Plan Enforcement** - Automatic quota limits based on subscription
- **Rate Limiting** - Per-user API rate limits (10-10,000 req/sec)
- **Monthly Reset** - Automatic quota reset on billing cycle

### Security & Privacy
- **Kill Switch** - Network isolation on disconnect (Linux/macOS)
- **Ad-Blocking** - EasyList integration with custom rules
- **Request Tracing** - Unique request IDs for debugging
- **Panic Recovery** - Graceful error handling
- **SQL Injection Protection** - Parameterized queries

 Monitoring & Logging
- **Structured Logging** - JSON logs with logrus
- **Request IDs** - Trace requests across services
- **Health Checks** - `/health` endpoint for monitoring
- **WebSocket Updates** - Real-time status notifications

---

 PROJECT STRUCTURE

```
Atlanticproxy/
├── scripts/proxy-client/       # Main Go Application
│   ├── cmd/service/            # Service entry point
│   ├── internal/
│   │   ├── api/                # HTTP API server
│   │   ├── billing/            # Billing & quota management
│   │   ├── storage/            # SQLite persistence
│   │   ├── proxy/              # Proxy engine
│   │   ├── rotation/           # IP rotation logic
│   │   ├── adblock/            # Ad-blocking engine
│   │   └── killswitch/         # Network kill switch
│   └── pkg/oxylabs/            # Oxylabs client
├── atlantic-dashboard/         # Next.js Dashboard (Optional)
├── docs/                       # Documentation
└── build/                      # Build artifacts
```

---

 CONFIGURATION

### Environment Variables

```bash
# Server
SERVER_PORT=8082

# Oxylabs (Residential Proxies)
OXYLABS_USERNAME=customer-yourcompany
OXYLABS_PASSWORD=your_password

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx

# Database (Optional - defaults to ~/.atlanticproxy/atlantic.db)
DATABASE_PATH=/path/to/database.db
```

See [CONFIGURATION.md](./docs/CONFIGURATION.md) for full details.

---

 DOCUMENTATION

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- **[Configuration Guide](./CONFIGURATION.md)** - Environment setup
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues
- **[Testing Guide](./TESTING.md)** - Running tests

---

 API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Billing
- `GET /api/billing/plans` - Get available plans (localized)
- `GET /api/billing/subscription` - Get current subscription
- `POST /api/billing/checkout` - Create payment session
- `GET /api/billing/usage` - Get usage statistics
- `GET /api/billing/invoices/:id` - Download invoice PDF

### Proxy Control
- `POST /connect` - Connect to proxy
- `POST /disconnect` - Disconnect
- `GET /status` - Connection status
- `GET /health` - Service health

### Rotation
- `GET /api/rotation/config` - Get rotation settings
- `POST /api/rotation/config` - Update rotation settings
- `POST /api/rotation/session/new` - Force new session
- `POST /api/rotation/geo` - Set geo-location

See [API.md](./docs/API.md) for complete reference.

---

##  SUBSCRIPTION PLANS

| Plan | Price | Data Quota | Requests | Rate Limit |
|------|-------|------------|----------|------------|
| **Starter** | $9/mo | 500 MB | 1,000 | 10 req/sec |
| **Personal** | $29/mo | 5 GB | 10,000 | 50 req/sec |
| **Team** | $99/mo | 50 GB | 100,000 | 500 req/sec |
| **Enterprise** | $299/mo | Unlimited | Unlimited | 10,000 req/sec |

*Prices shown in USD. Automatically converted to local currency based on user's region.*

---

 TESTING

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/billing/...
```

See [TESTING.md](./TESTING.md) for details.

---

BUILDING

```bash
# Build for current platform
go build -o service ./cmd/service

# Build for all platforms
make build-all

# Create installers
make installers
```

---

 ROADMAP

### V1.0 (Current)
-  Core proxy functionality
-  Billing & payments
-  Currency localization
-  End-to-end testing
-  Production installers

### V1.1 (Future)
- Stripe integration
- Advanced analytics
- Mobile apps (iOS/Android)
- P2P network option

---

 CONTRIBUTING

This is a private commercial project. For questions or support, contact the development team.

---

LICENSE

Copyright © 2025-2026 Atlantic Proxy Limited. All rights reserved.

---

 SUPPORT

- **Documentation:** [docs/](./docs/)
- **Issues:** Contact development team
- **Email:** support@atlanticproxy.com

---

**Built with  using Go, SQLite, and Oxylabs**

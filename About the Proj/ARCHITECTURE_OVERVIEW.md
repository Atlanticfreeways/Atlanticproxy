# Atlantic Proxy - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│                    (http://localhost:3000)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS (REST API)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    FRONTEND LAYER                                │
│                  (Next.js 14 + React)                            │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                           │
│  ├── /login - User authentication                               │
│  ├── /register - User registration                              │
│  ├── /dashboard - Main dashboard                                │
│  └── /account - Account settings                                │
│                                                                  │
│  Components (21 total):                                          │
│  ├── Billing (9) - Plans, pricing, checkout                     │
│  ├── Account (2) - Security, settings                           │
│  ├── Proxy (4) - Configuration, headers, throttling             │
│  ├── Notifications (3) - Email, push, alerts                    │
│  ├── Analytics (2) - Cost, trends                               │
│  └── Connection (2) - Map, location selection                   │
│                                                                  │
│  State Management:                                               │
│  ├── AuthContext - User authentication                          │
│  ├── Zustand - Client state                                     │
│  └── React Query - Server state                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/REST API (port 5000)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND LAYER                                 │
│                  (Go + Gin Framework)                            │
├─────────────────────────────────────────────────────────────────┤
│  API Routes:                                                      │
│  ├── /api/auth - Authentication (register, login)               │
│  ├── /api/proxy - Proxy management (connect, status)            │
│  ├── /api/usage - Usage tracking (stats, monthly)               │
│  ├── /api/billing - Billing (pricing, orders, invoices)         │
│  ├── /api/notifications - Notifications (settings, alerts)      │
│  ├── /api/analytics - Analytics (trends, export)                │
│  └── /api/account - Account (security, sessions)                │
│                                                                  │
│  Services (6 total):                                             │
│  ├── AuthService - User authentication & JWT                    │
│  ├── ProxyService - Proxy connection management                 │
│  ├── BillingService - Pricing & orders                          │
│  ├── NotificationService - Email & push notifications           │
│  ├── AnalyticsService - Data tracking & export                  │
│  └── AccountService - User account management                   │
│                                                                  │
│  Middleware:                                                      │
│  ├── CORS - Cross-origin requests                               │
│  ├── Auth - JWT validation                                      │
│  ├── Logging - Request logging                                  │
│  └── Error Handling - Error responses                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Database & Cache Layer
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   PostgreSQL            Redis              MailHog
   (Database)            (Cache)            (Email)
                     (Cache)            (Email)
   Port 5432             Port 6379          Port 8025
```

---

## 💻 Client Architecture (Desktop App)

The desktop client (implemented in Phases 1-8) runs as a system service with a lightweight tray interface.

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESKTOP CLIENT                              │
│                 (macOS / Windows / Linux)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│   │  UI / TRAY   │      │   SERVICE    │      │  INTERCEPT   │  │
│   │ (cmd/tray)   │◄────►│ (cmd/service)│◄────►│ (TUN/TAP)    │  │
│   └──────────────┘      └──────┬───────┘      └──────┬───────┘  │
│                                │                     │          │
│                         ┌──────▼───────┐             │          │
│                         │ PROXY ENGINE │◄────────────┘          │
│                         └──────┬───────┘                        │
│                                │                                │
│                         ┌──────▼───────┐                        │
│                         │  PROTECTION  │                        │
│                         │ (Kill/Leak)  │                        │
│                         └──────┬───────┘                        │
│                                │                                │
│                         ┌──────▼───────┐                        │
│                         │   AD-BLOCK   │                        │
│                         │  (DNS/HTTP)  │                        │
│                         └──────┬───────┘                        │
│                                │                                │
│                         ┌──────▼───────┐                        │
│                         │   OXYLABS    │                        │
│                         │     POOL     │                        │
│                         └──────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components
1.  **System Service (`cmd/service`)**:
    *   Runs as root/admin.
    *   Manages the TUN/TAP interface `atlantic-tun0`.
    *   Orchestrates the entire proxy pipeline.
2.  **Traffic Interceptor (`internal/interceptor`)**:
    *   Captures L3 packets via `water` library.
    *   Routes TCP/UDP traffic through the proxy engine.
3.  **Proxy Engine (`internal/proxy`)**:
    *   Transparent HTTP/HTTPS/SOCKS handler (`goproxy`).
    *   Manages connection pooling (`internal/pool`).
    *   Integrates with Oxylabs for residential IP rotation.
4.  **Protection Layer**:
    *   **Kill Switch (`internal/killswitch`)**: System firewall manipulation (IP Tables/PF) to prevent leaks.
    *   **Failover (`internal/failover`)**: Circuit breaker for network interruptions.
    *   **Validator (`internal/validator`)**: Real-time leak detection and traffic jitter.
5.  **Ad-Blocking (`internal/adblock`)**:
    *   DNS & HTTP filtering using local blocklists.
    *   Compliance manager for regional regulations.
6.  **User Interface (`cmd/tray`)**:
    *   Cross-platform system tray icon (`systray`).
    *   Controls for connection, kill switch, and status monitoring.

---

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                           │
│                  (atlantic_proxy)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Core Tables:                                                    │
│  ├── users                                                       │
│  │   ├── id (PK)                                                │
│  │   ├── email (UNIQUE)                                         │
│  │   ├── password_hash                                          │
│  │   ├── subscription_tier                                      │
│  │   └── created_at                                             │
│  │                                                              │
│  ├── proxy_connections                                          │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── client_id                                              │
│  │   ├── status                                                 │
│  │   ├── ip_address                                             │
│  │   └── location                                               │
│  │                                                              │
│  ├── proxy_usage                                                │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── bytes_sent                                             │
│  │   ├── bytes_received                                         │
│  │   └── requests_count                                         │
│  │                                                              │
│  Billing Tables:                                                 │
│  ├── payment_methods                                            │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── type (card, paypal, crypto)                            │
│  │   └── is_default                                             │
│  │                                                              │
│  ├── invoices                                                   │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── amount                                                 │
│  │   ├── status (paid, pending, failed)                         │
│  │   └── date                                                   │
│  │                                                              │
│  ├── orders                                                     │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── plan_id                                                │
│  │   ├── protocol (http, https, socks5)                         │
│  │   ├── isp_tier (budget, standard, premium)                   │
│  │   └── amount                                                 │
│  │                                                              │
│  Configuration Tables:                                           │
│  ├── proxy_configurations                                       │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK, UNIQUE)                                   │
│  │   ├── protocol                                               │
│  │   ├── isp_tier                                               │
│  │   └── locations (JSONB)                                      │
│  │                                                              │
│  ├── session_settings                                           │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK, UNIQUE)                                   │
│  │   ├── enabled                                                │
│  │   ├── session_duration                                       │
│  │   └── ip_stickiness                                          │
│  │                                                              │
│  ├── custom_headers                                             │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK)                                           │
│  │   ├── name                                                   │
│  │   └── value                                                  │
│  │                                                              │
│  ├── throttling_settings                                        │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK, UNIQUE)                                   │
│  │   ├── requests_per_second                                    │
│  │   └── bandwidth_limit                                        │
│  │                                                              │
│  ├── proxy_authentication                                       │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK, UNIQUE)                                   │
│  │   ├── username                                               │
│  │   └── auth_method                                            │
│  │                                                              │
│  ├── notification_settings                                      │
│  │   ├── id (PK)                                                │
│  │   ├── user_id (FK, UNIQUE)                                   │
│  │   ├── email_notifications (JSONB)                            │
│  │   └── push_notifications (JSONB)                             │
│  │                                                              │
│  ├── proxy_locations                                            │
│  │   ├── id (PK)                                                │
│  │   ├── country                                                │
│  │   ├── city                                                   │
│  │   ├── region                                                 │
│  │   ├── servers                                                │
│  │   ├── latency                                                │
│  │   └── uptime                                                 │
│  │                                                              │
│  └── connection_logs                                            │
│      ├── id (PK)                                                │
│      ├── user_id (FK)                                           │
│      ├── protocol                                               │
│      ├── location                                               │
│      └── created_at                                             │
│                                                                  │
│  Indexes: 15+ for performance optimization                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Authentication Flow
```
User Input (Email/Password)
    ↓
Frontend: /login page
    ↓
API Call: POST /api/auth/login
    ↓
Backend: AuthHandler.Login()
    ↓
Database: Query users table
    ↓
Password Verification (bcrypt)
    ↓
JWT Token Generation
    ↓
Response: {token, user}
    ↓
Frontend: Store token in localStorage
    ↓
AuthContext: Update user state
    ↓
Redirect: /dashboard
```

### Proxy Connection Flow
```
User Click: "Connect to Proxy"
    ↓
Frontend: ProxyDashboard component
    ↓
API Call: POST /api/proxy/connect
    ↓
Backend: ProxyHandler.Connect()
    ↓
ProxyService: Generate credentials
    ↓
Database: Create proxy_connections record
    ↓
Response: {client_id, credentials}
    ↓
Frontend: Display connection status
    ↓
User: Can now use proxy
```

### Usage Tracking Flow
```
Proxy Request
    ↓
Backend: Track bytes & requests
    ↓
Database: Update proxy_usage table
    ↓
Redis: Cache usage stats
    ↓
Frontend: Poll /api/usage/stats
    ↓
Display: Usage dashboard
    ↓
Analytics: Generate reports
```

---

## 🔌 API Endpoints (25+)

### Authentication (2)
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
```

### Proxy Management (3)
```
POST   /api/proxy/connect      - Connect to proxy
GET    /api/proxy/status       - Get connection status
POST   /api/proxy/disconnect   - Disconnect from proxy
```

### Usage Tracking (2)
```
GET    /api/usage/stats        - Get usage statistics
GET    /api/usage/monthly      - Get monthly usage
```

### Billing (9)
```
POST   /api/billing/calculate-price    - Calculate pricing
POST   /api/billing/checkout           - Create order
GET    /api/billing/payment-methods    - List payment methods
POST   /api/billing/payment-methods    - Add payment method
GET    /api/billing/invoices           - List invoices
GET    /api/billing/orders             - List orders
POST   /api/billing/subscribe          - Create subscription
GET    /api/billing/plans              - List plans
```

### Notifications (4)
```
GET    /api/notifications/settings     - Get settings
POST   /api/notifications/settings     - Update settings
POST   /api/notifications/email        - Send email
POST   /api/notifications/push         - Send push
```

### Analytics (3)
```
GET    /api/analytics/usage-trends     - Get trends
GET    /api/analytics/cost-analysis    - Get cost analysis
POST   /api/analytics/export           - Export data
```

### Account (2)
```
GET    /api/account/security           - Get security info
POST   /api/account/security           - Update security
```

### Health (1)
```
GET    /health                         - Health check
```

---

## 🛠️ Technology Stack

### Frontend
```
Next.js 14          - React framework with SSR
TypeScript          - Type safety
Tailwind CSS        - Styling
React Query         - Server state management
Zustand             - Client state management
React Hook Form     - Form handling
Chart.js            - Data visualization
Framer Motion       - Animations
```

### Backend
```
Go 1.24             - Programming language
Gin                 - Web framework
PostgreSQL          - Primary database
Redis               - Caching & sessions
JWT                 - Authentication
bcrypt              - Password hashing
CORS                - Cross-origin requests
WebSocket           - Real-time updates

### Desktop Client
```
Go 1.24             - Core Service & UI
water               - TUN/TAP Networking
goproxy             - Proxy Server
systray             - System Tray GUI
netlink             - Network Route Management
miekg/dns           - DNS Handling
```
```

### Infrastructure
```
Docker              - Containerization
Docker Compose      - Orchestration
PostgreSQL 15       - Database
Redis 7             - Cache
MailHog             - Email testing
Nginx               - Reverse proxy (production)
Let's Encrypt       - SSL/TLS (production)
```

---

## 📈 Scalability Architecture

### Current (Development)
```
Single Server
├── Frontend (Next.js)
├── Backend (Go)
├── PostgreSQL
└── Redis
```

### Production (Horizontal Scaling)
```
Load Balancer (Nginx)
├── Frontend Servers (Multiple)
├── Backend Servers (Multiple)
├── Database Cluster (PostgreSQL)
├── Cache Cluster (Redis)
└── CDN (CloudFlare)
```

### Enterprise (Microservices)
```
API Gateway
├── Auth Service
├── Proxy Service
├── Billing Service
├── Notification Service
├── Analytics Service
└── Account Service

Shared Infrastructure
├── PostgreSQL Cluster
├── Redis Cluster
├── Message Queue (RabbitMQ)
└── Monitoring (Prometheus/Grafana)
```

---

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network Security                                       │
│  ├── HTTPS/TLS encryption                                       │
│  ├── CORS validation                                            │
│  ├── Rate limiting                                              │
│  └── DDoS protection                                            │
│                                                                  │
│  Layer 2: Authentication                                         │
│  ├── JWT tokens                                                 │
│  ├── Token expiration                                           │
│  ├── Refresh tokens                                             │
│  └── Session management                                         │
│                                                                  │
│  Layer 3: Authorization                                          │
│  ├── Role-based access control                                  │
│  ├── Resource ownership validation                              │
│  ├── Permission checks                                          │
│  └── API key validation                                         │
│                                                                  │
│  Layer 4: Data Protection                                        │
│  ├── Password hashing (bcrypt)                                  │
│  ├── Input validation (Zod)                                     │
│  ├── SQL injection prevention (ORM)                             │
│  ├── XSS protection                                             │
│  └── CSRF protection                                            │
│                                                                  │
│  Layer 5: Infrastructure                                         │
│  ├── Database encryption                                        │
│  ├── Secrets management                                         │
│  ├── Audit logging                                              │
│  └── Monitoring & alerting                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
App (Root)
├── AuthProvider
│   ├── Layout
│   │   ├── HomePage
│   │   │   └── Redirect to /login or /dashboard
│   │   │
│   │   ├── LoginPage
│   │   │   └── LoginForm
│   │   │
│   │   ├── RegisterPage
│   │   │   └── RegisterForm
│   │   │
│   │   └── DashboardPage
│   │       ├── Header
│   │       ├── StatsGrid
│   │       ├── ConnectionStatus
│   │       ├── QuickActions
│   │       ├── UsageStatsPanel
│   │       ├── KillSwitchControl
│   │       └── FeaturesShowcase
│   │
│   └── AccountPage
│       ├── ProfileSettings
│       ├── AccountSecurity
│       ├── PasswordChange
│       ├── TwoFactorAuth
│       ├── DeleteAccount
│       └── TopUpModal
│
├── BillingComponents
│   ├── SubscriptionPlans
│   ├── ProxyCustomizer
│   ├── ProtocolSelector
│   ├── ISPTierSelector
│   ├── PricingCalculator
│   ├── PaymentMethods
│   ├── InvoiceHistory
│   └── CheckoutExample
│
├── ProxyComponents
│   ├── StickySessionConfig
│   ├── CustomHeaders
│   ├── RequestThrottling
│   ├── ProxyAuthentication
│   ├── IPLeakTest
│   ├── SpeedTest
│   └── UserAgentRotation
│
├── NotificationComponents
│   ├── EmailNotifications
│   ├── PushNotifications
│   └── AlertSettings
│
├── AnalyticsComponents
│   ├── CostAnalysis
│   ├── DataExportModal
│   ├── ConnectionMetrics
│   ├── LiveUsageChart
│   └── UsageTrends
│
└── ConnectionComponents
    ├── InteractiveWorldMap
    ├── BulkLocationSelection
    ├── LocationSelector
    ├── ConnectionHistory
    └── AdvancedFiltering
```

---

## 🚀 Deployment Architecture

### Development
```
localhost:3000 (Frontend)
localhost:5000 (Backend)
localhost:5432 (PostgreSQL)
localhost:6379 (Redis)
localhost:8025 (MailHog)
```

### Production
```
CDN (CloudFlare)
    ↓
Load Balancer (Nginx)
    ├── Frontend Servers (Vercel/Self-hosted)
    └── Backend Servers (Docker/Kubernetes)
        ├── PostgreSQL (RDS/Self-hosted)
        ├── Redis (ElastiCache/Self-hosted)
        └── S3 (Object Storage)
```

---

## 📞 Architecture Support

For questions about:
- **Frontend Architecture** → See `frontend/` directory
- **Backend Architecture** → See `backend/` directory
- **Database Schema** → See `backend/internal/database/`
- **API Endpoints** → See `BACKEND_INTEGRATION_GUIDE.md`
- **Deployment** → See `BACKEND_DEPLOYMENT_INTEGRATION.md`

---

**Last Updated:** November 23, 2025

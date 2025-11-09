# Atlantic Proxy - Technical Stack Architecture

## 🏗️ Full Stack Overview

### Frontend Layer
```
React.js + TypeScript
├── Next.js (SSR/SSG)
├── Tailwind CSS (Styling)
├── Shadcn/ui (Components)
├── React Query (State Management)
├── Chart.js (Analytics)
└── Framer Motion (Animations)
```

### Backend Layer
```
Node.js + Express.js
├── TypeScript
├── Prisma ORM
├── PostgreSQL (Primary DB)
├── Redis (Caching/Sessions)
├── JWT Authentication
└── Rate Limiting
```

### Infrastructure & DevOps (Open Source First)
```
Self-Hosted Platform
├── Docker + Docker Compose
├── Nginx (Reverse Proxy/Load Balancer)
├── PostgreSQL (Self-hosted)
├── Redis (Self-hosted)
├── MinIO (S3-compatible storage)
├── Traefik (Auto SSL/Routing)
└── GitHub Actions (CI/CD)
```

## 🔧 Detailed Technology Breakdown

### Frontend Technologies

**Core Framework**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **React 18** - Latest React features

**Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide Icons** - Consistent icon system
- **Framer Motion** - Smooth animations

**State Management**
- **React Query/TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling

**Data Visualization**
- **Chart.js** - Analytics dashboards
- **Recharts** - React chart library
- **D3.js** - Advanced visualizations

### Backend Technologies

**Runtime & Framework**
- **Node.js 20+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety

**Database & ORM**
- **PostgreSQL 15** - Primary database
- **Prisma** - Type-safe ORM
- **Redis** - Caching and sessions

**Authentication & Security**
- **JWT** - Token-based auth
- **bcrypt** - Password hashing
- **Helmet.js** - Security headers
- **CORS** - Cross-origin requests

**API & Integration**
- **Axios** - HTTP client for Oxylabs API
- **Zod** - Schema validation
- **Express Rate Limit** - API rate limiting

### Payment & Billing (Open Source Options)
- **Stripe** - Payment processing (when ready)
- **OpenPayd** - Open source alternative
- **jsPDF** - PDF invoice generation
- **Invoice Ninja** - Self-hosted invoicing

### Communication (Self-Hosted)
- **Nodemailer + SMTP** - Email service
- **Postal** - Self-hosted email server
- **Socket.io** - Real-time updates
- **Mattermost** - Team communication

## 📊 Database Schema Design

### Core Tables
```sql
-- Users and Authentication
users, user_sessions, user_roles

-- Proxy Management  
proxy_endpoints, proxy_usage, proxy_pools

-- Billing & Payments
subscriptions, invoices, payments, usage_records

-- Referral & Affiliate System
referral_codes, commissions, payouts

-- Support & Analytics
support_tickets, analytics_events, audit_logs
```

## 🔌 External Integrations

### Primary Services
- **Oxylabs API** - Proxy service provider
- **Stripe API** - Payment processing (later)
- **SMTP Server** - Self-hosted email
- **Chatwoot** - Open source customer support

### Analytics & Monitoring (Open Source)
- **Plausible** - Privacy-focused analytics
- **Matomo** - Self-hosted analytics
- **Sentry** - Error tracking (free tier)
- **Uptime Kuma** - Self-hosted monitoring
- **Grafana + Prometheus** - System monitoring

## 🚀 Development Workflow

### Local Development
```bash
# Frontend
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint + Prettier

# Backend  
npm run dev          # Express dev server
npm run db:migrate   # Prisma migrations
npm run db:seed      # Database seeding
```

### Testing Strategy
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **Supertest** - API testing
- **React Testing Library** - Component testing

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Type checking

## 🏗️ Architecture Patterns

### Frontend Architecture
```
src/
├── app/              # Next.js App Router
├── components/       # Reusable components
├── lib/             # Utilities and configs
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
└── styles/          # Global styles
```

### Backend Architecture
```
src/
├── routes/          # API endpoints
├── middleware/      # Express middleware
├── services/        # Business logic
├── models/          # Database models
├── utils/           # Helper functions
└── types/           # TypeScript definitions
```

## 🔒 Security Implementation

### Authentication Flow
1. **JWT Tokens** - Access + Refresh tokens
2. **Role-based Access** - User, Reseller, Admin
3. **API Key Management** - Secure key generation
4. **Session Management** - Redis-based sessions

### Data Protection
- **Encryption at Rest** - Database encryption
- **HTTPS Everywhere** - SSL/TLS certificates
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Prisma ORM

## 📈 Scalability Considerations

### Performance Optimization
- **Database Indexing** - Optimized queries
- **Redis Caching** - Frequently accessed data
- **CDN Integration** - Static asset delivery
- **API Rate Limiting** - Prevent abuse

### Horizontal Scaling
- **Stateless Backend** - Easy horizontal scaling
- **Database Sharding** - Future consideration
- **Microservices** - Service separation
- **Load Balancing** - Traffic distribution

## 🛠️ Development Tools

### IDE & Extensions
- **VS Code** - Primary IDE
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Thunder Client** - API testing

### Database Tools
- **Prisma Studio** - Database GUI
- **pgAdmin** - PostgreSQL management
- **Redis CLI** - Redis management

## 📦 Package Management

### Frontend Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "@tanstack/react-query": "^5.0.0",
  "framer-motion": "^10.0.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "prisma": "^5.0.0",
  "typescript": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "stripe": "^14.0.0"
}
```

## 🚀 Deployment Strategy (Open Source First)

### Self-Hosted Environment
- **VPS/Dedicated Server**: Hetzner, DigitalOcean, or Contabo
- **Container Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx or Traefik
- **SSL**: Let's Encrypt (free)
- **CDN**: CloudFlare (free tier)

### Docker Compose Setup
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [postgres, redis]
  
  postgres:
    image: postgres:15
    volumes: ["postgres_data:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
  
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
```

## 💰 Cost Estimation (Open Source First)

### Development Phase (Self-Hosted)
- **VPS (4GB RAM, 2 CPU)**: $10-20/month
- **Domain + SSL**: $15/year
- **Backup Storage**: $5/month
- **External APIs**: $50/month
- **Total**: ~$70/month

### Production Scale (Self-Hosted)
- **Dedicated Server**: $50-150/month
- **CDN (CloudFlare Pro)**: $20/month
- **Backup & Monitoring**: $20/month
- **External Services**: $100-300/month
- **Total**: $190-490/month

### Migration to Cloud (When Scaling)
- **AWS/GCP**: $300-1000/month
- **Managed Services**: $200-500/month
- **Total**: $500-1500/month

---

This stack provides a solid foundation for building a scalable proxy marketplace with all the features needed for your referral, affiliate, and white-label programs.
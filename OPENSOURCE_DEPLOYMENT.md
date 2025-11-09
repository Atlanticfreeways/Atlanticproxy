# Atlantic Proxy - Open Source Deployment Guide

## 🎯 Open Source First Approach

Start with self-hosted, open-source tools and migrate to managed services as you scale.

## 🏗️ Phase 1: Local Development Setup

### Prerequisites
```bash
# Install required tools
- Node.js 20+
- Docker & Docker Compose
- Git
- VS Code (recommended)
```

### Project Structure
```
atlantic-proxy/
├── frontend/          # Next.js application
├── backend/           # Express.js API
├── database/          # PostgreSQL setup
├── docker-compose.yml # Local development
├── nginx/             # Reverse proxy config
└── scripts/           # Deployment scripts
```

### Docker Compose for Development
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: atlantic_proxy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
```

### Quick Start Commands
```bash
# Clone and setup
git clone <repo-url> atlantic-proxy
cd atlantic-proxy

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Setup database
cd backend && npm run db:migrate && npm run db:seed

# Start development servers
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 5000
```

## 🚀 Phase 2: Self-Hosted Production

### Server Requirements
```
Minimum: 2GB RAM, 1 CPU, 20GB SSD
Recommended: 4GB RAM, 2 CPU, 40GB SSD
Scaling: 8GB RAM, 4 CPU, 80GB SSD
```

### VPS Provider Options
- **Hetzner**: €4.15/month (2GB RAM, 1 CPU)
- **DigitalOcean**: $12/month (2GB RAM, 1 CPU)
- **Contabo**: €4.99/month (4GB RAM, 2 CPU)
- **Vultr**: $6/month (1GB RAM, 1 CPU)

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/atlantic_proxy
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: atlantic_proxy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - certbot_data:/var/www/certbot

  certbot:
    image: certbot/certbot
    volumes:
      - certbot_data:/var/www/certbot
      - ./nginx/ssl:/etc/letsencrypt

volumes:
  postgres_data:
  redis_data:
  certbot_data:
```

### Nginx Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;
        
        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 🔧 Open Source Tools Integration

### Analytics: Plausible (Self-Hosted)
```yaml
# Add to docker-compose.yml
plausible:
  image: plausible/analytics:latest
  restart: unless-stopped
  command: sh -c "sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh run"
  depends_on:
    - plausible_db
  ports:
    - "8000:8000"
  environment:
    - BASE_URL=https://analytics.your-domain.com
    - SECRET_KEY_BASE=your-secret-key

plausible_db:
  image: postgres:14-alpine
  restart: unless-stopped
  volumes:
    - plausible_data:/var/lib/postgresql/data
  environment:
    - POSTGRES_PASSWORD=postgres
```

### Customer Support: Chatwoot
```yaml
chatwoot:
  image: chatwoot/chatwoot:latest
  restart: unless-stopped
  ports:
    - "3001:3000"
  environment:
    - RAILS_ENV=production
    - DATABASE_URL=postgresql://postgres:password@postgres:5432/chatwoot
    - REDIS_URL=redis://redis:6379
```

### Monitoring: Uptime Kuma
```yaml
uptime-kuma:
  image: louislam/uptime-kuma:1
  restart: unless-stopped
  ports:
    - "3002:3001"
  volumes:
    - uptime_data:/app/data
```

## 📊 Database Setup

### PostgreSQL Schema
```sql
-- database/init.sql
CREATE DATABASE atlantic_proxy;

-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Proxy Endpoints
CREATE TABLE proxy_endpoints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint_url VARCHAR(255) NOT NULL,
    proxy_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    endpoint_id INTEGER REFERENCES proxy_endpoints(id),
    bytes_used BIGINT DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Referral System
CREATE TABLE referral_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment Script

### Automated Deployment
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Deploying Atlantic Proxy..."

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Setup SSL if first time
if [ ! -f "./nginx/ssl/live/your-domain.com/fullchain.pem" ]; then
    echo "🔒 Setting up SSL..."
    docker-compose -f docker-compose.prod.yml exec certbot certbot certonly --webroot -w /var/www/certbot -d your-domain.com
    docker-compose -f docker-compose.prod.yml restart nginx
fi

echo "✅ Deployment complete!"
```

## 📈 Scaling Strategy

### Phase 1: Single Server (0-1K users)
- 1 VPS with Docker Compose
- All services on same server
- Cost: $10-20/month

### Phase 2: Load Balancing (1K-10K users)
- 2-3 VPS servers
- Separate database server
- Load balancer (Nginx)
- Cost: $50-100/month

### Phase 3: Microservices (10K+ users)
- Kubernetes cluster
- Separate services
- Managed databases
- Cost: $200-500/month

### Phase 4: Cloud Migration (50K+ users)
- AWS/GCP managed services
- Auto-scaling
- CDN and edge locations
- Cost: $500-2000/month

## 🔒 Security Checklist

### Server Security
```bash
# Basic server hardening
sudo ufw enable
sudo ufw allow 22,80,443/tcp

# Fail2ban for SSH protection
sudo apt install fail2ban

# Automatic security updates
sudo apt install unattended-upgrades
```

### Application Security
- JWT tokens with short expiration
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection prevention with Prisma
- HTTPS everywhere with Let's Encrypt

## 📋 Monitoring Setup

### System Monitoring
```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3003:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - grafana_data:/var/lib/grafana
```

### Application Monitoring
```javascript
// backend/middleware/metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

module.exports = { httpRequestDuration };
```

## 💰 Cost Breakdown

### Monthly Costs (Self-Hosted)
- **VPS (4GB)**: $20/month
- **Domain**: $1/month
- **Backup Storage**: $5/month
- **Monitoring Tools**: $0 (self-hosted)
- **Total**: $26/month

### vs Cloud Providers
- **Vercel + AWS**: $200+/month
- **Self-hosted**: $26/month
- **Savings**: $174/month (85% cost reduction)

---

This open-source approach gives you full control, significant cost savings, and the flexibility to migrate to cloud services when you're ready to scale.
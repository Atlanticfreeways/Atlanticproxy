# Production Deployment Guide

**Version:** 1.0.0  
**Last Updated:** November 25, 2025

---

## Overview

This guide covers deploying Atlantic Proxy to production using Docker, Docker Compose, and cloud infrastructure.

---

## Pre-Deployment Checklist

### Code & Testing
- [x] All tests passing
- [x] Code review completed
- [x] Security audit passed
- [x] Performance benchmarks met
- [x] Load tests successful
- [x] Documentation complete

### Infrastructure
- [ ] Production environment provisioned
- [ ] Database server ready
- [ ] SSL certificates obtained
- [ ] Domain configured
- [ ] DNS records updated
- [ ] Firewall rules configured
- [ ] Backup storage ready
- [ ] Monitoring tools configured

### Configuration
- [ ] Environment variables prepared
- [ ] Database credentials secured
- [ ] API keys configured
- [ ] Secrets management setup
- [ ] Logging configured
- [ ] Monitoring configured
- [ ] Alerting configured

---

## Environment Setup

### Production Environment Variables

Create `.env.prod` with:

```bash
# Database
DATABASE_URL=postgresql://user:password@db.example.com:5432/atlantic_proxy
DATABASE_POOL_SIZE=50

# Security
JWT_SECRET=<generate-secure-random-string>
ENCRYPTION_KEY=<generate-secure-random-string>

# TLS/HTTPS
TLS_CERT_FILE=/etc/ssl/certs/atlantic-proxy.crt
TLS_KEY_FILE=/etc/ssl/private/atlantic-proxy.key

# Paystack
PAYSTACK_SECRET_KEY=<your-paystack-secret-key>

# Environment
ENVIRONMENT=production
LOG_LEVEL=info

# API
API_BASE_URL=https://api.atlanticproxy.com
FRONTEND_URL=https://atlanticproxy.com

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32

# Generate database password
openssl rand -base64 16
```

---

## Database Setup

### Create Production Database

```bash
# Connect to PostgreSQL server
psql -h db.example.com -U postgres

# Create database
CREATE DATABASE atlantic_proxy;

# Create user
CREATE USER atlantic_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE atlantic_proxy TO atlantic_user;
```

### Initialize Schema

```bash
# Run migrations
cd backend
DATABASE_URL="postgresql://atlantic_user:password@db.example.com:5432/atlantic_proxy" \
  go run cmd/server/main.go
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/atlantic-proxy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump -h db.example.com -U atlantic_user atlantic_proxy | \
  gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Keep last 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
```

---

## Docker Deployment

### Build Production Images

```bash
# Build backend
docker build -f backend/Dockerfile.prod \
  -t atlantic-proxy-backend:1.0.0 \
  -t atlantic-proxy-backend:latest .

# Build frontend
docker build -f frontend/Dockerfile.prod \
  -t atlantic-proxy-frontend:1.0.0 \
  -t atlantic-proxy-frontend:latest .

# Push to registry
docker push atlantic-proxy-backend:latest
docker push atlantic-proxy-frontend:latest
```

### Deploy with Docker Compose

```bash
# Copy production compose file
cp docker-compose.prod.yml docker-compose.yml

# Start services
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  backend:
    image: atlantic-proxy-backend:latest
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/atlantic_proxy
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - ENVIRONMENT=production
    depends_on:
      - db
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: atlantic-proxy-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.atlanticproxy.com
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=atlantic_proxy
      - POSTGRES_USER=atlantic_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U atlantic_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## SSL/TLS Configuration

### Obtain SSL Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone \
  -d atlanticproxy.com \
  -d api.atlanticproxy.com

# Certificates will be in:
# /etc/letsencrypt/live/atlanticproxy.com/
```

### Configure in Backend

```bash
# Set environment variables
export TLS_CERT_FILE=/etc/letsencrypt/live/atlanticproxy.com/fullchain.pem
export TLS_KEY_FILE=/etc/letsencrypt/live/atlanticproxy.com/privkey.pem
```

### Auto-Renewal

```bash
# Add to crontab
0 0 1 * * certbot renew --quiet && docker-compose restart backend
```

---

## Nginx Reverse Proxy

### Configuration

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name atlanticproxy.com api.atlanticproxy.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.atlanticproxy.com;

    ssl_certificate /etc/letsencrypt/live/atlanticproxy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atlanticproxy.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name atlanticproxy.com;

    ssl_certificate /etc/letsencrypt/live/atlanticproxy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atlanticproxy.com/privkey.pem;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_proxies_user_id ON proxies(user_id);
CREATE INDEX idx_analytics_proxy_id ON analytics(proxy_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE proxies;
ANALYZE analytics;
```

### Connection Pooling

```bash
# Configure in .env.prod
DATABASE_POOL_SIZE=50
DATABASE_POOL_TIMEOUT=30
```

### Caching Strategy

```go
// Implement Redis caching
import "github.com/go-redis/redis/v8"

client := redis.NewClient(&redis.Options{
    Addr: "localhost:6379",
})

// Cache frequently accessed data
// - User profiles
// - Billing plans
// - Analytics summaries
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Setup Prometheus
docker run -d \
  -p 9090:9090 \
  -v /etc/prometheus:/etc/prometheus \
  prom/prometheus

# Setup Grafana
docker run -d \
  -p 3001:3000 \
  grafana/grafana
```

### Log Aggregation

```bash
# Setup ELK Stack
docker-compose -f elk-compose.yml up -d

# Configure application logging
export LOG_LEVEL=info
export LOG_FORMAT=json
```

### Error Tracking

```bash
# Setup Sentry
export SENTRY_DSN=https://key@sentry.io/project-id

# Errors will be automatically tracked
```

### Alerting

```yaml
# Prometheus alert rules
groups:
  - name: atlantic_proxy
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        annotations:
          summary: "High latency detected"

      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        annotations:
          summary: "Database is down"
```

---

## Health Checks

### Endpoint Monitoring

```bash
# Health check endpoint
curl https://api.atlanticproxy.com/health

# Response
{
  "status": "ok",
  "timestamp": "2025-11-25T12:00:00Z",
  "version": "1.0.0"
}
```

### Automated Monitoring

```bash
#!/bin/bash
# Monitor script
while true; do
  STATUS=$(curl -s https://api.atlanticproxy.com/health | jq -r '.status')
  if [ "$STATUS" != "ok" ]; then
    # Send alert
    curl -X POST https://alerts.example.com/notify \
      -d "Atlantic Proxy is down"
  fi
  sleep 60
done
```

---

## Backup & Disaster Recovery

### Automated Backups

```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/backups/atlantic-proxy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h db.example.com -U atlantic_user atlantic_proxy | \
  gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" \
  /opt/atlantic-proxy

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$TIMESTAMP.sql.gz" \
  s3://atlantic-proxy-backups/

# Cleanup old backups
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
```

### Disaster Recovery Plan

1. **Database Failure**
   - Restore from latest backup
   - Verify data integrity
   - Restart services

2. **Service Failure**
   - Check logs for errors
   - Restart Docker containers
   - Verify health checks

3. **Complete Outage**
   - Restore from backup
   - Redeploy services
   - Verify all endpoints
   - Notify users

---

## Post-Deployment Verification

### Smoke Tests

```bash
# Test authentication
curl -X POST https://api.atlanticproxy.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Test API endpoints
curl https://api.atlanticproxy.com/api/billing/plans

# Test frontend
curl https://atlanticproxy.com
```

### Performance Verification

```bash
# Check response times
ab -n 1000 -c 100 https://api.atlanticproxy.com/health

# Monitor resources
docker stats

# Check logs
docker-compose logs backend
```

---

## Rollback Procedure

### If Issues Occur

```bash
# Stop current deployment
docker-compose down

# Restore previous version
docker-compose -f docker-compose.prod.yml up -d \
  -e BACKEND_IMAGE=atlantic-proxy-backend:previous

# Verify services
docker-compose ps
docker-compose logs -f
```

---

## Maintenance

### Regular Tasks

- Daily: Check logs and alerts
- Weekly: Review performance metrics
- Monthly: Update dependencies
- Quarterly: Security audit
- Annually: Disaster recovery drill

### Updates

```bash
# Update dependencies
go get -u ./...
npm update

# Rebuild images
docker build -f backend/Dockerfile.prod -t atlantic-proxy-backend:latest .
docker build -f frontend/Dockerfile.prod -t atlantic-proxy-frontend:latest .

# Redeploy
docker-compose up -d
```

---

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Review this guide
- Check health endpoint
- Contact support team

---

**Production Deployment Guide**  
**Version: 1.0.0**  
**Status: Ready for Production**

🚀 **Deploy with confidence!**

# Deployment Guide

**Last Updated:** February 14, 2026  
**Target:** Production & Staging  
**Status:** Ready for Week 4-5

---

## 🎯 Overview

This guide covers deploying AtlanticProxy to staging and production environments.

**Deployment Timeline:**
- **Week 4:** Staging deployment + beta testing
- **Week 5:** Production deployment + launch

---

## 📋 Prerequisites

### Required Accounts
- [ ] VPS/Cloud provider (DigitalOcean, AWS, or Hetzner)
- [ ] PostgreSQL hosting (Supabase or Railway)
- [ ] Redis hosting (Upstash or Redis Cloud)
- [ ] Domain registrar (Namecheap or Cloudflare)
- [ ] Cloudflare account (CDN + SSL)
- [ ] Paystack account (live keys)
- [ ] Sentry account (error tracking)

### Required Tools
- [ ] Docker & Docker Compose
- [ ] Git
- [ ] SSH client
- [ ] Domain access

---

## 🖥️ Server Requirements

### Staging Environment
- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 50GB SSD
- **Bandwidth:** 2TB/month
- **OS:** Ubuntu 22.04 LTS
- **Cost:** ~$20/month

### Production Environment
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 100GB SSD
- **Bandwidth:** 5TB/month
- **OS:** Ubuntu 22.04 LTS
- **Cost:** ~$40/month

### Recommended Providers
- **DigitalOcean:** $24/month (4GB RAM)
- **Hetzner:** €15/month (8GB RAM)
- **AWS Lightsail:** $20/month (4GB RAM)

---

## 🚀 Staging Deployment (Week 4, Day 1)

### Step 1: Provision Server

**DigitalOcean Example:**
```bash
# Create droplet
doctl compute droplet create atlanticproxy-staging \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys YOUR_SSH_KEY_ID

# Get IP address
doctl compute droplet list
```

### Step 2: Initial Server Setup

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app user
adduser atlantic
usermod -aG docker atlantic
usermod -aG sudo atlantic

# Switch to app user
su - atlantic
```

### Step 3: Configure Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8082/tcp
sudo ufw enable

# Verify
sudo ufw status
```

### Step 4: Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone \
  -d staging.atlanticproxy.com \
  --email support@atlanticproxy.com \
  --agree-tos

# Certificates will be in:
# /etc/letsencrypt/live/staging.atlanticproxy.com/
```

### Step 5: Clone Repository

```bash
# Clone repo
git clone https://github.com/Atlanticfreeways/Atlanticproxy.git
cd Atlanticproxy

# Checkout specific version
git checkout v1.0.0
```

### Step 6: Configure Environment

```bash
# Copy environment file
cp scripts/proxy-client/.env.example scripts/proxy-client/.env

# Edit environment variables
nano scripts/proxy-client/.env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgres://user:pass@host:5432/atlanticproxy
POSTGRES_PASSWORD=CHANGE_ME

# Paystack (TEST keys for staging)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# JWT
JWT_SECRET=GENERATE_32_CHAR_SECRET_HERE

# CORS
ALLOWED_ORIGINS=https://staging.atlanticproxy.com

# Server
PORT=8082
ENV=staging

# Monitoring
GRAFANA_PASSWORD=CHANGE_ME
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Sentry
SENTRY_DSN=https://...@sentry.io/...
```

### Step 7: Set Up PostgreSQL

**Option A: Supabase (Recommended)**
```bash
# 1. Create project at supabase.com
# 2. Get connection string
# 3. Update DATABASE_URL in .env
# 4. Run migrations

cd scripts/proxy-client
psql $DATABASE_URL < migrations/001_postgresql.sql
```

**Option B: Self-Hosted**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run migrations
docker exec -i atlantic-postgres psql -U atlantic atlanticproxy < migrations/001_postgresql.sql
```

### Step 8: Deploy Application

```bash
# Build and start services
cd scripts/proxy-client
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f atlantic-proxy
```

### Step 9: Start Monitoring Stack

```bash
# Start monitoring services
cd ../../docker
docker-compose -f monitoring.yml up -d

# Verify
docker ps

# Access Grafana
# http://YOUR_SERVER_IP:3001
# Username: admin
# Password: (from GRAFANA_PASSWORD)
```

### Step 10: Configure DNS

**Cloudflare Setup:**
```
1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Add A record:
   - Name: staging
   - Content: YOUR_SERVER_IP
   - Proxy: Enabled (orange cloud)
4. Add CNAME record:
   - Name: www.staging
   - Content: staging.atlanticproxy.com
```

### Step 11: Deploy Frontend

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd atlantic-dashboard
vercel --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://staging.atlanticproxy.com
```

### Step 12: Verify Deployment

```bash
# Health check
curl https://staging.atlanticproxy.com/health

# Test registration
curl -X POST https://staging.atlanticproxy.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Check metrics
curl https://staging.atlanticproxy.com/metrics
```

---

## 🏭 Production Deployment (Week 5, Day 1-2)

### Differences from Staging

1. **Use Production Paystack Keys**
   ```bash
   PAYSTACK_SECRET_KEY=sk_live_...
   PAYSTACK_PUBLIC_KEY=pk_live_...
   ```

2. **Higher Server Specs**
   - 4 CPU cores
   - 8GB RAM
   - 100GB storage

3. **Production Domain**
   ```
   atlanticproxy.com (not staging subdomain)
   ```

4. **Managed Services**
   - PostgreSQL: Supabase Pro ($25/month)
   - Redis: Upstash Pro ($10/month)
   - CDN: Cloudflare Pro ($20/month)

5. **Automated Backups**
   ```bash
   # Daily PostgreSQL backups
   0 2 * * * pg_dump $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).sql
   ```

6. **Monitoring Alerts**
   - Configure PagerDuty for critical alerts
   - Set up Slack notifications
   - Enable Sentry error tracking

### Production Checklist

- [ ] Server provisioned (4 CPU, 8GB RAM)
- [ ] PostgreSQL (managed service)
- [ ] Redis (managed service)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Domain configured (atlanticproxy.com)
- [ ] CDN enabled (Cloudflare)
- [ ] Environment variables set (production)
- [ ] Paystack live keys configured
- [ ] Monitoring stack deployed
- [ ] Sentry configured
- [ ] Automated backups enabled
- [ ] Firewall configured
- [ ] Health checks passing
- [ ] Load testing completed

---

## 🔄 Deployment Process

### Standard Deployment

```bash
# 1. SSH into server
ssh atlantic@YOUR_SERVER_IP

# 2. Navigate to repo
cd Atlanticproxy

# 3. Pull latest changes
git pull origin main

# 4. Rebuild containers
cd scripts/proxy-client
docker-compose down
docker-compose build
docker-compose up -d

# 5. Run migrations (if any)
docker exec -i atlantic-postgres psql -U atlantic atlanticproxy < migrations/NEW_MIGRATION.sql

# 6. Verify deployment
docker-compose ps
docker-compose logs -f atlantic-proxy

# 7. Check health
curl http://localhost:8082/health
```

### Zero-Downtime Deployment

```bash
# 1. Build new image
docker-compose build atlantic-proxy

# 2. Start new container
docker-compose up -d --no-deps --scale atlantic-proxy=2 atlantic-proxy

# 3. Wait for health check
sleep 10

# 4. Stop old container
docker-compose up -d --no-deps --scale atlantic-proxy=1 atlantic-proxy
```

### Rollback Procedure

```bash
# 1. Checkout previous version
git checkout v1.0.0

# 2. Rebuild and restart
docker-compose down
docker-compose up -d

# 3. Verify
curl http://localhost:8082/health
```

---

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl https://atlanticproxy.com/health

# Database health
docker exec atlantic-postgres pg_isready

# Redis health
docker exec atlantic-redis redis-cli ping
```

### Grafana Dashboards

**Access:** https://atlanticproxy.com:3001

**Key Metrics:**
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- CPU usage (%)
- Memory usage (MB)
- Database connections

### Sentry Error Tracking

**Access:** https://sentry.io

**Alerts:**
- New error types
- Error rate spikes
- Performance degradation

### Log Aggregation

```bash
# View application logs
docker-compose logs -f atlantic-proxy

# View all logs
docker-compose logs -f

# Search logs in Grafana
# Navigate to Explore → Loki
```

---

## 🔐 Security

### SSL/TLS Configuration

```nginx
# Nginx config (if using reverse proxy)
server {
    listen 443 ssl http2;
    server_name atlanticproxy.com;
    
    ssl_certificate /etc/letsencrypt/live/atlanticproxy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atlanticproxy.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Secrets Management

```bash
# Never commit secrets to Git
# Use environment variables
# Rotate secrets regularly

# Generate secure JWT secret
openssl rand -base64 32
```

---

## 🔧 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs atlantic-proxy

# Check environment variables
docker-compose config

# Rebuild
docker-compose build --no-cache
```

**Database connection failed:**
```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL logs
docker-compose logs postgres

# Verify credentials in .env
```

**High memory usage:**
```bash
# Check container stats
docker stats

# Restart container
docker-compose restart atlantic-proxy

# Increase server RAM if needed
```

**SSL certificate expired:**
```bash
# Renew certificate
sudo certbot renew

# Restart nginx
sudo systemctl restart nginx
```

---

## 📝 Maintenance

### Daily Tasks
- [ ] Check error logs in Sentry
- [ ] Monitor Grafana dashboards
- [ ] Review alert notifications

### Weekly Tasks
- [ ] Review server resources
- [ ] Check backup integrity
- [ ] Update dependencies (if needed)

### Monthly Tasks
- [ ] Security updates
- [ ] Performance optimization
- [ ] Cost review

---

## 🆘 Emergency Procedures

### Service Down

```bash
# 1. Check service status
docker-compose ps

# 2. Restart services
docker-compose restart

# 3. Check logs
docker-compose logs -f

# 4. If still down, rollback
git checkout PREVIOUS_VERSION
docker-compose up -d
```

### Database Issues

```bash
# 1. Check database status
docker exec atlantic-postgres pg_isready

# 2. Restore from backup
psql $DATABASE_URL < /backups/db_YYYYMMDD.sql

# 3. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### High Load

```bash
# 1. Scale horizontally
docker-compose up -d --scale atlantic-proxy=3

# 2. Enable rate limiting
# (already configured in code)

# 3. Enable CDN caching
# (configure in Cloudflare)
```

---

## 📞 Support Contacts

- **DevOps:** devops@atlanticproxy.com
- **On-Call:** +1-XXX-XXX-XXXX
- **Slack:** #atlanticproxy-ops
- **PagerDuty:** atlanticproxy.pagerduty.com

---

**Next Steps:**
1. Complete Week 2-3 (Testing & Hardening)
2. Deploy to staging (Week 4)
3. Beta test with 100 users
4. Deploy to production (Week 5)
5. Monitor and scale

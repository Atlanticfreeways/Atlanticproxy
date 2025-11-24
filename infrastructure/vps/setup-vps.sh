#!/bin/bash

# Atlantic Proxy VPS Setup Script
# Supports: DigitalOcean, Linode, Vultr, Hetzner

set -e

echo "🚀 Atlantic Proxy VPS Setup Starting..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"atlanticproxy.com"}
EMAIL=${EMAIL:-"admin@atlanticproxy.com"}
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -base64 32)}
REDIS_PASSWORD=${REDIS_PASSWORD:-$(openssl rand -base64 32)}
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 64)}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Generated secure passwords for DB and Redis"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}🔧 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Install additional tools
echo -e "${YELLOW}🛠️  Installing additional tools...${NC}"
apt install -y git curl wget unzip htop nano certbot python3-certbot-nginx

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /opt/atlantic-proxy
cd /opt/atlantic-proxy

# Clone repository (if not already present)
if [ ! -d "Atlanticproxy" ]; then
    echo -e "${YELLOW}📥 Cloning Atlantic Proxy repository...${NC}"
    git clone https://github.com/your-username/Atlanticproxy.git
else
    echo -e "${GREEN}✅ Repository already exists${NC}"
fi

cd Atlanticproxy

# Create production environment file
echo -e "${YELLOW}⚙️  Creating production environment...${NC}"
cat > .env.production << EOF
# Atlantic Proxy Production Environment
OXYLABS_API_KEY=c32d48492e6dbe27e92559a6d60d2bfe2eb92d279fd844edc8f5429e46ae080e
OXYLABS_NETWORK_ID=oxylabs
OXYLABS_ENDPOINT=https://realtime.oxylabs.io/v1/queries

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=atlantic_proxy
DB_USER=atlantic_user
DB_PASSWORD=$DB_PASSWORD

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=24h

# Server Configuration
SERVER_ENV=production
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# Stripe Configuration (add your keys)
STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Security
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15m
EOF

# Set proper permissions
chmod 600 .env.production
echo -e "${GREEN}✅ Environment file created with secure permissions${NC}"

# Create Dockerfiles for VPS
echo -e "${YELLOW}🐳 Creating VPS-specific Dockerfiles...${NC}"

# Auth service Dockerfile
cat > infrastructure/vps/Dockerfile.auth << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY auth-system.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o auth-system auth-system.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/auth-system .
EXPOSE 8081
CMD ["./auth-system"]
EOF

# Billing service Dockerfile
cat > infrastructure/vps/Dockerfile.billing << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY billing-system.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o billing-system billing-system.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/billing-system .
EXPOSE 8082
CMD ["./billing-system"]
EOF

# Support service Dockerfile
cat > infrastructure/vps/Dockerfile.support << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY support-system.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o support-system support-system.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/support-system .
EXPOSE 8083
CMD ["./support-system"]
EOF

# Analytics service Dockerfile
cat > infrastructure/vps/Dockerfile.analytics << 'EOF'
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY analytics-system.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o analytics-system analytics-system.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/analytics-system .
EXPOSE 8085
CMD ["./analytics-system"]
EOF

echo -e "${GREEN}✅ Dockerfiles created${NC}"

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
echo -e "${GREEN}✅ Firewall configured${NC}"

# Create systemd service for auto-start
echo -e "${YELLOW}⚙️  Creating systemd service...${NC}"
cat > /etc/systemd/system/atlantic-proxy.service << EOF
[Unit]
Description=Atlantic Proxy Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/atlantic-proxy/Atlanticproxy
ExecStart=/usr/local/bin/docker-compose -f infrastructure/vps/docker-compose.vps.yml --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose -f infrastructure/vps/docker-compose.vps.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable atlantic-proxy.service
echo -e "${GREEN}✅ Systemd service created${NC}"

# Start services
echo -e "${YELLOW}🚀 Starting Atlantic Proxy services...${NC}"
docker-compose -f infrastructure/vps/docker-compose.vps.yml --env-file .env.production up -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f infrastructure/vps/docker-compose.vps.yml ps

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo -e "${GREEN}🎉 Atlantic Proxy VPS Setup Complete!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Point your domain $DOMAIN to this server IP: $SERVER_IP"
echo "2. Run SSL setup: ./ssl-setup.sh"
echo "3. Access your services:"
echo "   - Dashboard: http://$SERVER_IP:8080"
echo "   - Auth: http://$SERVER_IP:8081"
echo "   - Billing: http://$SERVER_IP:8082"
echo "   - Support: http://$SERVER_IP:8083"
echo "   - Analytics: http://$SERVER_IP:8085"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Update your Stripe keys in .env.production"
echo "- Configure your domain DNS settings"
echo "- Run SSL setup after DNS propagation"
echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
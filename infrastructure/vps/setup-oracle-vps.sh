#!/bin/bash

# Atlantic Proxy VPS Setup Script with Oracle Database
# Supports: DigitalOcean, Linode, Vultr, Hetzner with Oracle XE

set -e

echo "🚀 Atlantic Proxy VPS Setup with Oracle Database Starting..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"atlanticproxy.com"}
EMAIL=${EMAIL:-"admin@atlanticproxy.com"}
ORACLE_PASSWORD=${ORACLE_PASSWORD:-$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)AtP!}
REDIS_PASSWORD=${REDIS_PASSWORD:-$(openssl rand -base64 32)}
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 64)}

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Generated secure Oracle password"
echo "  Generated secure Redis password"

# Check system requirements for Oracle
echo -e "${YELLOW}🔍 Checking system requirements for Oracle...${NC}"
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ $TOTAL_MEM -lt 2048 ]; then
    echo -e "${RED}❌ Oracle XE requires at least 2GB RAM. Current: ${TOTAL_MEM}MB${NC}"
    echo "Please upgrade to a server with at least 2GB RAM"
    exit 1
fi
echo -e "${GREEN}✅ System has sufficient memory: ${TOTAL_MEM}MB${NC}"

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

# Login to Oracle Container Registry
echo -e "${YELLOW}🔐 Setting up Oracle Container Registry access...${NC}"
echo "You need to accept Oracle's license and login to container-registry.oracle.com"
echo "1. Go to https://container-registry.oracle.com"
echo "2. Sign in with Oracle account"
echo "3. Accept license for Database -> express"
echo ""
read -p "Have you accepted the Oracle license? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Oracle license acceptance required${NC}"
    echo "Please accept the license and run this script again"
    exit 1
fi

echo "Please enter your Oracle Container Registry credentials:"
read -p "Username: " ORACLE_USERNAME
read -s -p "Password: " ORACLE_PASSWORD_INPUT
echo

# Login to Oracle registry
echo $ORACLE_PASSWORD_INPUT | docker login container-registry.oracle.com -u $ORACLE_USERNAME --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Oracle Container Registry login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Oracle Container Registry login successful${NC}"

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

# Create production environment file for Oracle
echo -e "${YELLOW}⚙️  Creating Oracle production environment...${NC}"
cat > .env.oracle.production << EOF
# Atlantic Proxy Production Environment with Oracle
OXYLABS_API_KEY=c32d48492e6dbe27e92559a6d60d2bfe2eb92d279fd844edc8f5429e46ae080e
OXYLABS_NETWORK_ID=oxylabs
OXYLABS_ENDPOINT=https://realtime.oxylabs.io/v1/queries

# Oracle Database Configuration
DB_TYPE=oracle
DB_HOST=oracle-db
DB_PORT=1521
DB_SERVICE=XEPDB1
DB_USER=atlantic_user
DB_PASSWORD=AtlanticProxy2024!
ORACLE_PASSWORD=$ORACLE_PASSWORD

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
chmod 600 .env.oracle.production
echo -e "${GREEN}✅ Oracle environment file created with secure permissions${NC}"

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 1521  # Oracle port
echo -e "${GREEN}✅ Firewall configured${NC}"

# Create systemd service for auto-start
echo -e "${YELLOW}⚙️  Creating systemd service...${NC}"
cat > /etc/systemd/system/atlantic-proxy-oracle.service << EOF
[Unit]
Description=Atlantic Proxy Services with Oracle
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/atlantic-proxy/Atlanticproxy
ExecStart=/usr/local/bin/docker-compose -f infrastructure/vps/docker-compose.oracle.yml --env-file .env.oracle.production up -d
ExecStop=/usr/local/bin/docker-compose -f infrastructure/vps/docker-compose.oracle.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl enable atlantic-proxy-oracle.service
echo -e "${GREEN}✅ Systemd service created${NC}"

# Pull Oracle image (this may take a while)
echo -e "${YELLOW}📥 Pulling Oracle Database image (this may take 5-10 minutes)...${NC}"
docker pull container-registry.oracle.com/database/express:21.3.0-xe

# Start services
echo -e "${YELLOW}🚀 Starting Atlantic Proxy services with Oracle...${NC}"
docker-compose -f infrastructure/vps/docker-compose.oracle.yml --env-file .env.oracle.production up -d

# Wait for Oracle to start (Oracle takes longer to initialize)
echo -e "${YELLOW}⏳ Waiting for Oracle Database to initialize (this may take 2-5 minutes)...${NC}"
sleep 120

# Check Oracle status
echo -e "${YELLOW}🔍 Checking Oracle Database status...${NC}"
for i in {1..10}; do
    if docker exec oracle-xe sqlplus -L system/${ORACLE_PASSWORD}@//localhost:1521/XE @/dev/null <<< "SELECT 'Oracle is ready' FROM dual;" 2>/dev/null | grep -q "Oracle is ready"; then
        echo -e "${GREEN}✅ Oracle Database is ready${NC}"
        break
    fi
    echo "Waiting for Oracle... ($i/10)"
    sleep 30
done

# Initialize database schema
echo -e "${YELLOW}🗄️  Initializing database schema...${NC}"
docker exec oracle-xe sqlplus atlantic_user/AtlanticProxy2024!@//localhost:1521/XEPDB1 @/docker-entrypoint-initdb.d/02-create-schema.sql

# Check service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f infrastructure/vps/docker-compose.oracle.yml ps

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo -e "${GREEN}🎉 Atlantic Proxy VPS Setup with Oracle Complete!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Point your domain $DOMAIN to this server IP: $SERVER_IP"
echo "2. Run SSL setup: ./ssl-setup.sh"
echo "3. Access your services:"
echo "   - Dashboard: http://$SERVER_IP:8080"
echo "   - Auth: http://$SERVER_IP:8081"
echo "   - Billing: http://$SERVER_IP:8082"
echo "   - Support: http://$SERVER_IP:8083"
echo "   - Analytics: http://$SERVER_IP:8085"
echo "   - Oracle EM Express: https://$SERVER_IP:5500/em"
echo ""
echo -e "${BLUE}🗄️  Oracle Database Info:${NC}"
echo "   - Host: $SERVER_IP:1521"
echo "   - Service: XEPDB1"
echo "   - User: atlantic_user"
echo "   - Password: AtlanticProxy2024!"
echo "   - SYS Password: $ORACLE_PASSWORD"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Update your Stripe keys in .env.oracle.production"
echo "- Configure your domain DNS settings"
echo "- Run SSL setup after DNS propagation"
echo "- Oracle uses more memory - monitor system resources"
echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
#!/bin/bash

# Atlantic Proxy SSL Setup Script
# Sets up Let's Encrypt SSL certificates

set -e

echo "🔒 Atlantic Proxy SSL Setup Starting..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN=${DOMAIN:-"atlanticproxy.com"}
EMAIL=${EMAIL:-"admin@atlanticproxy.com"}

echo -e "${BLUE}📋 SSL Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"

# Check if domain points to this server
echo -e "${YELLOW}🔍 Checking DNS configuration...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo -e "${RED}❌ DNS not configured correctly${NC}"
    echo "Server IP: $SERVER_IP"
    echo "Domain IP: $DOMAIN_IP"
    echo "Please update your DNS settings and try again"
    exit 1
fi

echo -e "${GREEN}✅ DNS configured correctly${NC}"

# Stop nginx temporarily
echo -e "${YELLOW}⏸️  Stopping nginx for certificate generation...${NC}"
cd /opt/atlantic-proxy/Atlanticproxy
docker-compose -f infrastructure/vps/docker-compose.vps.yml stop nginx

# Generate SSL certificate
echo -e "${YELLOW}🔒 Generating SSL certificate...${NC}"
certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate generated successfully${NC}"
else
    echo -e "${RED}❌ SSL certificate generation failed${NC}"
    exit 1
fi

# Create nginx configuration with SSL
echo -e "${YELLOW}⚙️  Creating SSL-enabled nginx configuration...${NC}"
cat > infrastructure/vps/nginx.vps.conf << EOF
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream dashboard {
        server dashboard:8080;
    }
    
    upstream auth {
        server auth-service:8081;
    }
    
    upstream billing {
        server billing-service:8082;
    }
    
    upstream support {
        server support-service:8083;
    }
    
    upstream analytics {
        server analytics-service:8085;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;

        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;

        # Main dashboard
        location / {
            proxy_pass http://dashboard;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_set_header X-Forwarded-Host \$server_name;
            
            # Rate limiting
            limit_req zone=api burst=20 nodelay;
        }

        # Authentication service
        location /auth/ {
            proxy_pass http://auth/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Stricter rate limiting for auth
            limit_req zone=login burst=5 nodelay;
        }

        # Billing service
        location /billing/ {
            proxy_pass http://billing/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            limit_req zone=api burst=10 nodelay;
        }

        # Support service
        location /support/ {
            proxy_pass http://support/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            limit_req zone=api burst=15 nodelay;
        }

        # Analytics service
        location /analytics/ {
            proxy_pass http://analytics/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            limit_req zone=api burst=10 nodelay;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Setup certificate auto-renewal
echo -e "${YELLOW}🔄 Setting up certificate auto-renewal...${NC}"
cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates twice daily
0 */12 * * * root certbot renew --quiet --post-hook "cd /opt/atlantic-proxy/Atlanticproxy && docker-compose -f infrastructure/vps/docker-compose.vps.yml restart nginx"
EOF

# Start services with SSL
echo -e "${YELLOW}🚀 Starting services with SSL...${NC}"
docker-compose -f infrastructure/vps/docker-compose.vps.yml --env-file .env.production up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Test SSL
echo -e "${YELLOW}🧪 Testing SSL configuration...${NC}"
if curl -s -I https://$DOMAIN | grep -q "200 OK"; then
    echo -e "${GREEN}✅ SSL configuration successful${NC}"
else
    echo -e "${RED}❌ SSL test failed${NC}"
fi

# Final status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f infrastructure/vps/docker-compose.vps.yml ps

echo -e "${GREEN}🎉 SSL Setup Complete!${NC}"
echo -e "${BLUE}🔗 Your Atlantic Proxy is now available at:${NC}"
echo "  - Main Site: https://$DOMAIN"
echo "  - Dashboard: https://$DOMAIN/"
echo "  - Authentication: https://$DOMAIN/auth/"
echo "  - Billing: https://$DOMAIN/billing/"
echo "  - Support: https://$DOMAIN/support/"
echo "  - Analytics: https://$DOMAIN/analytics/"
echo ""
echo -e "${GREEN}✅ SSL certificates will auto-renew every 12 hours${NC}"
echo -e "${YELLOW}⚠️  Remember to update your Stripe webhook URLs to use HTTPS${NC}"
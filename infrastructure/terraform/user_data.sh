#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
yum install -y git

# Clone Atlantic Proxy repository
cd /home/ec2-user
git clone https://github.com/your-username/Atlanticproxy.git
chown -R ec2-user:ec2-user Atlanticproxy

# Create production environment file
cat > /home/ec2-user/Atlanticproxy/.env.production << EOF
# Production Environment Variables
OXYLABS_API_KEY=c32d48492e6dbe27e92559a6d60d2bfe2eb92d279fd844edc8f5429e46ae080e
OXYLABS_NETWORK_ID=oxylabs
DB_PASSWORD=secure_production_password_123
REDIS_PASSWORD=secure_redis_password_123
JWT_SECRET=production_jwt_secret_key_very_secure
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
SERVER_ENV=production
EOF

# Set proper permissions
chown ec2-user:ec2-user /home/ec2-user/Atlanticproxy/.env.production
chmod 600 /home/ec2-user/Atlanticproxy/.env.production

# Start Atlantic Proxy services
cd /home/ec2-user/Atlanticproxy
docker-compose -f infrastructure/docker-compose.production.yml up -d
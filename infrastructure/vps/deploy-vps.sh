#!/bin/bash

# Atlantic Proxy VPS Deployment Script
# One-command deployment for VPS providers

set -e

echo "🚀 Atlantic Proxy VPS Deployment"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_PROVIDER=${VPS_PROVIDER:-"digitalocean"}
DOMAIN=${DOMAIN:-"atlanticproxy.com"}
EMAIL=${EMAIL:-"admin@atlanticproxy.com"}
SERVER_SIZE=${SERVER_SIZE:-"s-2vcpu-4gb"}
REGION=${REGION:-"nyc3"}

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Provider: $VPS_PROVIDER"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Server Size: $SERVER_SIZE"
echo "  Region: $REGION"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

case $VPS_PROVIDER in
    "digitalocean")
        if [ -z "$DO_TOKEN" ]; then
            echo -e "${RED}❌ DigitalOcean token required. Set DO_TOKEN environment variable${NC}"
            exit 1
        fi
        API_ENDPOINT="https://api.digitalocean.com/v2"
        ;;
    "linode")
        if [ -z "$LINODE_TOKEN" ]; then
            echo -e "${RED}❌ Linode token required. Set LINODE_TOKEN environment variable${NC}"
            exit 1
        fi
        API_ENDPOINT="https://api.linode.com/v4"
        ;;
    "vultr")
        if [ -z "$VULTR_API_KEY" ]; then
            echo -e "${RED}❌ Vultr API key required. Set VULTR_API_KEY environment variable${NC}"
            exit 1
        fi
        API_ENDPOINT="https://api.vultr.com/v2"
        ;;
    *)
        echo -e "${RED}❌ Unsupported provider: $VPS_PROVIDER${NC}"
        echo "Supported providers: digitalocean, linode, vultr"
        exit 1
        ;;
esac

# Create user data script
echo -e "${YELLOW}📝 Creating user data script...${NC}"
cat > user-data.sh << 'EOF'
#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git and tools
apt-get install -y git curl wget unzip htop nano

# Clone Atlantic Proxy
cd /opt
git clone https://github.com/your-username/Atlanticproxy.git
cd Atlanticproxy

# Run setup script
chmod +x infrastructure/vps/setup-vps.sh
./infrastructure/vps/setup-vps.sh

# Signal completion
touch /tmp/setup-complete
EOF

# Deploy based on provider
case $VPS_PROVIDER in
    "digitalocean")
        echo -e "${YELLOW}🌊 Deploying to DigitalOcean...${NC}"
        
        # Create SSH key if not exists
        if ! curl -s -H "Authorization: Bearer $DO_TOKEN" "$API_ENDPOINT/account/keys" | grep -q "atlantic-proxy-key"; then
            echo -e "${YELLOW}🔑 Creating SSH key...${NC}"
            ssh-keygen -t rsa -b 4096 -f ~/.ssh/atlantic-proxy-key -N "" -C "atlantic-proxy"
            
            curl -X POST "$API_ENDPOINT/account/keys" \
                -H "Authorization: Bearer $DO_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"name\": \"atlantic-proxy-key\",
                    \"public_key\": \"$(cat ~/.ssh/atlantic-proxy-key.pub)\"
                }"
        fi
        
        # Get SSH key ID
        SSH_KEY_ID=$(curl -s -H "Authorization: Bearer $DO_TOKEN" "$API_ENDPOINT/account/keys" | jq -r '.ssh_keys[] | select(.name=="atlantic-proxy-key") | .id')
        
        # Create droplet
        echo -e "${YELLOW}💧 Creating DigitalOcean droplet...${NC}"
        DROPLET_RESPONSE=$(curl -X POST "$API_ENDPOINT/droplets" \
            -H "Authorization: Bearer $DO_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"name\": \"atlantic-proxy-$(date +%s)\",
                \"region\": \"$REGION\",
                \"size\": \"$SERVER_SIZE\",
                \"image\": \"ubuntu-22-04-x64\",
                \"ssh_keys\": [$SSH_KEY_ID],
                \"user_data\": \"$(cat user-data.sh | base64 -w 0)\",
                \"tags\": [\"atlantic-proxy\"]
            }")
        
        DROPLET_ID=$(echo $DROPLET_RESPONSE | jq -r '.droplet.id')
        echo "Droplet ID: $DROPLET_ID"
        ;;
        
    "linode")
        echo -e "${YELLOW}🔵 Deploying to Linode...${NC}"
        
        # Create Linode instance
        LINODE_RESPONSE=$(curl -X POST "$API_ENDPOINT/linode/instances" \
            -H "Authorization: Bearer $LINODE_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"label\": \"atlantic-proxy-$(date +%s)\",
                \"region\": \"$REGION\",
                \"type\": \"g6-standard-2\",
                \"image\": \"linode/ubuntu22.04\",
                \"root_pass\": \"$(openssl rand -base64 32)\",
                \"metadata\": {
                    \"user_data\": \"$(cat user-data.sh | base64 -w 0)\"
                }
            }")
        
        LINODE_ID=$(echo $LINODE_RESPONSE | jq -r '.id')
        echo "Linode ID: $LINODE_ID"
        ;;
        
    "vultr")
        echo -e "${YELLOW}🌋 Deploying to Vultr...${NC}"
        
        # Create Vultr instance
        VULTR_RESPONSE=$(curl -X POST "$API_ENDPOINT/instances" \
            -H "Authorization: Bearer $VULTR_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"label\": \"atlantic-proxy-$(date +%s)\",
                \"region\": \"$REGION\",
                \"plan\": \"vc2-2c-4gb\",
                \"os_id\": 387,
                \"user_data\": \"$(cat user-data.sh | base64 -w 0)\"
            }")
        
        VULTR_ID=$(echo $VULTR_RESPONSE | jq -r '.instance.id')
        echo "Vultr ID: $VULTR_ID"
        ;;
esac

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
sleep 60

# Get server IP (provider-specific)
case $VPS_PROVIDER in
    "digitalocean")
        SERVER_IP=$(curl -s -H "Authorization: Bearer $DO_TOKEN" "$API_ENDPOINT/droplets/$DROPLET_ID" | jq -r '.droplet.networks.v4[] | select(.type=="public") | .ip_address')
        ;;
    "linode")
        SERVER_IP=$(curl -s -H "Authorization: Bearer $LINODE_TOKEN" "$API_ENDPOINT/linode/instances/$LINODE_ID" | jq -r '.ipv4[0]')
        ;;
    "vultr")
        SERVER_IP=$(curl -s -H "Authorization: Bearer $VULTR_API_KEY" "$API_ENDPOINT/instances/$VULTR_ID" | jq -r '.instance.main_ip')
        ;;
esac

echo -e "${GREEN}✅ Server created successfully!${NC}"
echo -e "${BLUE}📋 Server Details:${NC}"
echo "  IP Address: $SERVER_IP"
echo "  Provider: $VPS_PROVIDER"
echo "  Region: $REGION"

# Wait for setup to complete
echo -e "${YELLOW}⏳ Waiting for Atlantic Proxy setup to complete...${NC}"
echo "This may take 5-10 minutes..."

# Monitor setup progress
for i in {1..30}; do
    if ssh -o StrictHostKeyChecking=no -i ~/.ssh/atlantic-proxy-key root@$SERVER_IP "test -f /tmp/setup-complete" 2>/dev/null; then
        echo -e "${GREEN}✅ Setup completed successfully!${NC}"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 20
done

# Cleanup
rm -f user-data.sh

echo -e "${GREEN}🎉 Atlantic Proxy VPS Deployment Complete!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Point your domain $DOMAIN to IP: $SERVER_IP"
echo "2. SSH to server: ssh -i ~/.ssh/atlantic-proxy-key root@$SERVER_IP"
echo "3. Run SSL setup: cd /opt/Atlanticproxy && ./infrastructure/vps/ssl-setup.sh"
echo ""
echo -e "${BLUE}🔗 Access Points:${NC}"
echo "  - Dashboard: http://$SERVER_IP:8080"
echo "  - Auth: http://$SERVER_IP:8081"
echo "  - Billing: http://$SERVER_IP:8082"
echo "  - Support: http://$SERVER_IP:8083"
echo "  - Analytics: http://$SERVER_IP:8085"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Update DNS settings to point $DOMAIN to $SERVER_IP"
echo "- Run SSL setup after DNS propagation"
echo "- Update Stripe keys in production environment"
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
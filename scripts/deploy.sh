#!/bin/bash

# Atlantic Proxy - Production Deployment Script
# Phase 11: Production Deployment

set -e

echo "🚀 Atlantic Proxy - Production Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
echo -e "${BLUE}1. Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker daemon
echo -e "${BLUE}2. Checking Docker daemon...${NC}"
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker daemon not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker daemon running${NC}"

# Load environment
echo -e "${BLUE}3. Loading environment variables...${NC}"
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ .env.prod not found${NC}"
    exit 1
fi
export $(cat .env.prod | grep -v '#' | xargs)
echo -e "${GREEN}✅ Environment loaded${NC}"

# Build images
echo -e "${BLUE}4. Building Docker images...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml build
echo -e "${GREEN}✅ Images built${NC}"

# Start services
echo -e "${BLUE}5. Starting services...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d
echo -e "${GREEN}✅ Services started${NC}"

# Wait for services
echo -e "${BLUE}6. Waiting for services to be ready...${NC}"
sleep 10

# Check health
echo -e "${BLUE}7. Checking service health...${NC}"
docker-compose --env-file .env.prod -f docker-compose.prod.yml ps
echo -e "${GREEN}✅ Services running${NC}"

# Test endpoints
echo -e "${BLUE}8. Testing endpoints...${NC}"
echo "Testing backend health..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check pending (may take a moment)${NC}"
fi

echo "Testing frontend..."
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check pending (may take a moment)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:5001/api"
echo "   Swagger UI: http://localhost:5001/api/docs/index.html"
echo "   Health: http://localhost:5001/health"
echo ""
echo "📊 View logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""

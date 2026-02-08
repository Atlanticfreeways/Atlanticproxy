#!/bin/bash

# AtlanticProxy - Unified Local Startup Script
# This script starts both backend and frontend for local testing

set -e

echo "🚀 Starting AtlanticProxy Local Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clear ports first
echo "🧹 Clearing ports..."
lsof -ti:8082 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Check if .env exists
if [ ! -f "scripts/proxy-client/.env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp scripts/proxy-client/.env.example scripts/proxy-client/.env
    echo -e "${GREEN}✅ .env created. Please update with your values.${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend (without sudo - kill switch will be disabled)
echo -e "${BLUE}📦 Starting Backend (Go)...${NC}"
echo -e "${YELLOW}⚠️  Note: Kill switch disabled (requires sudo)${NC}"
cd scripts/proxy-client
go run ./cmd/service 2>&1 | grep -v "WARNING" | grep -v "kill switch" &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -s http://localhost:8082/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Checking logs..."
    sleep 2
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo -e "${GREEN}✅ Backend running on http://localhost:8082${NC}"
echo ""

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (Next.js)...${NC}"
cd atlantic-dashboard
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🌐 Access Points:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8082"
echo "  Health:    http://localhost:8082/health"
echo "  Metrics:   http://localhost:8082/metrics"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🧪 Test Endpoints:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Trial Signup:  http://localhost:3000/trial"
echo "  Dashboard:     http://localhost:3000/dashboard"
echo "  Locations:     http://localhost:3000/dashboard/locations"
echo "  Billing:       http://localhost:3000/dashboard/billing"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}💳 Test Payment:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Card:  4084084084084081"
echo "  CVV:   408"
echo "  PIN:   0000"
echo "  Date:  Any future date"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait

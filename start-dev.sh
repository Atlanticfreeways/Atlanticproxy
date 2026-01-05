#!/bin/bash

# AtlanticProxy Unified Development Starter
# This script starts both the Go API and the Next.js Dashboard concurrently

# Get project root (directory where this script is located)
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting AtlanticProxy Dev Stack...${NC}"

# Target directories
BACKEND_DIR="$PROJECT_ROOT/scripts/proxy-client"
FRONTEND_DIR="$PROJECT_ROOT/atlantic-dashboard"

# Function to handle shutdown
cleanup() {
    echo -e "\n${BLUE}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT

# 1. Start Backend
echo -e "${GREEN}📡 Starting Go API Server (Port 8082)...${NC}"
(cd "$BACKEND_DIR" && go run cmd/api-only/main.go) &
BACKEND_PID=$!

# 2. Start Frontend
echo -e "\n${GREEN}🖥️ Starting Next.js Dashboard (Port 3000)...${NC}"
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo -e "\n${BLUE}======================================"
echo -e "✅ Both services are starting!"
echo -e "Dashboard: http://localhost:3000"
echo -e "API Server: http://localhost:8082"
echo -e "======================================${NC}"

# Keep script running
wait

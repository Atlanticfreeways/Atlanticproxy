#!/bin/bash

# Atlantic Proxy - Complete Setup and Run Script
# This script sets up and starts the entire application

set -e

echo "🚀 Atlantic Proxy - Setup and Run"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Start Docker Containers
echo -e "${BLUE}Step 1: Starting Docker containers...${NC}"
docker-compose -f docker-compose.dev.yml up -d
echo -e "${GREEN}✓ Docker containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 5

# Step 2: Setup Database
echo -e "${BLUE}Step 2: Setting up database...${NC}"

# Create database
echo "Creating database..."
docker exec atlanticproxy-postgres-1 psql -U postgres -c "CREATE DATABASE atlantic_proxy;" 2>/dev/null || echo "Database already exists"

# Run migrations
echo "Running migrations..."
docker exec atlanticproxy-postgres-1 psql -U postgres -d atlantic_proxy < database/init.sql 2>/dev/null || echo "Schema already exists"
docker exec atlanticproxy-postgres-1 psql -U postgres -d atlantic_proxy < backend/internal/database/schema.sql 2>/dev/null || echo "Schema already exists"
docker exec atlanticproxy-postgres-1 psql -U postgres -d atlantic_proxy < backend/internal/database/migrations/004_phase4_tables.sql 2>/dev/null || echo "Phase 4 tables already exist"

# Verify tables
echo "Verifying database tables..."
docker exec atlanticproxy-postgres-1 psql -U postgres -d atlantic_proxy -c "\dt" | head -20

echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# Step 3: Setup Backend
echo -e "${BLUE}Step 3: Setting up backend...${NC}"
cd backend

# Download Go modules
echo "Downloading Go modules..."
go mod download
go mod tidy

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Step 4: Setup Frontend
echo -e "${BLUE}Step 4: Setting up frontend...${NC}"
cd ../frontend

# Install dependencies
echo "Installing npm dependencies..."
npm install --legacy-peer-deps

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Step 5: Display next steps
echo -e "${YELLOW}=================================="
echo "Setup Complete! 🎉"
echo "==================================${NC}"
echo ""
echo "To start the application, open 3 terminals and run:"
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  go run cmd/server/main.go"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Terminal 3 - Monitor (optional):${NC}"
echo "  docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  MailHog: http://localhost:8025"
echo ""
echo -e "${YELLOW}Test the backend:${NC}"
echo "  curl http://localhost:5000/health"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

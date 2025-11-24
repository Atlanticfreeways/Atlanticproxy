# Atlantic Proxy - Enhanced Kill Switch Makefile

.PHONY: build test-killswitch clean

# Build enhanced kill switch
build:
	@echo "🔨 Building Enhanced Kill Switch..."
	go build -o bin/enhanced-killswitch enhanced-killswitch.go
	@echo "✅ Build completed"

# Test kill switch functionality
test-killswitch:
	@echo "🧪 Testing Enhanced Kill Switch..."
	@echo "⚠️  Note: Kill switch tests require root privileges"
	cd killswitch-test && go run test-killswitch.go
	@echo "✅ Kill switch tests completed"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	@echo "✅ Clean completed"

# Install dependencies
deps:
	@echo "📦 Installing dependencies..."
	go mod tidy
	@echo "✅ Dependencies installed"

# Run kill switch
run:
	@echo "🚀 Running Enhanced Kill Switch..."
	@echo "Usage: make run CMD=[activate|deactivate|status|monitor]"
	@if [ -z "$(CMD)" ]; then \
		echo "Please specify CMD. Example: make run CMD=status"; \
		exit 1; \
	fi
	go run enhanced-killswitch.go $(CMD)

# Test connection pools
test-pools:
	@echo "🧪 Testing Connection Pools..."
	cd pool-test && go run test-pool-simple.go
	@echo "✅ Connection pool tests completed"

# Build connection pools
build-pools:
	@echo "🔨 Building Connection Pools..."
	go build -o bin/connection-pool connection-pool.go
	@echo "✅ Connection pool build completed"

# Build session persistence
build-sessions:
	@echo "🔨 Building Session Persistence..."
	go build -o bin/session-persistence session-persistence.go
	@echo "✅ Session persistence build completed"

# Build health monitoring
build-health:
	@echo "🔨 Building Health Monitor..."
	go build -o bin/health-monitor health-monitor.go
	@echo "✅ Health monitor build completed"

# Build dashboard
build-dashboard:
	@echo "🔨 Building Dashboard..."
	go build -o bin/dashboard dashboard.go
	@echo "✅ Dashboard build completed"

# Build API integration
build-api:
	@echo "🔨 Building API Integration..."
	go build -o bin/api-integration api-integration.go
	@echo "✅ API integration build completed"

# Build authentication system
build-auth:
	@echo "🔨 Building Authentication System..."
	go build -o bin/auth-system auth-system.go
	@echo "✅ Authentication system build completed"

# Build billing system
build-billing:
	@echo "🔨 Building Billing System..."
	go build -o bin/billing-system billing-system.go
	@echo "✅ Billing system build completed"

# Test authentication
test-auth:
	@echo "🧪 Testing Authentication System..."
	cd auth-test && go run test-auth-simple.go
	@echo "✅ Authentication tests completed"

# Build support system
build-support:
	@echo "🔨 Building Support System..."
	go build -o bin/support-system support-system.go
	@echo "✅ Support system build completed"

# Build unified dashboard
build-unified:
	@echo "🔨 Building Unified Dashboard..."
	go build -o bin/unified-dashboard unified-dashboard.go
	@echo "✅ Unified dashboard build completed"

# Test support system
test-support:
	@echo "🧪 Testing Support System..."
	cd support-test && go run test-support.go
	@echo "✅ Support system tests completed"

# Build analytics system
build-analytics:
	@echo "🔨 Building Analytics System..."
	go build -o bin/analytics-system analytics-system.go
	@echo "✅ Analytics system build completed"

# Test analytics system
test-analytics:
	@echo "🧪 Testing Analytics System..."
	cd analytics-test && go run test-analytics.go
	@echo "✅ Analytics system tests completed"

# Test API integration
test-api:
	@echo "🧪 Testing API Integration..."
	cd api-test && go run test-api.go
	@echo "✅ API integration tests completed"

# Test dashboard
test-dashboard:
	@echo "🧪 Testing Dashboard..."
	cd dashboard-test && go run test-dashboard.go
	@echo "✅ Dashboard tests completed"

# Test health monitoring
test-health:
	@echo "🧪 Testing Health Monitoring..."
	cd health-test && go run test-health.go
	@echo "✅ Health monitoring tests completed"

# Test session persistence
test-sessions:
	@echo "🧪 Testing Session Persistence..."
	cd session-test && go run test-sessions-simple.go
	@echo "✅ Session persistence tests completed"

# Build all components
build-all: build build-pools build-sessions build-health build-dashboard build-api build-auth build-billing build-support build-unified build-analytics
	@echo "🎉 All components built successfully!"

# Run dashboard
run-dashboard:
	@echo "🌍 Starting Atlantic Proxy Dashboard..."
	go run dashboard.go

# Week 2 test suite (no root required)
test-week2: test-pools test-sessions test-health test-dashboard test-api test-auth test-support test-analytics
	@echo "🎉 Week 2 tests completed successfully!"

# Run unified dashboard
run-unified:
	@echo "🌍 Starting Unified Atlantic Proxy Dashboard..."
	go run unified-dashboard.go

# Full test suite
test: test-killswitch test-pools test-sessions test-health test-dashboard test-api test-auth test-support test-analytics
	@echo "🎉 All tests completed successfully!"
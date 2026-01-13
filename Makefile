.PHONY: build-all build-service build-tray build-web run-web dev run-api run-frontend clean test package monitor-up monitor-down

# Docker detection (with macOS support)
DOCKER := $(shell command -v docker 2>/dev/null || echo "/Applications/Docker.app/Contents/Resources/bin/docker")
DOCKER_COMPOSE := $(shell command -v docker-compose 2>/dev/null || echo "$(DOCKER) compose")

# -----------------------------------------------------------------------------
# 🏗️ Build Targets
# -----------------------------------------------------------------------------

# Build all components
build-all: build-service build-tray build-web
	@echo "🎉 All components built successfully!"

# Build the core background service
build-service:
	@echo "🔨 Building AtlanticProxy Service..."
	cd scripts/proxy-client && go build -o ../../bin/atlantic-service ./cmd/service
	@echo "✅ Service build completed"

# Build the system tray application
build-tray:
	@echo "🔨 Building AtlanticProxy Tray..."
	go build -o bin/atlantic-tray ./cmd/tray
	@echo "✅ Tray build completed"

# Build the Next.js web dashboard
build-web:
	@echo "🔨 Building Web Dashboard..."
	cd atlantic-dashboard && npm run build
	@echo "✅ Web dashboard build completed"

# -----------------------------------------------------------------------------
# 🚀 Run Targets
# -----------------------------------------------------------------------------

# Run the web dashboard in development mode
run-web:
	@echo "🌐 Starting Web Dashboard..."
	cd atlantic-dashboard && npm run dev

# Start everything unified
dev:
	@chmod +x start-dev.sh
	./start-dev.sh

# Run only the API (standalone for testing)
run-api:
	@echo "📡 Starting API Server..."
	cd scripts/proxy-client && go run cmd/api-only/main.go

# Run only the frontend
run-frontend: run-web

# -----------------------------------------------------------------------------
# 📦 Distribution Targets
# -----------------------------------------------------------------------------

# Production build and packaging
package:
ifeq ($(shell uname), Darwin)
	@echo "🎁 Packaging for macOS..."
	chmod +x scripts/package_macos.sh
	./scripts/package_macos.sh
else
	@echo "🎁 Packaging for production..."
	chmod +x scripts/build_installers.sh
	./scripts/build_installers.sh
endif

# 📊 Monitoring Targets
monitor-up:
	@echo "📈 Starting Prometheus & Grafana..."
	$(DOCKER_COMPOSE) -f docker/docker-compose.monitoring.yml up -d
	@echo "✅ Monitoring started! Grafana: http://localhost:3001 (admin/admin)"

monitor-down:
	@echo "📉 Stopping monitoring..."
	$(DOCKER_COMPOSE) -f docker/docker-compose.monitoring.yml down

# -----------------------------------------------------------------------------
# 🧹 Cleanup & Test
# -----------------------------------------------------------------------------

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	rm -rf dist/
	@echo "✅ Clean completed"

test:
	@echo "🧪 Running tests..."
	go test ./...
	@echo "✅ All tests passed"

# -----------------------------------------------------------------------------
# 🛠️ Helper Targets
# -----------------------------------------------------------------------------

deps:
	@echo "📦 Installing Go dependencies..."
	go mod tidy
	@echo "📦 Installing Web dependencies..."
	cd atlantic-dashboard && npm install
	@echo "✅ All dependencies installed"
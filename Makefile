# 🌊 AtlanticProxy Master Makefile

.PHONY: build-all build-service build-tray build-web run-web clean test package

# -----------------------------------------------------------------------------
# 🏗️ Build Targets
# -----------------------------------------------------------------------------

# Build all components
build-all: build-service build-tray build-web
	@echo "🎉 All components built successfully!"

# Build the core background service
build-service:
	@echo "🔨 Building AtlanticProxy Service..."
	go build -o bin/atlantic-service ./cmd/service
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

# -----------------------------------------------------------------------------
# 📦 Distribution Targets
# -----------------------------------------------------------------------------

# Production build and packaging
package:
	@echo "🎁 Packaging for production..."
	chmod +x scripts/build_installers.sh
	./scripts/build_installers.sh

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
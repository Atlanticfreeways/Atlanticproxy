# Atlantic Proxy - Build System
.PHONY: build test clean install deps

# Build the Atlantic test applications
build:
	@echo "Building Atlantic Proxy applications..."
	cd cmd/atlantic-test && go build -o ../../bin/atlantic-test .
	cd cmd/killswitch-test && go build -o ../../bin/killswitch-test .

# Install dependencies
deps:
	@echo "Installing dependencies..."
	go mod tidy
	go mod download

# Test the traffic interceptor (requires root)
test: build
	@echo "Testing Atlantic Traffic Interceptor..."
	@echo "WARNING: This requires root privileges and will modify system networking"
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	sudo ./bin/atlantic-test

# Test the kill switch (requires root)
test-killswitch: build
	@echo "Testing Atlantic Kill Switch..."
	@echo "WARNING: This requires root privileges and will block all traffic"
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	sudo ./bin/killswitch-test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	go clean

# Install system service (macOS/Linux)
install: build
	@echo "Installing Atlantic Proxy service..."
	sudo mkdir -p /usr/local/bin
	sudo cp bin/atlantic-test /usr/local/bin/atlantic-proxy
	@echo "Atlantic Proxy installed to /usr/local/bin/atlantic-proxy"

# Quick validation without full system modification
validate:
	@echo "Validating Atlantic Proxy components..."
	go build -o /tmp/atlantic-validate cmd/atlantic-test/main.go
	go build -o /tmp/killswitch-validate cmd/killswitch-test/main.go
	@echo "✅ Build successful"
	@echo "✅ Dependencies resolved"
	@echo "✅ Code compiles without errors"
	rm -f /tmp/atlantic-validate /tmp/killswitch-validate

# Development setup
dev-setup: deps
	@echo "Setting up development environment..."
	mkdir -p bin/
	mkdir -p logs/
	@echo "✅ Development environment ready"

# Show help
help:
	@echo "Atlantic Proxy - Build Commands"
	@echo "================================"
	@echo "make build     - Build the application"
	@echo "make deps      - Install dependencies"
	@echo "make test      - Test traffic interceptor (requires root)"
	@echo "make test-killswitch - Test kill switch (requires root)"
	@echo "make validate  - Quick validation without system changes"
	@echo "make clean     - Clean build artifacts"
	@echo "make install   - Install as system service"
	@echo "make dev-setup - Setup development environment"
	@echo "make help      - Show this help"
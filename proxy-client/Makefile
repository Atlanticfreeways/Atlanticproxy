.PHONY: build clean install test run

BINARY_NAME=atlantic-proxy-client
BUILD_DIR=build
VERSION=$(shell git describe --tags --always --dirty)
LDFLAGS=-ldflags "-X main.version=$(VERSION)"

build:
	@echo "Building AtlanticProxy Client..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 ./cmd/service
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 ./cmd/service
	CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 ./cmd/service

build-local:
	@echo "Building for local platform..."
	@mkdir -p $(BUILD_DIR)
	go build $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/service

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)

install: build-local
	@echo "Installing AtlanticProxy Client..."
	sudo cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/
	sudo chmod +x /usr/local/bin/$(BINARY_NAME)

test:
	@echo "Running tests..."
	go test -v ./...

run: build-local
	@echo "Running AtlanticProxy Client..."
	sudo $(BUILD_DIR)/$(BINARY_NAME)

deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

dev-setup:
	@echo "Setting up development environment..."
	go mod download
	@echo "Development setup complete!"

install-service: build-local
	@echo "Installing system service..."
	@if [ "$(shell uname)" = "Darwin" ]; then \
		./scripts/install-macos.sh; \
	else \
		sudo cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/; \
		sudo cp scripts/atlantic-proxy.service /etc/systemd/system/; \
		sudo systemctl daemon-reload; \
		sudo systemctl enable atlantic-proxy; \
		echo "Service installed. Start with: sudo systemctl start atlantic-proxy"; \
	fi

start-service:
	@echo "Starting AtlanticProxy service..."
	@if [ "$(shell uname)" = "Darwin" ]; then \
		sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.client.plist; \
	else \
		sudo systemctl start atlantic-proxy; \
	fi

stop-service:
	@echo "Stopping AtlanticProxy service..."
	@if [ "$(shell uname)" = "Darwin" ]; then \
		sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist; \
	else \
		sudo systemctl stop atlantic-proxy; \
	fi

uninstall-service:
	@echo "Uninstalling system service..."
	@if [ "$(shell uname)" = "Darwin" ]; then \
		sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist || true; \
		sudo rm -f /Library/LaunchDaemons/com.atlanticproxy.client.plist; \
		sudo rm -f /usr/local/bin/$(BINARY_NAME); \
	else \
		sudo systemctl stop atlantic-proxy || true; \
		sudo systemctl disable atlantic-proxy || true; \
		sudo rm -f /etc/systemd/system/atlantic-proxy.service; \
		sudo rm -f /usr/local/bin/$(BINARY_NAME); \
		sudo systemctl daemon-reload; \
	fi
	@echo "Service uninstalled."

logs:
	@echo "Showing service logs..."
	@if [ "$(shell uname)" = "Darwin" ]; then \
		tail -f /var/log/atlantic-proxy.log; \
	else \
		sudo journalctl -u atlantic-proxy -f; \
	fi
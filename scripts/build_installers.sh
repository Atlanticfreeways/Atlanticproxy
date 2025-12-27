#!/bin/bash
# AtlanticProxy Production Packaging Script
set -e

VERSION="1.0.0-beta"
BIN_DIR="bin"
DIST_DIR="dist"

echo "🌊 AtlanticProxy: Starting Production Packaging (v$VERSION)..."

# Create directories
mkdir -p $BIN_DIR
mkdir -p $DIST_DIR

# 1. Build optimized binaries
echo "🔨 Building Optimized Binaries..."
LDFLAGS="-s -w"

# Build Service
GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-service-macos-amd64 ./cmd/service
GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-service-macos-arm64 ./cmd/service
# GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-service-win-amd64.exe ./cmd/service

# Build Tray
GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-tray-macos-amd64 ./cmd/tray
GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-tray-macos-arm64 ./cmd/tray
# GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-tray-win-amd64.exe ./cmd/tray

# 2. Package for macOS (Placeholder for .pkg/dmg logic)
echo "📦 Packaging for macOS..."
# In a real environment, we would use 'pkgbuild' or 'hdiutil' here.
tar -czf $DIST_DIR/AtlanticProxy-macOS-v$VERSION.tar.gz -C $BIN_DIR .

echo "✅ Packaging complete. Artifacts in $DIST_DIR/"

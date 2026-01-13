#!/bin/bash
# AtlanticProxy Production Packaging Script
set -e

VERSION="1.0.0-beta"
BIN_DIR="bin"
DIST_DIR="dist"

echo "🌊 AtlanticProxy: Starting Production Packaging (v$VERSION)..."
echo "Current directory: $(pwd)"

# Create directories
mkdir -p $BIN_DIR
mkdir -p $DIST_DIR

# 1. Build optimized binaries
echo "🔨 Building Optimized Binaries..."
LDFLAGS="-s -w"

# Build Service
echo "   - Building Service Layer..."
cd scripts/proxy-client
if [ ! -d "cmd/service" ]; then
    echo "❌ ERROR: cmd/service not found in scripts/proxy-client"
    exit 1
fi
GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o ../../$BIN_DIR/atlantic-service-macos-amd64 ./cmd/service
GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o ../../$BIN_DIR/atlantic-service-macos-arm64 ./cmd/service
cd ../..

# Build Tray
echo "   - Building Tray Interface..."
if [ ! -d "cmd/tray" ]; then
    echo "❌ ERROR: cmd/tray not found in root"
    exit 1
fi
GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-tray-macos-amd64 ./cmd/tray
GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o $BIN_DIR/atlantic-tray-macos-arm64 ./cmd/tray

# 2. Package for macOS
echo "📦 Packaging for macOS..."
# In a real environment, we would use 'pkgbuild' or 'hdiutil' here.
tar -czf $DIST_DIR/AtlanticProxy-macOS-v$VERSION.tar.gz -C $BIN_DIR .

echo "✅ Packaging complete. Artifacts in $DIST_DIR/"

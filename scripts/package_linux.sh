#!/bin/bash
set -e

APP_NAME="AtlanticProxy"
VERSION="1.0.0"
BUILD_DIR="build/linux"
OUTPUT_DIR="${BUILD_DIR}/${APP_NAME}"

echo "🚀 Starting Linux Packaging for ${APP_NAME}..."

echo "📂 Creating Directory Structure..."
rm -rf "${BUILD_DIR}"
mkdir -p "${OUTPUT_DIR}/usr/local/bin"
mkdir -p "${OUTPUT_DIR}/etc/systemd/system"

echo "🔨 Building Binaries (Cross-Compiling)..."
# Navigate to Go project root
cd scripts/proxy-client

# Build Main App (Tray)
# Note: Cross-compiling GUI apps with CGo (GTK) from macOS is difficult.
# We skip the Tray app for Linux packaging here. It should be built natively on Linux.
echo "   - [SKIPPED] Building Main App (Tray) - Requires native Linux build (CGo)..."
# GOOS=linux GOARCH=amd64 go build -o "../../${OUTPUT_DIR}/usr/local/bin/${APP_NAME}" ./cmd/tray

# Build Service
echo "   - Building Service..."
GOOS=linux GOARCH=amd64 go build -o "../../${OUTPUT_DIR}/usr/local/bin/AtlanticService" ./cmd/service

# Return to root
cd ../..

echo "📄 Creating Systemd Unit File..."
cat <<EOF > "${OUTPUT_DIR}/etc/systemd/system/atlantic-proxy.service"
[Unit]
Description=Atlantic Proxy Service
After=network.target

[Service]
ExecStart=/usr/local/bin/AtlanticService
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

echo "📦 Creating Tarball..."
cd "${BUILD_DIR}"
tar -czf "${APP_NAME}-${VERSION}-linux-amd64.tar.gz" "${APP_NAME}"
cd ../..

echo "✅ Packaging Complete!"
echo "   Artifact: build/linux/${APP_NAME}-${VERSION}-linux-amd64.tar.gz"

#!/bin/bash
set -e

APP_NAME="AtlanticProxy"
VERSION="1.0.0"
BUILD_DIR="build/windows"
OUTPUT_DIR="${BUILD_DIR}/${APP_NAME}"

echo "🚀 Starting Windows Packaging for ${APP_NAME}..."

echo "📂 Creating Directory Structure..."
rm -rf "${BUILD_DIR}"
mkdir -p "${OUTPUT_DIR}"

echo "🔨 Building Binaries (Cross-Compiling)..."
# Navigate to Go project root
cd scripts/proxy-client

# Build Main App (Tray)
echo "   - Building Main App (Tray).exe..."
GOOS=windows GOARCH=amd64 go build -o "../../${OUTPUT_DIR}/${APP_NAME}.exe" ./cmd/tray

# Build Service
echo "   - Building Service.exe..."
GOOS=windows GOARCH=amd64 go build -o "../../${OUTPUT_DIR}/AtlanticService.exe" ./cmd/service

# Return to root
cd ../..

echo "📄 Copying Resources..."
# Placeholder for icon copy
# cp assets/windows/icon.ico "${OUTPUT_DIR}/"

echo "📦 Creating ZIP Archive..."
cd "${BUILD_DIR}"
zip -r "${APP_NAME}-${VERSION}-win64.zip" "${APP_NAME}"
cd ../..

echo "✅ Packaging Complete!"
echo "   Artifact: build/windows/${APP_NAME}-${VERSION}-win64.zip"

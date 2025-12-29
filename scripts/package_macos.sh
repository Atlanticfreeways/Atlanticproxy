#!/bin/bash
set -e

APP_NAME="AtlanticProxy"
VERSION="1.0.0"
BUILD_DIR="build/macos"
APP_BUNDLE="${BUILD_DIR}/${APP_NAME}.app"
CONTENTS_DIR="${APP_BUNDLE}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

echo "🚀 Starting macOS Packaging for ${APP_NAME}..."

echo "📂 Creating App Bundle Structure..."
rm -rf "${BUILD_DIR}"
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

echo "🔨 Building Binaries..."
# Navigate to Go project root
cd scripts/proxy-client

# Build Main App (Tray)
echo "   - Building Main App (Tray)..."
GOOS=darwin GOARCH=amd64 go build -o "../../${MACOS_DIR}/${APP_NAME}" ./cmd/tray

# Build Service (Helper)
echo "   - Building Service Helper..."
GOOS=darwin GOARCH=amd64 go build -o "../../${MACOS_DIR}/AtlanticService" ./cmd/service

# Return to root
cd ../..

echo "📄 Copying Resources..."
cp packaging/macos/Info.plist "${CONTENTS_DIR}/"
# Placeholder for Icon copy
# cp packaging/macos/AppIcon.icns "${RESOURCES_DIR}/"

echo "🔐 Signing (Ad-Hoc)..."
codesign --force --deep --sign - "${APP_BUNDLE}"

echo "📦 Creating DMG Installer..."
DMG_PATH="${BUILD_DIR}/${APP_NAME}-${VERSION}.dmg"
rm -f "${DMG_PATH}"
hdiutil create -volname "${APP_NAME}" -srcfolder "${APP_BUNDLE}" -ov -format UDZO "${DMG_PATH}"

echo "✅ Packaging Complete!"
echo "   App Bundle: ${APP_BUNDLE}"
echo "   Installer:  ${DMG_PATH}"

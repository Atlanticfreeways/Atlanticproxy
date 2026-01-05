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
# Detect Architecture
ARCH=$(uname -m)
if [ "$ARCH" == "x86_64" ]; then
    GOARCH="amd64"
else
    GOARCH="arm64"
fi
echo "   - Targeting architecture: ${GOARCH}"

# Build Main App (Tray) - located in root
echo "   - Building Main App (Tray)..."
GOOS=darwin GOARCH=${GOARCH} go build -o "${MACOS_DIR}/${APP_NAME}" ./cmd/tray

# Build Service (Helper) - located in scripts/proxy-client
echo "   - Building Service Helper..."
cd scripts/proxy-client
GOOS=darwin GOARCH=${GOARCH} go build -o "../../${MACOS_DIR}/AtlanticService" ./cmd/service
cd ../..

echo "📄 Copying Resources..."
if [ -f "packaging/macos/Info.plist" ]; then
    cp packaging/macos/Info.plist "${CONTENTS_DIR}/"
else
    echo "⚠️ Warning: Info.plist not found, skipping copy"
fi
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

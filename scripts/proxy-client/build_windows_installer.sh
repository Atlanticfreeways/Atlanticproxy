#!/bin/bash
set -e

# Configuration
APP_NAME="AtlanticProxy"
BINARY_NAME="atlantic-service.exe"
ZIP_NAME="AtlanticProxy-Windows.zip"
SRC_DIR="./cmd/service"
BUILD_DIR="./build/windows"

echo "🚀 Starting Windows Installer Build..."

# 1. Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 2. Build the binary (Cross-compile for Windows amd64)
echo "📦 Compiling binary..."
GOOS=windows GOARCH=amd64 go build -o "$BUILD_DIR/$BINARY_NAME" "$SRC_DIR"

# 3. Create helper scripts
echo "📝 Creating batch scripts..."

# Start script
cat <<EOF > "$BUILD_DIR/start_service.bat"
@echo off
echo Starting Atlantic Proxy Service...
$BINARY_NAME
pause
EOF

# Install script (Admin check + Registry/Service creation would go here, keeping it simple for now)
cat <<EOF > "$BUILD_DIR/README.txt"
======================================
   AtlanticProxy for Windows
======================================

Installation:
1. Extract this folder to a permanent location (e.g., C:\AtlanticProxy)
2. Right-click 'atlantic-service.exe' and select 'Run as Administrator'
   OR run 'start_service.bat'

Configuration:
- The service will create a database in the same directory.
- Ensure ports 8082, 8080, and 1080 are free.

Support:
- Contact support@atlanticproxy.com
EOF

# 4. Create ZIP
echo "🗜️ Creating ZIP archive..."
rm -f "$ZIP_NAME"
# Use zip if available, else warn
if command -v zip >/dev/null 2>&1; then
    cd "$BUILD_DIR" && zip -r "../../$ZIP_NAME" ./*
    echo "✨ Build Complete: $ZIP_NAME"
else
    echo "⚠️ 'zip' command not found. Files are in $BUILD_DIR"
fi

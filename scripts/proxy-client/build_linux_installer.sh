#!/bin/bash
set -e

# Configuration
APP_NAME="atlanticproxy"
VERSION="1.0.0"
ARCH="amd64"
BINARY_NAME="atlantic-service"
DEB_NAME="${APP_NAME}_${VERSION}_${ARCH}.deb"
SRC_DIR="./cmd/service"
BUILD_DIR="./build/linux"
DEB_DIR="$BUILD_DIR/deb"

echo "🚀 Starting Linux (.deb) Installer Build..."

# 1. Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$DEB_DIR/usr/local/bin"
mkdir -p "$DEB_DIR/etc/atlanticproxy"
mkdir -p "$DEB_DIR/etc/systemd/system"
mkdir -p "$DEB_DIR/DEBIAN"

# 2. Build the binary (for Linux amd64)
echo "📦 Compiling binary..."
GOOS=linux GOARCH=amd64 go build -o "$DEB_DIR/usr/local/bin/$BINARY_NAME" "$SRC_DIR"
chmod 755 "$DEB_DIR/usr/local/bin/$BINARY_NAME"

# 3. Create Control File
echo "📝 Creating control file..."
cat <<EOF > "$DEB_DIR/DEBIAN/control"
Package: $APP_NAME
Version: $VERSION
Section: net
Priority: optional
Architecture: $ARCH
Maintainer: AtlanticProxy <support@atlanticproxy.com>
Description: High-performance residential proxy service (Client)
 AtlanticProxy allows you to route traffic through residential IPs
 with rotation, ad-blocking, and billing integration.
EOF

# 4. Create Post-Install Script (Systemd setup)
echo "📝 Creating postinst script..."
cat <<EOF > "$DEB_DIR/DEBIAN/postinst"
#!/bin/bash
set -e

# Create user if not exists
if ! id "atlantic" &>/dev/null; then
    useradd --system --no-create-home --group atlantic
fi

# Set permissions
chown -R atlantic:atlantic /etc/atlanticproxy
chmod 600 /etc/atlanticproxy/config.env 2>/dev/null || true

# Enable and start service
systemctl daemon-reload
systemctl enable atlantic-proxy
systemctl restart atlantic-proxy || true

echo "✅ AtlanticProxy installed!"
EOF
chmod 755 "$DEB_DIR/DEBIAN/postinst"

# 5. Create Pre-Remove Script
echo "📝 Creating prerm script..."
cat <<EOF > "$DEB_DIR/DEBIAN/prerm"
#!/bin/bash
systemctl stop atlantic-proxy || true
systemctl disable atlantic-proxy || true
EOF
chmod 755 "$DEB_DIR/DEBIAN/prerm"

# 6. Create Default Config
echo "SERVER_PORT=8082" > "$DEB_DIR/etc/atlanticproxy/config.env"

# 7. Create Systemd Service File
echo "⚙️ Creating systemd service..."
cat <<EOF > "$DEB_DIR/etc/systemd/system/atlantic-proxy.service"
[Unit]
Description=AtlanticProxy Service
After=network.target

[Service]
Type=simple
User=atlantic
Group=atlantic
ExecStart=/usr/local/bin/$BINARY_NAME
WorkingDirectory=/etc/atlanticproxy
Restart=always
RestartSec=5
EnvironmentFile=-/etc/atlanticproxy/config.env
# Capability required for binding low ports if needed (though we use 8082/8080)
# AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

# 8. Build DEB package
echo "📦 Building package..."
if command -v dpkg-deb >/dev/null 2>&1; then
    dpkg-deb --build "$DEB_DIR" "$BUILD_DIR/$DEB_NAME"
    echo "✨ Build Complete: $BUILD_DIR/$DEB_NAME"
else
    echo "⚠️ 'dpkg-deb' command not found. Directory structure is in $DEB_DIR"
fi

#!/bin/bash
set -e

# Configuration
APP_NAME="AtlanticProxy"
BINARY_NAME="atlantic-service"
DMG_NAME="AtlanticProxy-Installer.dmg"
VOL_NAME="AtlanticProxy"
SRC_DIR="./cmd/service"
BUILD_DIR="./build/macos"

echo "🚀 Starting macOS Installer Build..."

# 1. Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 2. Build the binary (for macOS amd64 and arm64 if possible, here using host arch)
echo "📦 Compiling binary..."
go build -o "$BUILD_DIR/$BINARY_NAME" "$SRC_DIR"

# 3. Create installer script (post-install setup)
echo "📝 Creating installer script..."
cat <<EOF > "$BUILD_DIR/install.command"
#!/bin/bash
DIR="\$( cd "\$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
SUDO_USER=\$(whoami)

echo "======================================"
echo "   AtlanticProxy Installer"
echo "======================================"

# Request admin privileges
echo "🔑 Admin privileges required to install service..."
sudo -v

# Install location
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/atlanticproxy"
LOG_DIR="/var/log/atlanticproxy"

echo "📂 Creating directories..."
sudo mkdir -p "\$INSTALL_DIR"
sudo mkdir -p "\$CONFIG_DIR"
sudo mkdir -p "\$LOG_DIR"

echo "🚚 Copying binary..."
sudo cp "\$DIR/$BINARY_NAME" "\$INSTALL_DIR/$BINARY_NAME"
sudo chmod +x "\$INSTALL_DIR/$BINARY_NAME"

echo "⚙️ Creating configuration..."
if [ ! -f "\$CONFIG_DIR/config.env" ]; then
    sudo touch "\$CONFIG_DIR/config.env"
    echo "SERVER_PORT=8082" | sudo tee -a "\$CONFIG_DIR/config.env" > /dev/null
fi

echo "🚀 Creating LaunchDaemon..."
sudo tee /Library/LaunchDaemons/com.atlanticproxy.service.plist > /dev/null <<XML
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.atlanticproxy.service</string>
    <key>ProgramArguments</key>
    <array>
        <string>\$INSTALL_DIR/$BINARY_NAME</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>LOG_LEVEL</key>
        <string>info</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>\$LOG_DIR/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>\$LOG_DIR/stderr.log</string>
    <key>WorkingDirectory</key>
    <string>\$CONFIG_DIR</string>
</dict>
</plist>
XML

echo "🔄 Loading service..."
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.service.plist 2>/dev/null
sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.service.plist

echo "✅ Installation Complete!"
echo "Service is running on port 8082"
read -p "Press any key to exit..."
EOF

chmod +x "$BUILD_DIR/install.command"

# 4. Create DMG
echo "💿 Creating DMG..."
rm -f "$DMG_NAME"
hdiutil create -volname "$VOL_NAME" -srcfolder "$BUILD_DIR" -ov -format UDZO "$DMG_NAME"

echo "✨ Build Complete: $DMG_NAME"

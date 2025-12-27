#!/bin/bash

set -e

BINARY_NAME="atlantic-proxy-client"
PLIST_NAME="com.atlanticproxy.client"
INSTALL_DIR="/usr/local/bin"
PLIST_DIR="/Library/LaunchDaemons"

echo "Installing AtlanticProxy Client for macOS..."

# Build binary
make build-local

# Copy binary
sudo cp build/$BINARY_NAME $INSTALL_DIR/
sudo chmod +x $INSTALL_DIR/$BINARY_NAME

# Create LaunchDaemon plist
sudo tee $PLIST_DIR/$PLIST_NAME.plist > /dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>$INSTALL_DIR/$BINARY_NAME</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/atlantic-proxy.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/atlantic-proxy.error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>OXYLABS_USERNAME</key>
        <string>\${OXYLABS_USERNAME}</string>
        <key>OXYLABS_PASSWORD</key>
        <string>\${OXYLABS_PASSWORD}</string>
    </dict>
</dict>
</plist>
EOF

# Set permissions
sudo chmod 644 $PLIST_DIR/$PLIST_NAME.plist
sudo chown root:wheel $PLIST_DIR/$PLIST_NAME.plist

echo "Installation complete!"
echo "To start: sudo launchctl load $PLIST_DIR/$PLIST_NAME.plist"
echo "To stop:  sudo launchctl unload $PLIST_DIR/$PLIST_NAME.plist"
echo "To view logs: tail -f /var/log/atlantic-proxy.log"
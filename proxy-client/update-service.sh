#!/bin/bash

set -e

echo "🛑 Stopping service..."
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist 2>/dev/null || true
sleep 2

echo "📦 Updating binary..."
sudo cp build/atlantic-proxy-client /usr/local/bin/
sudo chmod +x /usr/local/bin/atlantic-proxy-client

echo "🚀 Starting service..."
sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.client.plist

echo "✅ Service updated and restarted!"
echo ""
echo "📊 Monitor logs with:"
echo "   tail -f /var/log/atlantic-proxy.log"
echo "   tail -f /var/log/atlantic-proxy.error.log"
#!/bin/bash

set -e

echo "🔨 Force rebuilding..."
rm -f build/atlantic-proxy-client
make build-local

echo ""
echo "🛑 Stopping service..."
sudo launchctl unload /Library/LaunchDaemons/com.atlanticproxy.client.plist 2>/dev/null || true
sleep 3

echo "📦 Updating binary..."
sudo cp -f build/atlantic-proxy-client /usr/local/bin/
sudo chmod +x /usr/local/bin/atlantic-proxy-client

echo "🧹 Clearing old logs..."
sudo rm -f /var/log/atlantic-proxy.error.log
sudo touch /var/log/atlantic-proxy.error.log

echo "🚀 Starting service..."
sudo launchctl load /Library/LaunchDaemons/com.atlanticproxy.client.plist

echo ""
echo "✅ Service force-updated!"
echo ""
echo "📊 Monitor with: tail -f /var/log/atlantic-proxy.error.log"
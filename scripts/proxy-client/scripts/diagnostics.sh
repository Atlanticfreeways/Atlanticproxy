#!/bin/bash
# Startup Diagnostics Script
# Checks ports, DNS, and environment requirements.

echo "🔍 Running Startup Diagnostics..."

FAIL=0

# Check 1: Root Permissions (required for TUN)
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  Run as root (sudo) to verify TUN interface creation permissions if you intend to start the service."
fi

# Check 2: Ports
PORTS=(8080 8082 5353)
for PORT in "${PORTS[@]}"; do
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo "❌ Port $PORT is already in use!"
        lsof -i :$PORT
        FAIL=1
    else
        echo "✅ Port $PORT is available."
    fi
done

# Check 3: DNS Resolution
HOST="pr.oxylabs.io"
echo "Testing DNS resolution for $HOST..."
if nslookup "$HOST" >/dev/null 2>&1; then
    echo "✅ DNS resolution for $HOST succeeded."
else
    echo "❌ DNS resolution for $HOST failed!"
    FAIL=1
fi

HOST_FALLBACK="8.8.8.8"
if ping -c 1 "$HOST_FALLBACK" >/dev/null 2>&1; then
    echo "✅ Internet connectivity verified (ping $HOST_FALLBACK)."
else
    echo "❌ Cannot reach internet (ping $HOST_FALLBACK failed)."
    FAIL=1
fi

# Check 4: TUN Devices
# Just listing them to ensure no conflict with specific names if hardcoded
echo "Checking existing TUN devices..."
ifconfig | grep "utun" || echo "No active utun devices found (Clean slate)."

if [ $FAIL -eq 0 ]; then
    echo "✅ Diagnostics Passed. System ready for startup."
    exit 0
else
    echo "❌ Diagnostics Failed. Please fix the issues above."
    exit 1
fi

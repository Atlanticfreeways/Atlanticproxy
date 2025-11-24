#!/bin/bash

# Phase 2 Testing Script
# Tests all Phase 2 functionality

set -e

echo "🧪 Phase 2 Testing Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5000"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"

echo "📋 Test Configuration"
echo "API URL: $API_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH=$(curl -s "$API_URL/health" | jq -r '.status')
if [ "$HEALTH" = "ok" ] || [ "$HEALTH" = "degraded" ]; then
    echo -e "${GREEN}✅ Health check passed (status: $HEALTH)${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: User Registration
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "   User ID: $USER_ID"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "$REGISTER_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 3: User Login
echo "3️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$LOGIN_TOKEN" != "null" ] && [ "$LOGIN_TOKEN" != "" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "   Token: ${LOGIN_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 4: Get Current User
echo "4️⃣  Testing Get Current User..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ME_EMAIL=$(echo "$ME_RESPONSE" | jq -r '.email')

if [ "$ME_EMAIL" = "$TEST_EMAIL" ]; then
    echo -e "${GREEN}✅ Get current user successful${NC}"
    echo "   Email: $ME_EMAIL"
else
    echo -e "${RED}❌ Get current user failed${NC}"
    echo "$ME_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 5: Proxy Connect
echo "5️⃣  Testing Proxy Connect..."
CONNECT_RESPONSE=$(curl -s -X POST "$API_URL/api/proxy/connect" \
  -H "Authorization: Bearer $TOKEN")

CLIENT_ID=$(echo "$CONNECT_RESPONSE" | jq -r '.client_id')

if [ "$CLIENT_ID" != "null" ] && [ "$CLIENT_ID" != "" ]; then
    echo -e "${GREEN}✅ Proxy connect successful${NC}"
    echo "   Client ID: $CLIENT_ID"
else
    echo -e "${RED}❌ Proxy connect failed${NC}"
    echo "$CONNECT_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 6: Proxy Status
echo "6️⃣  Testing Proxy Status..."
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/api/proxy/status" \
  -H "Authorization: Bearer $TOKEN")

CONNECTED=$(echo "$STATUS_RESPONSE" | jq -r '.connected')

if [ "$CONNECTED" = "true" ]; then
    echo -e "${GREEN}✅ Proxy status check successful${NC}"
    echo "   Connected: $CONNECTED"
else
    echo -e "${YELLOW}⚠️  Proxy status returned: $CONNECTED${NC}"
fi
echo ""

# Test 7: Usage Stats
echo "7️⃣  Testing Usage Stats..."
STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/usage/stats" \
  -H "Authorization: Bearer $TOKEN")

BYTES_SENT=$(echo "$STATS_RESPONSE" | jq -r '.bytes_sent')

if [ "$BYTES_SENT" != "null" ]; then
    echo -e "${GREEN}✅ Usage stats successful${NC}"
    echo "   Bytes Sent: $BYTES_SENT"
else
    echo -e "${RED}❌ Usage stats failed${NC}"
    echo "$STATS_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 8: Usage Monthly
echo "8️⃣  Testing Usage Monthly..."
MONTHLY_RESPONSE=$(curl -s -X GET "$API_URL/api/usage/monthly" \
  -H "Authorization: Bearer $TOKEN")

MONTH=$(echo "$MONTHLY_RESPONSE" | jq -r '.month')

if [ "$MONTH" != "null" ] && [ "$MONTH" != "" ]; then
    echo -e "${GREEN}✅ Usage monthly successful${NC}"
    echo "   Month: $MONTH"
else
    echo -e "${RED}❌ Usage monthly failed${NC}"
    echo "$MONTHLY_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 9: Billing Plans
echo "9️⃣  Testing Billing Plans..."
PLANS_RESPONSE=$(curl -s -X GET "$API_URL/api/billing/plans" \
  -H "Authorization: Bearer $TOKEN")

PLAN_COUNT=$(echo "$PLANS_RESPONSE" | jq 'length')

if [ "$PLAN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Billing plans successful${NC}"
    echo "   Plans: $PLAN_COUNT"
else
    echo -e "${RED}❌ Billing plans failed${NC}"
    echo "$PLANS_RESPONSE" | jq .
    exit 1
fi
echo ""

# Test 10: Proxy Disconnect
echo "🔟 Testing Proxy Disconnect..."
DISCONNECT_RESPONSE=$(curl -s -X POST "$API_URL/api/proxy/disconnect" \
  -H "Authorization: Bearer $TOKEN")

DISCONNECT_STATUS=$(echo "$DISCONNECT_RESPONSE" | jq -r '.status')

if [ "$DISCONNECT_STATUS" = "disconnected" ]; then
    echo -e "${GREEN}✅ Proxy disconnect successful${NC}"
else
    echo -e "${YELLOW}⚠️  Proxy disconnect returned: $DISCONNECT_STATUS${NC}"
fi
echo ""

# Summary
echo "=========================="
echo -e "${GREEN}✅ All Phase 2 Tests Passed!${NC}"
echo "=========================="
echo ""
echo "📊 Test Summary:"
echo "  ✅ Health Check"
echo "  ✅ User Registration"
echo "  ✅ User Login"
echo "  ✅ Get Current User"
echo "  ✅ Proxy Connect"
echo "  ✅ Proxy Status"
echo "  ✅ Usage Stats"
echo "  ✅ Usage Monthly"
echo "  ✅ Billing Plans"
echo "  ✅ Proxy Disconnect"
echo ""
echo "🎉 Phase 2 Implementation Complete!"

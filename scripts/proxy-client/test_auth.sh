#!/bin/bash

echo "🧪 Testing AtlanticProxy Authentication System"
echo "=============================================="
echo ""

BASE_URL="http://localhost:8082"
TIMESTAMP=$(date +%s)$RANDOM
EMAIL="testuser${TIMESTAMP}@example.com"
PASSWORD="password123"

echo "📧 Test Email: $EMAIL"
echo ""

# Test 1: Register
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo "✅ Registration successful"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ Registration failed: $REGISTER_RESPONSE"
  exit 1
fi
echo ""

# Test 2: Get Me (Protected Route)
echo "2️⃣  Testing Protected Route (GET /api/auth/me)..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "$EMAIL"; then
  echo "✅ Protected route accessible with valid token"
else
  echo "❌ Protected route failed: $ME_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Logout
echo "3️⃣  Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "Logged out"; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed: $LOGOUT_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Verify Token Invalidated
echo "4️⃣  Testing Token Invalidation..."
INVALID_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "   Response: $INVALID_RESPONSE"

if echo "$INVALID_RESPONSE" | grep -q "error"; then
  echo "✅ Token successfully invalidated after logout"
else
  echo "❌ Token still valid after logout!"
  exit 1
fi
echo ""

# Test 5: Login with same credentials
echo "5️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✅ Login successful"
  NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   New Token: ${NEW_TOKEN:0:20}..."
else
  echo "❌ Login failed: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

echo "=============================================="
echo "🎉 All Authentication Tests Passed!"
echo "=============================================="

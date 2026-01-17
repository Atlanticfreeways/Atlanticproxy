#!/bin/bash

echo "Testing Bright Data connection..."

curl -v -x http://brd-customer-diamondman1960:57b96a12-7719-4dc5-91d7-346a923c55a2@brd.superproxy.io:22225 \
  https://lumtest.com/myip.json

echo ""
echo "If you see IP info above, Bright Data is working!"

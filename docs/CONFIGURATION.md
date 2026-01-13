# Configuration Guide

## Environment Variables

AtlanticProxy uses environment variables for configuration. Create a `.env` file in the `scripts/proxy-client` directory.

### Required Variables

#### Server Configuration
```bash
# API server port (default: 8082)
SERVER_PORT=8082
```

#### Oxylabs Configuration
```bash
# Residential Proxies credentials
OXYLABS_USERNAME=customer-yourcompany
OXYLABS_PASSWORD=your_password_here
```

**Note:** These are for Oxylabs **Residential Proxies**, not Realtime Crawler API.

#### Payment Configuration
```bash
# Paystack credentials (for Nigerian payments)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### Optional Variables

#### Database
```bash
# Custom database path (default: ~/.atlanticproxy/atlantic.db)
DATABASE_PATH=/custom/path/to/database.db
```

#### Logging
```bash
# Log level: debug, info, warn, error (default: info)
LOG_LEVEL=info

# Log format: json, text (default: json)
LOG_FORMAT=json
```

---

## Configuration Files

### `.env` - Development
Local development configuration with test credentials.

### `.env.prod` - Production
Production configuration with live credentials.

**Security:** Never commit `.env` files to version control!

---

## Database Configuration

### Default Location
```
~/.atlanticproxy/atlantic.db
```

### Custom Location
Set `DATABASE_PATH` environment variable:
```bash
DATABASE_PATH=/var/lib/atlanticproxy/data.db
```

### Schema
Database schema is automatically created on first run. Tables include:
- `users` - User accounts
- `plans` - Subscription plans
- `subscriptions` - User subscriptions
- `usage_tracking` - Bandwidth and request tracking
- `sessions` - Authentication sessions
- `payment_transactions` - Payment records
- `adblock_whitelist` - Whitelisted domains
- `adblock_custom` - Custom blocking rules

---

## Proxy Configuration

### Ports
- **HTTP Proxy:** 8080
- **SOCKS5 Proxy:** 1080
- **API Server:** 8082
- **DNS Filter:** 5053

### Oxylabs Endpoints
The service automatically uses these endpoints:
- `pr.oxylabs.io:7777` (Primary)
- `pr.oxylabs.io:8000` (Alternative)
- `79.127.141.221:7777` (Pre-resolved IP)

---

## Payment Configuration

### Paystack
1. Create account at https://paystack.com
2. Get API keys from Dashboard → Settings → API Keys
3. Set environment variables:
   ```bash
   PAYSTACK_SECRET_KEY=sk_live_xxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxx
   ```

### Webhook Setup
Configure Paystack webhook URL:
```
https://your-domain.com/webhooks/paystack
```

**Important:** Webhook signature verification uses `PAYSTACK_SECRET_KEY`.

---

## Security Best Practices

### 1. Environment Variables
- ✅ Use `.env` files for local development
- ✅ Use environment variables in production
- ❌ Never commit `.env` to git
- ❌ Never hardcode credentials

### 2. API Keys
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/prod
- ✅ Restrict key permissions
- ❌ Never expose keys in logs

### 3. Database
- ✅ Regular backups
- ✅ Restrict file permissions (600)
- ✅ Encrypt sensitive data
- ❌ Don't expose database publicly

---

## Example Configurations

### Development
```bash
# .env
SERVER_PORT=8082
OXYLABS_USERNAME=customer-testcompany
OXYLABS_PASSWORD=test_password
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
LOG_LEVEL=debug
```

### Production
```bash
# .env.prod
SERVER_PORT=8082
OXYLABS_USERNAME=customer-atlanticproxy
OXYLABS_PASSWORD=secure_production_password
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
LOG_LEVEL=info
LOG_FORMAT=json
DATABASE_PATH=/var/lib/atlanticproxy/data.db
```

---

## Troubleshooting

### "OXYLABS_USERNAME not set"
**Solution:** Set `OXYLABS_USERNAME` and `OXYLABS_PASSWORD` in `.env`

### "Database locked"
**Solution:** Ensure only one instance is running. Check file permissions.

### "Port already in use"
**Solution:** Change `SERVER_PORT` or kill process using the port:
```bash
lsof -ti:8082 | xargs kill -9
```

### "Paystack signature invalid"
**Solution:** Verify `PAYSTACK_SECRET_KEY` matches your Paystack account.

---

## Environment Detection

The service automatically detects:
- **Region:** Based on IP geolocation (ip-api.com)
- **Currency:** Mapped from region (NG → NGN, US → USD, etc.)

No configuration needed for currency localization.

---

## Advanced Configuration

### Custom Proxy Endpoints
Add custom Oxylabs endpoints via API:
```bash
POST /api/proxy/endpoints
{
  "endpoint": "custom.oxylabs.io:7777"
}
```

### Rate Limiting
Rate limits are automatically set based on subscription plan:
- Starter: 10 req/sec
- Personal: 50 req/sec
- Team: 500 req/sec
- Enterprise: 10,000 req/sec

### Session Timeout
JWT tokens expire after 24 hours. Users must re-login.

---

## Monitoring

### Health Check
```bash
curl http://localhost:8082/health
```

### Logs
Logs are written to stdout in JSON format (production) or text format (development).

### Metrics
- Request count
- Bandwidth usage
- Error rates
- Response times

All available via `/api/billing/usage` endpoint.

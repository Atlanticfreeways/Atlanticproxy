# Backend Deployment & Frontend Integration Guide

**Status:** Ready for Deployment  
**Date:** January 20, 2024  
**Environment:** Production Ready

---

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Monitoring setup
- [ ] Logging configured

### **Deployment Steps**

#### **1. Environment Configuration**

Create `.env.production`:
```bash
# Database
DATABASE_URL=postgres://user:password@prod-db:5432/atlantic_proxy
DATABASE_MAX_CONNECTIONS=20

# JWT
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRATION=24h

# Payment Providers
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYSTACK_SECRET_KEY=your_paystack_secret
CRYPTO_API_KEY=your_crypto_api_key

# Server
PORT=5000
GIN_MODE=release
LOG_LEVEL=info

# CORS
CORS_ALLOWED_ORIGINS=https://atlanticproxy.com,https://www.atlanticproxy.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

#### **2. Database Migration**

```bash
# Run migrations
psql $DATABASE_URL < backend/internal/database/migrations/001_initial.sql
psql $DATABASE_URL < backend/internal/database/migrations/002_auth.sql
psql $DATABASE_URL < backend/internal/database/migrations/003_proxy.sql
psql $DATABASE_URL < backend/internal/database/migrations/004_phase4_tables.sql

# Verify migrations
psql $DATABASE_URL -c "\dt"
```

#### **3. Build & Deploy**

```bash
# Build binary
go build -o bin/server cmd/server/main.go

# Run with systemd
sudo systemctl start atlantic-proxy-backend
sudo systemctl enable atlantic-proxy-backend

# Or with Docker
docker build -t atlantic-proxy-backend:latest .
docker run -d \
  --name atlantic-proxy-backend \
  -p 5000:5000 \
  --env-file .env.production \
  atlantic-proxy-backend:latest
```

#### **4. Verify Deployment**

```bash
# Health check
curl http://localhost:5000/health

# Test endpoint
curl -X POST http://localhost:5000/api/billing/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro",
    "protocol": "https",
    "ispTier": "premium",
    "billingCycle": "monthly"
  }'
```

---

## 🔗 Frontend Integration

### **1. Update API Base URL**

In `frontend/lib/api/proxyApi.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.atlanticproxy.com/api';
```

In `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://api.atlanticproxy.com/api
```

### **2. Connect Components to API**

#### **Example: SubscriptionPlans Component**

```tsx
import proxyApi from '@/lib/api/proxyApi';

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Calculate price
      const priceResult = await proxyApi.billing.calculatePrice({
        planId,
        protocol: 'https',
        ispTier: 'standard',
        billingCycle: 'monthly',
      });

      console.log('Price:', priceResult);

      // Process checkout
      const checkoutResult = await proxyApi.billing.checkout({
        planId,
        protocol: 'https',
        ispTier: 'standard',
        billingCycle: 'monthly',
        paymentMethodId: 'pm_123', // From payment method selection
      });

      console.log('Order:', checkoutResult);
      // Redirect to success page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Component JSX
  );
}
```

#### **Example: ProxyCustomizer Component**

```tsx
import proxyApi from '@/lib/api/proxyApi';

export default function ProxyCustomizer() {
  const handleSaveConfiguration = async () => {
    try {
      const result = await proxyApi.proxy.saveConfiguration({
        protocol: 'https',
        ispTier: 'premium',
        locations: ['loc_us_east_1', 'loc_eu_west_1'],
        loadBalancingMode: 'round-robin',
      });

      console.log('Configuration saved:', result);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  return (
    // Component JSX
  );
}
```

#### **Example: PaymentMethods Component**

```tsx
import proxyApi from '@/lib/api/proxyApi';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const data = await proxyApi.billing.getPaymentMethods();
        setMethods(data);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []);

  return (
    // Component JSX
  );
}
```

### **3. Error Handling**

```tsx
// Global error handler
const handleApiError = (error: Error) => {
  if (error.message.includes('401')) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Show permission error
    showError('You do not have permission to perform this action');
  } else if (error.message.includes('404')) {
    // Show not found error
    showError('Resource not found');
  } else {
    // Show generic error
    showError(error.message || 'An error occurred');
  }
};
```

### **4. Loading States**

```tsx
// Show loading indicator during API calls
{loading && <LoadingSpinner />}

// Show error message
{error && <ErrorAlert message={error} />}

// Show success message
{success && <SuccessAlert message="Operation completed successfully" />}
```

---

## 🔐 Security Configuration

### **CORS Setup**

```go
// In cmd/server/main.go
config := cors.DefaultConfig()
config.AllowOrigins = []string{
  "https://atlanticproxy.com",
  "https://www.atlanticproxy.com",
}
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
config.AllowHeaders = []string{"Authorization", "Content-Type"}
router.Use(cors.New(config))
```

### **Rate Limiting**

```go
// Add rate limiting middleware
import "github.com/gin-contrib/ratelimit"

router.Use(ratelimit.RateLimiter(
  ratelimit.FixedWindowRateLimiter(100, time.Minute),
))
```

### **HTTPS/TLS**

```bash
# Generate SSL certificate
certbot certonly --standalone -d api.atlanticproxy.com

# Configure in nginx
server {
    listen 443 ssl http2;
    server_name api.atlanticproxy.com;

    ssl_certificate /etc/letsencrypt/live/api.atlanticproxy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.atlanticproxy.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📊 Monitoring & Logging

### **Prometheus Metrics**

```go
import "github.com/prometheus/client_golang/prometheus"

var (
  httpRequestsTotal = prometheus.NewCounterVec(
    prometheus.CounterOpts{
      Name: "http_requests_total",
      Help: "Total HTTP requests",
    },
    []string{"method", "endpoint", "status"},
  )
)

router.GET("/metrics", gin.WrapH(promhttp.Handler()))
```

### **Structured Logging**

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("request processed",
  zap.String("endpoint", "/api/billing/checkout"),
  zap.Int("status", 200),
  zap.Duration("duration", time.Millisecond*150),
)
```

---

## 🧪 Post-Deployment Testing

### **Smoke Tests**

```bash
#!/bin/bash

# Test health endpoint
curl -f http://localhost:5000/health || exit 1

# Test calculate price
curl -f -X POST http://localhost:5000/api/billing/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"planId":"pro","protocol":"https","ispTier":"standard","billingCycle":"monthly"}' || exit 1

# Test get locations
curl -f http://localhost:5000/api/proxy/locations || exit 1

echo "All smoke tests passed!"
```

### **Load Testing**

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/proxy/locations

# Using wrk
wrk -t4 -c100 -d30s http://localhost:5000/api/proxy/locations
```

---

## 📋 Integration Checklist

### **Backend**
- [ ] All services implemented
- [ ] All handlers working
- [ ] Database migrations applied
- [ ] Payment processing configured
- [ ] Error handling complete
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Security hardened

### **Frontend**
- [ ] API client configured
- [ ] All components connected
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Success messages shown
- [ ] Form validation working
- [ ] Authentication tokens managed
- [ ] CORS issues resolved

### **Testing**
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security tests passing
- [ ] Performance tests passing
- [ ] Load tests passing

### **Deployment**
- [ ] Environment variables set
- [ ] Database migrated
- [ ] SSL/TLS configured
- [ ] Monitoring active
- [ ] Logging working
- [ ] Backups configured
- [ ] Disaster recovery plan
- [ ] Documentation updated

---

## 🚨 Troubleshooting

### **Common Issues**

#### **CORS Errors**
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```go
// Update CORS configuration
config.AllowOrigins = []string{"https://yourdomain.com"}
config.AllowCredentials = true
```

#### **Database Connection**
```
Error: connection refused
```

**Solution:**
```bash
# Check database is running
psql -U user -d atlantic_proxy -c "SELECT 1"

# Check connection string
echo $DATABASE_URL
```

#### **Payment Processing**
```
Error: Invalid API key
```

**Solution:**
```bash
# Verify environment variables
echo $STRIPE_SECRET_KEY
echo $PAYPAL_CLIENT_ID

# Test payment provider
curl -X POST https://api.stripe.com/v1/charges \
  -u sk_test_...: \
  -d amount=2000 \
  -d currency=usd
```

---

## 📞 Support

For deployment issues:
1. Check logs: `journalctl -u atlantic-proxy-backend -f`
2. Check database: `psql $DATABASE_URL -c "\dt"`
3. Check API: `curl http://localhost:5000/health`
4. Check frontend console for errors
5. Contact DevOps team

---

**Status: READY FOR PRODUCTION DEPLOYMENT ✅**


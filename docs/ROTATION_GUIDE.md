# Atlantic Proxy - IP Rotation Service Guide

**Version:** 1.0.0  
**Last Updated:** December 27, 2025

---

## Overview

Atlantic Proxy's IP Rotation Service provides flexible control over how your proxy IP addresses change, enabling use cases from web scraping to ad verification. Built on Oxylabs' premium residential proxy network, it offers both automatic rotation and sticky sessions.

---

## Rotation Strategies

### 1. Per-Request Rotation
**Use Case:** Maximum anonymity, web scraping, avoiding rate limits

Every request uses a different IP address. Ideal for high-volume scraping where you need maximum IP diversity.

**Configuration:**
```json
{
  "mode": "per-request",
  "country": "US"
}
```

**Characteristics:**
- New IP for every HTTP request
- Maximum anonymity
- No session persistence
- Best for stateless operations

---

### 2. Sticky Session (1 Minute)
**Use Case:** Quick tasks requiring session continuity

Maintains the same IP for 1 minute, then automatically rotates.

**Configuration:**
```json
{
  "mode": "sticky-1min",
  "country": "US",
  "city": "New York"
}
```

**Characteristics:**
- Same IP for 60 seconds
- Good for quick multi-step operations
- Automatic rotation after timeout
- Balances anonymity and session continuity

---

### 3. Sticky Session (10 Minutes)
**Use Case:** E-commerce browsing, form submissions, multi-page workflows

Maintains the same IP for 10 minutes. Standard for most browsing scenarios.

**Configuration:**
```json
{
  "mode": "sticky-10min",
  "country": "GB",
  "state": "England"
}
```

**Characteristics:**
- Same IP for 10 minutes
- Ideal for shopping carts, logins
- Residential proxy default
- Good balance for most use cases

---

### 4. Sticky Session (30 Minutes)
**Use Case:** Long sessions, streaming, video calls

Maintains the same IP for 30 minutes. Maximum session duration.

**Configuration:**
```json
{
  "mode": "sticky-30min",
  "country": "DE"
}
```

**Characteristics:**
- Same IP for 30 minutes
- Best for streaming services
- Reduces connection overhead
- Maximum session stability

---

## Geographic Targeting

### Supported Parameters

**Country-Level:**
```json
{
  "country": "US"  // 2-letter ISO code
}
```

**State/Region-Level:**
```json
{
  "country": "US",
  "state": "California"
}
```

**City-Level:**
```json
{
  "country": "US",
  "state": "California",
  "city": "Los Angeles"
}
```

### Available Locations

Atlantic Proxy supports 195+ countries through Oxylabs. Popular locations:

- **North America:** US, CA, MX
- **Europe:** GB, DE, FR, IT, ES, NL
- **Asia:** JP, SG, IN, KR, HK
- **Oceania:** AU, NZ
- **South America:** BR, AR, CL

---

## API Reference

### Configure Rotation Strategy

```bash
POST /api/rotation/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "mode": "sticky-10min",
  "country": "US",
  "state": "California",
  "city": "Los Angeles"
}
```

**Response:**
```json
{
  "success": true,
  "config": {
    "mode": "sticky-10min",
    "country": "US",
    "state": "California",
    "city": "Los Angeles"
  },
  "session_id": "abc123xyz",
  "current_ip": "192.0.2.1",
  "expires_at": "2025-12-27T12:10:00Z"
}
```

---

### Get Current Configuration

```bash
GET /api/rotation/config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "mode": "sticky-10min",
  "country": "US",
  "state": "California",
  "city": "Los Angeles",
  "session_id": "abc123xyz",
  "current_ip": "192.0.2.1",
  "session_started": "2025-12-27T12:00:00Z",
  "expires_at": "2025-12-27T12:10:00Z"
}
```

---

### Force New Session (Change IP)

```bash
POST /api/rotation/session/new
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "old_ip": "192.0.2.1",
  "new_ip": "192.0.2.42",
  "session_id": "xyz789abc",
  "location": "Los Angeles, CA, US"
}
```

---

### Get Rotation Statistics

```bash
GET /api/rotation/stats?period=24h
Authorization: Bearer <token>
```

**Response:**
```json
{
  "period": "24h",
  "total_rotations": 144,
  "unique_ips": 142,
  "average_session_duration": "10m15s",
  "geographic_distribution": {
    "US": 100,
    "GB": 30,
    "DE": 14
  },
  "rotation_success_rate": 99.3
}
```

---

## Dashboard Usage

### Rotation Control Page

Navigate to **Dashboard → Rotation** to access controls:

1. **Rotation Mode Selector**
   - Choose from: Per-Request, Sticky 1/10/30 min
   - Changes apply immediately

2. **Geographic Targeting**
   - Select Country, State, City from dropdowns
   - Map visualization shows current location

3. **Current Session Info**
   - Displays current IP address
   - Shows session timer countdown
   - "Change IP Now" button for manual rotation

4. **Rotation History**
   - Timeline of recent IP changes
   - Geographic distribution chart
   - Session duration statistics

---

## Best Practices

### Web Scraping
```json
{
  "mode": "per-request",
  "country": "US"
}
```
- Use per-request rotation
- Distribute across multiple countries if needed
- Monitor rotation success rate

### Ad Verification
```json
{
  "mode": "sticky-10min",
  "country": "US",
  "city": "New York"
}
```
- Use sticky sessions for multi-page verification
- Target specific cities for local ads
- Document IP used for each verification

### Price Comparison
```json
{
  "mode": "sticky-10min",
  "country": "GB"
}
```
- Use sticky sessions to complete checkout flow
- Change country between comparisons
- Clear cookies between sessions

### Content Streaming
```json
{
  "mode": "sticky-30min",
  "country": "US"
}
```
- Use maximum session duration
- Avoid rotation during active streams
- Monitor latency for optimal experience

---

## Troubleshooting

### IP Not Changing

**Problem:** IP stays the same despite rotation request

**Solutions:**
1. Check rotation mode - sticky sessions maintain IP
2. Wait for session timeout
3. Use "Change IP Now" button to force rotation
4. Verify Oxylabs credentials are valid

### Geographic Targeting Not Working

**Problem:** IP location doesn't match requested location

**Solutions:**
1. Verify country code is valid (2-letter ISO)
2. Check if state/city spelling is correct
3. Some locations may have limited availability
4. Try country-level targeting first

### High Latency After Rotation

**Problem:** Slow connections after IP change

**Solutions:**
1. New connections need warm-up time
2. Connection pool will optimize over time
3. Consider longer sticky sessions
4. Check if target location is geographically distant

### Session Expires Too Quickly

**Problem:** Session ends before expected timeout

**Solutions:**
1. Verify rotation mode configuration
2. Check for network interruptions
3. Ensure kill switch didn't activate
4. Review session logs for errors

---

## Performance Impact

### Latency by Rotation Mode

| Mode | Additional Latency | Use Case |
|------|-------------------|----------|
| Per-Request | +50-100ms | Maximum anonymity |
| Sticky 1min | +10-20ms | Quick tasks |
| Sticky 10min | +5-10ms | Standard browsing |
| Sticky 30min | +2-5ms | Long sessions |

### Throughput

Rotation mode has minimal impact on throughput:
- All modes: >100 Mbps sustained
- Connection pooling maintains performance
- Geographic distance affects speed more than rotation

---

## Pricing Considerations

Rotation strategies affect usage costs:

- **Per-Request:** Higher cost per GB (more IPs used)
- **Sticky Sessions:** Lower cost per GB (fewer IPs)
- **Geographic Targeting:** Premium locations may cost more

Monitor your rotation statistics to optimize costs.

---

## Advanced Configuration

### Environment Variables

```bash
# Default rotation mode
ROTATION_MODE=sticky-10min

# Default country
ROTATION_COUNTRY=US

# Session cache timeout
ROTATION_CACHE_TIMEOUT=30s

# Enable rotation analytics
ROTATION_ANALYTICS=true
```

### Programmatic Control

```javascript
// JavaScript example
const atlanticProxy = new AtlanticProxyClient(token);

// Configure rotation
await atlanticProxy.rotation.configure({
  mode: 'sticky-10min',
  country: 'US',
  city: 'New York'
});

// Force IP change
const newSession = await atlanticProxy.rotation.newSession();
console.log('New IP:', newSession.new_ip);

// Get statistics
const stats = await atlanticProxy.rotation.getStats('24h');
console.log('Rotations today:', stats.total_rotations);
```

---

## Support

For rotation service issues:
- Check rotation statistics for errors
- Review session logs in Activity page
- Verify Oxylabs account has sufficient credits
- Contact support with session ID for troubleshooting

---

**Happy rotating!**

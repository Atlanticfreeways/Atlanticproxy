# AtlanticProxy Implementation Plan
**Standby Proxy Platform Integration with Existing Architecture**

The end product will provide **ad-blocking capabilities** to block all types of advertisements for users connected through AtlanticProxy. 


## 🏗️ Integration with Current AtlanticProxy Structure

### **Existing Project Structure Enhancement**
```
atlantic-proxy/
├── frontend/              # Next.js React application (EXISTING)
├── backend/               # Express.js API server (EXISTING)
├── database/              # PostgreSQL schema (EXISTING)
├── proxy-client/          # NEW: Go-based standby proxy client
│   ├── cmd/
│   │   ├── service/       # System service daemon
│   │   └── cli/           # Command-line interface
│   ├── internal/
│   │   ├── interceptor/   # Traffic interception engine
│   │   ├── proxy/         # Transparent proxy handler
│   │   ├── pool/          # Connection pool manager
│   │   ├── monitor/       # Network state monitor
│   │   ├── validator/     # Anonymity verification
│   │   ├── failover/      # Advanced failover controller
│   │   └── killswitch/    # Kill switch guardian
│   ├── pkg/
│   │   ├── oxylabs/       # Oxylabs API integration
│   │   └── config/        # Configuration management
│   └── scripts/           # Installation scripts
├── proxy-server/          # NEW: Go-based proxy infrastructure
│   ├── cmd/server/        # Main server application
│   ├── internal/
│   │   ├── api/           # REST API handlers
│   │   ├── health/        # Health monitoring
│   │   └── metrics/       # Performance metrics
│   └── deployments/       # Kubernetes manifests
├── nginx/                 # Reverse proxy config (EXISTING)
├── scripts/               # Deployment scripts (EXISTING)
└── docs/                  # Documentation (EXISTING)
```

## 🔄 Implementation Strategy

### **Phase 1: Foundation Integration (Months 1-2)**

#### **1.1 Backend API Extensions**
```javascript
// backend/routes/proxy.js - NEW
app.post('/api/proxy/connect', authenticateUser, async (req, res) => {
  // Initiate standby proxy connection
  // Return connection credentials
});

app.get('/api/proxy/status', authenticateUser, async (req, res) => {
  // Real-time proxy status
  // Anonymity verification results
});
```

#### **1.2 Database Schema Extensions**
```sql
-- database/migrations/add_proxy_tables.sql - NEW
CREATE TABLE proxy_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  endpoint_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE anonymity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ip_detected VARCHAR(45),
  dns_leak BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### **1.3 Go Client Service Foundation**
```go
// proxy-client/cmd/service/main.go - NEW
package main

import (
    "context"
    "log"
    "os"
    "os/signal"
    "syscall"
    
    "github.com/atlanticproxy/proxy-client/internal/service"
)

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    svc := service.New()
    
    // Handle shutdown signals
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    go func() {
        <-sigChan
        cancel()
    }()
    
    if err := svc.Run(ctx); err != nil {
        log.Fatal(err)
    }
}
```

### **Phase 2: Core Proxy Implementation (Months 2-3)**

#### **2.1 TUN/TAP Interface Integration**
```go
// proxy-client/internal/interceptor/tun.go - NEW
package interceptor

import (
    "github.com/songgao/water"
    "golang.org/x/sys/unix"
)

type TunInterceptor struct {
    iface *water.Interface
    config *Config
}

func NewTunInterceptor(config *Config) (*TunInterceptor, error) {
    iface, err := water.New(water.Config{
        DeviceType: water.TUN,
        PlatformSpecificParams: water.PlatformSpecificParams{
            Name: "atlantic-tun0",
        },
    })
    if err != nil {
        return nil, err
    }
    
    return &TunInterceptor{
        iface: iface,
        config: config,
    }, nil
}

func (t *TunInterceptor) Start() error {
    // Configure routing tables
    // Start packet processing
    return nil
}
```

#### **2.2 Oxylabs Integration**
```go
// proxy-client/pkg/oxylabs/client.go - NEW
package oxylabs

import (
    "context"
    "net/http"
    "net/url"
)

type Client struct {
    username string
    password string
    endpoints []string
}

func NewClient(username, password string) *Client {
    return &Client{
        username: username,
        password: password,
        endpoints: []string{
            "pr.oxylabs.io:7777",
            "pr.oxylabs.io:8000",
        },
    }
}

func (c *Client) GetProxy(ctx context.Context) (*url.URL, error) {
    // Return healthy Oxylabs endpoint
    // Implement load balancing
    return &url.URL{
        Scheme: "http",
        Host:   c.endpoints[0],
        User:   url.UserPassword(c.username, c.password),
    }, nil
}
```

### **Phase 3: Frontend Integration (Months 3-4)**

#### **3.1 React Dashboard Components**
```tsx
// frontend/components/ProxyStatus.tsx - NEW
import React, { useEffect, useState } from 'react';

interface ProxyStatus {
  connected: boolean;
  anonymityVerified: boolean;
  currentIP: string;
  location: string;
}

export const ProxyStatusDashboard: React.FC = () => {
  const [status, setStatus] = useState<ProxyStatus | null>(null);
  
  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch('/api/proxy/status');
      const data = await response.json();
      setStatus(data);
    };
    
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="proxy-status-dashboard">
      <div className={`status-indicator ${status?.connected ? 'connected' : 'disconnected'}`}>
        {status?.connected ? 'Protected' : 'Disconnected'}
      </div>
      <div className="anonymity-status">
        IP: {status?.currentIP}
        Location: {status?.location}
      </div>
    </div>
  );
};
```

#### **3.2 Control Interface**
```tsx
// frontend/components/ProxyControls.tsx - NEW
export const ProxyControls: React.FC = () => {
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(true);
  
  const toggleKillSwitch = async () => {
    await fetch('/api/proxy/killswitch', {
      method: 'POST',
      body: JSON.stringify({ enabled: !killSwitchEnabled }),
    });
    setKillSwitchEnabled(!killSwitchEnabled);
  };
  
  return (
    <div className="proxy-controls">
      <button onClick={toggleKillSwitch}>
        Kill Switch: {killSwitchEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
};
```

## 🚀 Deployment Integration

### **Docker Compose Enhancement**
```yaml
# docker-compose.dev.yml - ENHANCED
version: '3.8'
services:
  # Existing services...
  postgres:
    image: postgres:15
    # ... existing config
  
  redis:
    image: redis:7-alpine
    # ... existing config
  
  # NEW: Proxy infrastructure
  proxy-server:
    build: ./proxy-server
    ports:
      - "9000:9000"
    environment:
      - OXYLABS_USERNAME=${OXYLABS_USERNAME}
      - OXYLABS_PASSWORD=${OXYLABS_PASSWORD}
    depends_on:
      - postgres
      - redis
  
  # Enhanced backend with proxy integration
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PROXY_SERVER_URL=http://proxy-server:9000
    depends_on:
      - postgres
      - redis
      - proxy-server
```

### **Installation Scripts**
```bash
#!/bin/bash
# scripts/install-proxy-client.sh - NEW

set -e

echo "Installing AtlanticProxy Client..."

# Download and install Go binary
curl -L https://github.com/atlanticproxy/releases/latest/download/atlantic-proxy-client-$(uname -s)-$(uname -m) -o /usr/local/bin/atlantic-proxy-client
chmod +x /usr/local/bin/atlantic-proxy-client

# Install system service
sudo atlantic-proxy-client install-service

# Start service
sudo systemctl enable atlantic-proxy
sudo systemctl start atlantic-proxy

echo "AtlanticProxy Client installed successfully!"
```

## 🔧 Configuration Management

### **Environment Variables**
```bash
# .env - ENHANCED
# Existing variables...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# NEW: Proxy configuration
OXYLABS_USERNAME=your_username
OXYLABS_PASSWORD=your_password
PROXY_KILL_SWITCH_ENABLED=true
ANONYMITY_CHECK_INTERVAL=30
FAILOVER_TIMEOUT=2000
```

### **Client Configuration**
```yaml
# proxy-client/config/config.yaml - NEW
proxy:
  oxylabs:
    username: ${OXYLABS_USERNAME}
    password: ${OXYLABS_PASSWORD}
    endpoints:
      - "pr.oxylabs.io:7777"
      - "pr.oxylabs.io:8000"
  
  killswitch:
    enabled: true
    whitelist:
      - "127.0.0.1"
      - "localhost"
  
  anonymity:
    check_interval: 30s
    leak_detection_urls:
      - "https://httpbin.org/ip"
      - "https://api.ipify.org"
  
  failover:
    timeout: 2s
    max_retries: 3
```

## 📊 Integration Points

### **Backend API Extensions**
- `/api/proxy/connect` - Initiate proxy connection
- `/api/proxy/status` - Real-time status
- `/api/proxy/logs` - Anonymity verification logs
- `/api/proxy/config` - Configuration management

### **Frontend Enhancements**
- Real-time proxy status dashboard
- Anonymity verification display
- Kill switch controls
- Performance metrics

### **Database Integration**
- User proxy preferences
- Connection logs
- Anonymity verification history
- Performance metrics storage

## 🎯 Success Metrics

- **Connection Uptime**: >99.9%
- **Anonymity Guarantee**: Zero leaks detected
- **Failover Speed**: <2 seconds
- **User Experience**: Seamless integration with existing platform

---

## ⚡ Phase 4: Performance Optimization (Month 5)

### **Critical Issue Identified**
Current implementation has latency issues causing streaming buffering:
- New HTTP client created per request (+50-200ms)
- Synchronous proxy lookups (+5-20ms)
- Blocking health checks (+100-500ms)
- Total overhead: 200-900ms per request

### **4.1 HTTP Connection Pooling (CRITICAL)**

**Problem:** New HTTP client created for EVERY request - causes video buffering.

```go
// proxy-client/internal/proxy/engine.go - OPTIMIZED
package proxy

type Engine struct {
    config    *Config
    oxylabs   *oxylabs.Client
    proxy     *goproxy.ProxyHttpServer
    transport *http.Transport  // SHARED transport with pooling
}

func NewEngine(config *Config) *Engine {
    // Persistent connection pool
    transport := &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        MaxConnsPerHost:     20,
        IdleConnTimeout:     90 * time.Second,
        DisableKeepAlives:   false,
        ForceAttemptHTTP2:   true,
        TLSHandshakeTimeout: 10 * time.Second,
        ResponseHeaderTimeout: 30 * time.Second,
    }
    
    return &Engine{
        config:    config,
        transport: transport,
    }
}
```

**Acceptance Criteria:**
- ✅ Connection reuse rate >95%
- ✅ Per-request latency <5ms (was 50-200ms)
- ✅ Video streaming without buffering
- ✅ HTTP/2 multiplexing enabled

### **4.2 Proxy URL Caching**

**Problem:** Mutex lock + random selection on every request.

```go
// proxy-client/internal/proxy/engine.go - OPTIMIZED
type Engine struct {
    cachedProxy atomic.Value  // *url.URL - lock-free reads
}

func (e *Engine) Start(ctx context.Context) error {
    // Background proxy cache refresh
    go e.refreshProxyCache(ctx)
    // ...
}

func (e *Engine) refreshProxyCache(ctx context.Context) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
    
    // Initial load
    if proxyURL, err := e.oxylabs.GetProxy(ctx); err == nil {
        e.cachedProxy.Store(proxyURL)
    }
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            if proxyURL, err := e.oxylabs.GetProxy(ctx); err == nil {
                e.cachedProxy.Store(proxyURL)
            }
        }
    }
}

func (e *Engine) getCachedProxy() *url.URL {
    if v := e.cachedProxy.Load(); v != nil {
        return v.(*url.URL)
    }
    return nil
}
```

**Acceptance Criteria:**
- ✅ Proxy lookup latency <0.1ms (was 5-20ms)
- ✅ No mutex contention on request path
- ✅ Background refresh every 30 seconds
- ✅ Automatic invalidation on failure

### **4.3 Async Health Monitoring**

**Problem:** Health checks block user traffic.

```go
// health-monitor.go - OPTIMIZED
func (hm *HealthMonitor) checkProvider(name string, p *ProviderHealth) {
    // Use internal endpoint instead of external
    client := &http.Client{
        Timeout: 5 * time.Second,
        Transport: &http.Transport{
            DisableKeepAlives: true,
        },
    }
    
    // Internal health check (fast)
    resp, err := client.Get("http://127.0.0.1:8080/health")
    // ...
}
```

**Acceptance Criteria:**
- ✅ Health checks never block user requests
- ✅ Internal endpoint response <10ms
- ✅ External checks timeout after 5 seconds
- ✅ Non-blocking status updates

### **4.4 Session Transport Optimization**

**Problem:** Mutex lock on every RoundTrip.

```go
// session-persistence.go - OPTIMIZED
type Session struct {
    headers atomic.Value // map[string]string (immutable copy)
}

func (st *SessionTransport) RoundTrip(req *http.Request) (*http.Response, error) {
    // Lock-free header access
    if headers := st.session.headers.Load(); headers != nil {
        for key, value := range headers.(map[string]string) {
            req.Header.Set(key, value)
        }
    }
    return st.base.RoundTrip(req)
}
```

**Acceptance Criteria:**
- ✅ Zero mutex locks on read path
- ✅ Header injection latency <0.1ms
- ✅ No contention under high load

### **4.5 Performance Targets**

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Per-request latency | 200-900ms | 15-30ms | <50ms |
| Connection reuse | 0% | >95% | >90% |
| Video streaming | Buffering | Smooth | No buffering |
| Video calls | Choppy | Clear | <100ms RTT |
| Throughput | ~50 Mbps | >100 Mbps | >100 Mbps |
| Memory usage | Growing | Stable | <200MB |

### **4.6 Benchmarking Requirements**

```go
// Test scenarios
- 1000 concurrent connections
- 10,000 requests/second burst
- 24-hour stability test
- Network failover simulation
- Streaming video playback test
- Video call quality test
```

**Acceptance Criteria:**
- ✅ p50 latency <20ms
- ✅ p95 latency <50ms
- ✅ p99 latency <100ms
- ✅ Zero buffering on 1080p video
- ✅ No memory leaks over 24 hours
- ✅ Graceful degradation under load

---

## 🚫 Phase 5: Ad-Blocking Integration (Months 6-7)

### **Legal & Compliance Framework**

**Regional Compliance Strategy:**
- **Opt-in by Default**: Ad-blocking disabled in restricted regions
- **User Request Model**: Available only upon explicit user activation
- **Geolocation Detection**: Automatic feature availability based on user location
- **Terms of Service**: Clear disclosure of ad-blocking capabilities
- **Restricted Regions**: Germany (limited), China (prohibited), regions with anti-ad-blocking laws

```go
// proxy-client/internal/adblock/compliance.go - NEW
package adblock

type ComplianceManager struct {
    restrictedRegions map[string]RestrictionLevel
    userLocation      string
}

type RestrictionLevel int

const (
    Allowed RestrictionLevel = iota
    OptInOnly
    Prohibited
)

func (c *ComplianceManager) IsAdBlockAllowed(userCountry string) RestrictionLevel {
    if level, exists := c.restrictedRegions[userCountry]; exists {
        return level
    }
    return Allowed
}
```

### **5.1 DNS-Level Ad Blocking**
Integrate DNS filtering to block ad-serving domains at the network level.

**Implementation Options:**
1. **Custom DNS Resolver** (Recommended) - Built into Atlantic proxy client using Go
2. **AdGuard Home Integration** - Open-source, self-hosted
3. **Partnership with AdGuard** - Commercial API integration

```go
// proxy-client/internal/adblock/dns_filter.go - NEW
package adblock

import (
    "github.com/miekg/dns"
    "sync"
)

type DNSFilter struct {
    blocklists  map[string]bool  // Domain -> blocked
    cache       *sync.Map         // LRU cache for performance
    enabled     bool
    compliance  *ComplianceManager
}

func (f *DNSFilter) ShouldBlock(domain string) bool {
    // Check compliance first
    if !f.enabled || !f.compliance.IsAdBlockAllowed(userCountry) {
        return false
    }
    
    // Check against blocklists (EasyList, AdGuard, etc.)
    if blocked, exists := f.blocklists[domain]; exists {
        return blocked
    }
    return false
}
```

**Blocklist Sources:**
- EasyList (ads) - 60k+ rules
- EasyPrivacy (trackers) - 20k+ rules
- AdGuard Base Filter - 50k+ rules
- Malware domains - 10k+ rules
- Custom Atlantic blocklist

### **5.2 HTTP/HTTPS Content Filtering**
Filter ad requests at the proxy level before they reach the user.

**Tech Stack Compatibility:**
- ✅ **Go** - Perfect for high-performance filtering (current stack)
- ✅ **Existing Proxy Engine** - Already intercepts HTTP/HTTPS
- ✅ **No Additional Languages Needed** - Pure Go implementation

```go
// proxy-client/internal/adblock/request_filter.go - NEW
package adblock

import (
    "net/http"
    "regexp"
)

type RequestFilter struct {
    urlPatterns   []*regexp.Regexp  // Compiled regex patterns
    domainRules   map[string]bool   // Fast domain lookup
    contentTypes  []string          // Block ad content types
    compliance    *ComplianceManager
}

func (f *RequestFilter) FilterRequest(req *http.Request, userCountry string) FilterAction {
    // Check compliance
    if f.compliance.IsAdBlockAllowed(userCountry) == Prohibited {
        return AllowRequest
    }
    
    // Check URL against ad patterns
    if f.matchesAdPattern(req.URL.String()) {
        return BlockRequest
    }
    
    return AllowRequest
}

type FilterAction int
const (
    AllowRequest FilterAction = iota
    BlockRequest
    ModifyRequest
)
```

### **5.3 Partnership Options**

**Option A: Build In-House (Recommended)**
- **Pros**: Full control, no licensing fees, privacy-focused
- **Cons**: Maintenance overhead, blocklist updates
- **Tech Stack**: Pure Go - fits perfectly with existing codebase
- **Timeline**: 4-6 weeks
- **Cost**: Development time only

**Option B: AdGuard Partnership**
- **Pros**: Established blocklists, automatic updates, support
- **Cons**: Licensing fees (~$5k-20k/year), dependency
- **Integration**: AdGuard Home API (Go-compatible)
- **Timeline**: 2-3 weeks
- **Cost**: License + integration

**Option C: Hybrid Approach**
- **Build**: DNS filtering (simple, fast)
- **Partner**: Advanced features (cosmetic filtering, element hiding)
- **Best of Both**: Control + advanced features

### **5.4 Project Structure Enhancement**
```
proxy-client/
├── internal/
│   ├── adblock/           # NEW: Ad-blocking module (Pure Go)
│   │   ├── compliance.go      # Regional compliance manager
│   │   ├── dns_filter.go      # DNS-level blocking
│   │   ├── request_filter.go  # HTTP request filtering
│   │   ├── blocklist.go       # Blocklist management
│   │   ├── updater.go         # Automatic blocklist updates
│   │   ├── stats.go           # Blocking statistics
│   │   └── config.go          # Ad-block configuration
│   └── ...
```

**No Additional Languages/Sidecars Needed:**
- ✅ Pure Go implementation
- ✅ Uses existing DNS library: `github.com/miekg/dns`
- ✅ Uses existing HTTP proxy: `github.com/elazarl/goproxy`
- ✅ Regex engine: Go standard library
- ✅ No Python/Node.js/Rust required

### **5.5 Configuration**
```yaml
# proxy-client/config/config.yaml - ENHANCED
adblock:
  # Compliance settings
  compliance:
    enabled: true
    geolocation_check: true
    restricted_regions:
      - country: "CN"
        level: "prohibited"
      - country: "DE"
        level: "opt_in_only"
  
  # Feature toggles
  enabled: false  # Disabled by default (opt-in)
  dns_filtering: true
  http_filtering: true
  
  # Blocklist sources
  blocklists:
    - url: "https://easylist.to/easylist/easylist.txt"
      enabled: true
      category: "ads"
    - url: "https://easylist.to/easylist/easyprivacy.txt"
      enabled: true
      category: "trackers"
    - url: "https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt"
      enabled: true
      category: "ads"
  
  # User customization
  custom_rules: []
  whitelist: []
  update_interval: 24h
  
  # Performance tuning
  cache_size: 10000
  max_rules: 100000
```

### **5.6 Frontend Controls**
```tsx
// frontend/components/AdBlockControls.tsx - NEW
export const AdBlockControls: React.FC = () => {
  const [adBlockEnabled, setAdBlockEnabled] = useState(false); // Opt-in default
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [stats, setStats] = useState({ blocked: 0, allowed: 0 });
  
  useEffect(() => {
    // Check if ad-blocking is allowed in user's region
    fetch('/api/adblock/compliance').then(res => res.json()).then(setComplianceStatus);
  }, []);
  
  const handleToggle = async (enabled: boolean) => {
    if (complianceStatus?.level === 'prohibited') {
      alert('Ad-blocking is not available in your region due to local regulations.');
      return;
    }
    
    if (complianceStatus?.level === 'opt_in_only' && enabled) {
      // Show consent dialog
      const confirmed = await showConsentDialog();
      if (!confirmed) return;
    }
    
    await fetch('/api/adblock/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled })
    });
    setAdBlockEnabled(enabled);
  };
  
  return (
    <div className="adblock-controls">
      {complianceStatus?.level === 'prohibited' ? (
        <div className="compliance-notice">
          Ad-blocking unavailable in your region
        </div>
      ) : (
        <>
          <Toggle 
            label="Ad Blocking (Opt-in)" 
            enabled={adBlockEnabled}
            onChange={handleToggle}
          />
          <div className="stats">
            <span>Ads Blocked Today: {stats.blocked.toLocaleString()}</span>
            <span>Trackers Blocked: {stats.trackers}</span>
          </div>
          <div className="categories">
            <Checkbox label="Block Ads" />
            <Checkbox label="Block Trackers" />
            <Checkbox label="Block Malware" />
          </div>
        </>
      )}
    </div>
  );
};
```

### **5.7 Backend API Endpoints**
```go
// backend/internal/api/adblock_handlers.go - NEW
package api

// Compliance check
GET  /api/adblock/compliance
Response: {
  "allowed": true,
  "level": "allowed|opt_in_only|prohibited",
  "country": "US",
  "message": "Ad-blocking available"
}

// Status and statistics
GET  /api/adblock/status
Response: {
  "enabled": true,
  "blocked_today": 1234,
  "blocked_total": 45678,
  "categories": {
    "ads": 800,
    "trackers": 400,
    "malware": 34
  }
}

// Toggle ad-blocking
POST /api/adblock/toggle
Body: { "enabled": true, "consent": true }
Response: { "success": true }

// Blocklist management
GET  /api/adblock/blocklists
POST /api/adblock/whitelist
DELETE /api/adblock/whitelist/:domain
```

### **5.8 Database Schema**
```sql
-- backend/internal/database/migrations/add_adblock_tables.sql
CREATE TABLE adblock_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  enabled BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  categories JSONB DEFAULT '{"ads":true,"trackers":true,"malware":true}',
  custom_whitelist TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE adblock_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date DATE DEFAULT CURRENT_DATE,
  ads_blocked INTEGER DEFAULT 0,
  trackers_blocked INTEGER DEFAULT 0,
  malware_blocked INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_adblock_stats_user_date ON adblock_stats(user_id, date);
```

### **5.9 Success Metrics**
- **Ad Block Rate**: >95% of known ad domains blocked
- **Performance Impact**: <5ms additional latency
- **Blocklist Updates**: Automatic daily updates
- **User Control**: Granular enable/disable per category
- **Compliance**: 100% adherence to regional regulations
- **Opt-in Rate**: Target 40-60% of users in allowed regions

---

This implementation plan seamlessly integrates the standby proxy functionality into your existing AtlanticProxy architecture while maintaining the current user experience and adding powerful new capabilities including comprehensive ad-blocking.
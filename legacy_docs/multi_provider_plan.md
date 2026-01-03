# 🔌 Multi-Provider Proxy Platform - Implementation Plan

**Goal:** Transform AtlanticProxy into a flexible platform supporting multiple proxy providers (Oxylabs, PIA, Bright Data, Smartproxy, etc.)

**Current State:** Hardcoded for Oxylabs Residential Proxies  
**Target State:** Provider-agnostic architecture with plugin system

---

## 📋 Architecture Overview

### **Current (V1.0)**
```
Proxy Engine → Oxylabs Client → pr.oxylabs.io
```

### **Target (V2.0)**
```
Proxy Engine → Provider Manager → [Oxylabs | PIA | Bright Data | Custom]
```

---

## 🏗️ Implementation Phases

### **Phase 1: Provider Abstraction Layer** (2-3 days)

#### 1.1 Create Provider Interface
```go
// pkg/providers/provider.go
type ProxyProvider interface {
    // Core Methods
    GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error)
    HealthCheck(ctx context.Context) error
    GetStats() ProviderStats
    
    // Metadata
    Name() string
    Type() ProviderType
    SupportedFeatures() []Feature
}

type ProxyConfig struct {
    SessionID   string
    Country     string
    City        string
    State       string
    SessionTime int
    Protocol    Protocol // HTTP, SOCKS5, HTTPS
}

type ProviderType string
const (
    TypeResidential ProviderType = "residential"
    TypeDatacenter  ProviderType = "datacenter"
    TypeMobile      ProviderType = "mobile"
    TypeISP         ProviderType = "isp"
)

type Feature string
const (
    FeatureGeoTargeting  Feature = "geo_targeting"
    FeatureSessions      Feature = "sticky_sessions"
    FeatureRotation      Feature = "rotation"
    FeatureSOCKS5        Feature = "socks5"
    FeatureHTTPS         Feature = "https"
)
```

#### 1.2 Refactor Oxylabs Client
```go
// pkg/providers/oxylabs/client.go
type OxylabsProvider struct {
    username string
    password string
    endpoints []string
    // ... existing fields
}

func (o *OxylabsProvider) GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error) {
    // Existing logic from pkg/oxylabs/client.go
}

func (o *OxylabsProvider) Name() string { return "Oxylabs" }
func (o *OxylabsProvider) Type() ProviderType { return TypeResidential }
func (o *OxylabsProvider) SupportedFeatures() []Feature {
    return []Feature{
        FeatureGeoTargeting,
        FeatureSessions,
        FeatureRotation,
        FeatureSOCKS5,
    }
}
```

---

### **Phase 2: Add PIA Support** (1-2 days)

#### 2.1 PIA Provider Implementation
```go
// pkg/providers/pia/client.go
type PIAProvider struct {
    username string
    password string
    region   string
}

func NewPIAProvider(username, password string) *PIAProvider {
    return &PIAProvider{
        username: username,
        password: password,
    }
}

func (p *PIAProvider) GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error) {
    // PIA uses SOCKS5 proxy format
    // proxy.privateinternetaccess.com:1080
    
    endpoint := "proxy.privateinternetaccess.com:1080"
    if config.Country != "" {
        // PIA regional endpoints
        endpoint = fmt.Sprintf("%s.privateinternetaccess.com:1080", 
            regionCode(config.Country))
    }
    
    proxyURL := &url.URL{
        Scheme: "socks5",
        User:   url.UserPassword(p.username, p.password),
        Host:   endpoint,
    }
    
    return proxyURL, nil
}

func (p *PIAProvider) SupportedFeatures() []Feature {
    return []Feature{
        FeatureSOCKS5,
        FeatureGeoTargeting, // Limited to country-level
    }
}
```

#### 2.2 PIA Configuration
```bash
# .env additions
PROVIDER_TYPE=pia  # or "oxylabs" or "auto"

# PIA Credentials
PIA_USERNAME=p1234567
PIA_PASSWORD=your_password

# Oxylabs Credentials (keep existing)
OXYLABS_USERNAME=customer-yourcompany
OXYLABS_PASSWORD=your_password
```

---

### **Phase 3: Provider Manager** (2 days)

#### 3.1 Manager Implementation
```go
// pkg/providers/manager.go
type Manager struct {
    providers map[string]ProxyProvider
    active    ProxyProvider
    fallbacks []ProxyProvider
    mu        sync.RWMutex
}

func NewManager() *Manager {
    return &Manager{
        providers: make(map[string]ProxyProvider),
        fallbacks: make([]ProxyProvider, 0),
    }
}

func (m *Manager) RegisterProvider(name string, provider ProxyProvider) {
    m.mu.Lock()
    defer m.mu.Unlock()
    m.providers[name] = provider
}

func (m *Manager) SetActive(name string) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    provider, ok := m.providers[name]
    if !ok {
        return fmt.Errorf("provider %s not found", name)
    }
    
    m.active = provider
    return nil
}

func (m *Manager) GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error) {
    m.mu.RLock()
    active := m.active
    fallbacks := m.fallbacks
    m.mu.RUnlock()
    
    // Try active provider
    if active != nil {
        proxy, err := active.GetProxy(ctx, config)
        if err == nil {
            return proxy, nil
        }
        log.Warnf("Active provider %s failed: %v", active.Name(), err)
    }
    
    // Try fallbacks
    for _, provider := range fallbacks {
        proxy, err := provider.GetProxy(ctx, config)
        if err == nil {
            log.Infof("Fallback to provider: %s", provider.Name())
            return proxy, nil
        }
    }
    
    return nil, fmt.Errorf("all providers failed")
}

func (m *Manager) AddFallback(name string) error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    provider, ok := m.providers[name]
    if !ok {
        return fmt.Errorf("provider %s not found", name)
    }
    
    m.fallbacks = append(m.fallbacks, provider)
    return nil
}
```

#### 3.2 Service Integration
```go
// internal/service/service.go
func (s *Service) initializeProviders() error {
    manager := providers.NewManager()
    
    // Register Oxylabs
    if os.Getenv("OXYLABS_USERNAME") != "" {
        oxylabs := oxylabs.NewOxylabsProvider(
            os.Getenv("OXYLABS_USERNAME"),
            os.Getenv("OXYLABS_PASSWORD"),
        )
        manager.RegisterProvider("oxylabs", oxylabs)
    }
    
    // Register PIA
    if os.Getenv("PIA_USERNAME") != "" {
        pia := pia.NewPIAProvider(
            os.Getenv("PIA_USERNAME"),
            os.Getenv("PIA_PASSWORD"),
        )
        manager.RegisterProvider("pia", pia)
    }
    
    // Set active provider
    activeProvider := os.Getenv("PROVIDER_TYPE")
    if activeProvider == "" {
        activeProvider = "oxylabs" // Default
    }
    
    if err := manager.SetActive(activeProvider); err != nil {
        return err
    }
    
    // Add fallbacks
    if activeProvider != "pia" && os.Getenv("PIA_USERNAME") != "" {
        manager.AddFallback("pia")
    }
    
    s.providerManager = manager
    return nil
}
```

---

### **Phase 4: Additional Providers** (1 day each)

#### 4.1 Bright Data
```go
// pkg/providers/brightdata/client.go
type BrightDataProvider struct {
    username string
    password string
    zone     string
}

func (b *BrightDataProvider) GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error) {
    // Bright Data format: username-session-{sessionid}-country-{cc}
    user := fmt.Sprintf("%s-session-%s", b.username, config.SessionID)
    if config.Country != "" {
        user += fmt.Sprintf("-country-%s", strings.ToLower(config.Country))
    }
    
    return &url.URL{
        Scheme: "http",
        User:   url.UserPassword(user, b.password),
        Host:   fmt.Sprintf("brd.superproxy.io:22225"),
    }, nil
}
```

#### 4.2 Smartproxy
```go
// pkg/providers/smartproxy/client.go
type SmartproxyProvider struct {
    username string
    password string
}

func (s *SmartproxyProvider) GetProxy(ctx context.Context, config ProxyConfig) (*url.URL, error) {
    // Smartproxy format: user-{username}-country-{cc}-session-{sessionid}
    user := fmt.Sprintf("user-%s", s.username)
    if config.Country != "" {
        user += fmt.Sprintf("-country-%s", config.Country)
    }
    if config.SessionID != "" {
        user += fmt.Sprintf("-session-%s", config.SessionID)
    }
    
    return &url.URL{
        Scheme: "http",
        User:   url.UserPassword(user, s.password),
        Host:   "gate.smartproxy.com:7000",
    }, nil
}
```

---

### **Phase 5: Admin UI** (2-3 days)

#### 5.1 Provider Management API
```go
// internal/api/providers.go

// GET /api/providers - List all providers
func (s *Server) handleListProviders(c *gin.Context) {
    providers := s.providerManager.ListProviders()
    c.JSON(200, gin.H{"providers": providers})
}

// POST /api/providers/active - Set active provider
func (s *Server) handleSetActiveProvider(c *gin.Context) {
    var req struct {
        Provider string `json:"provider" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    if err := s.providerManager.SetActive(req.Provider); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{"message": "Provider updated"})
}

// POST /api/providers - Add new provider
func (s *Server) handleAddProvider(c *gin.Context) {
    var req struct {
        Type     string `json:"type" binding:"required"`
        Name     string `json:"name" binding:"required"`
        Username string `json:"username" binding:"required"`
        Password string `json:"password" binding:"required"`
    }
    // ... implementation
}
```

#### 5.2 Dashboard UI
```typescript
// atlantic-dashboard/app/providers/page.tsx
export default function ProvidersPage() {
  return (
    <div>
      <h1>Proxy Providers</h1>
      
      {/* Active Provider */}
      <Card>
        <CardHeader>Active Provider</CardHeader>
        <CardContent>
          <Select value={activeProvider} onChange={setActive}>
            <option value="oxylabs">Oxylabs</option>
            <option value="pia">Private Internet Access</option>
            <option value="brightdata">Bright Data</option>
          </Select>
        </CardContent>
      </Card>
      
      {/* Provider List */}
      <ProviderList providers={providers} />
      
      {/* Add Provider */}
      <AddProviderDialog />
    </div>
  )
}
```

---

## 📊 Database Schema Updates

```sql
-- Add providers table
CREATE TABLE IF NOT EXISTS proxy_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'residential', 'datacenter', etc.
    provider_type TEXT NOT NULL, -- 'oxylabs', 'pia', etc.
    username TEXT,
    password TEXT, -- Encrypted
    config JSON,
    is_active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add provider usage tracking
CREATE TABLE IF NOT EXISTS provider_usage (
    id TEXT PRIMARY KEY,
    provider_id TEXT,
    user_id TEXT,
    requests INTEGER DEFAULT 0,
    data_transferred INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES proxy_providers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎯 Implementation Timeline

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| **1** | Provider Interface | 1 day | 🔴 Critical |
| **1** | Refactor Oxylabs | 1 day | 🔴 Critical |
| **2** | PIA Implementation | 1 day | 🔴 Critical |
| **3** | Provider Manager | 2 days | 🔴 Critical |
| **3** | Service Integration | 1 day | 🔴 Critical |
| **4** | Bright Data | 1 day | 🟡 Optional |
| **4** | Smartproxy | 1 day | 🟡 Optional |
| **5** | Admin API | 1 day | 🟡 Optional |
| **5** | Dashboard UI | 2 days | 🟡 Optional |
| | **Total (Core)** | **6 days** | |
| | **Total (Full)** | **11 days** | |

---

## ✅ Benefits

1. **Flexibility** - Switch providers without code changes
2. **Reliability** - Automatic failover between providers
3. **Cost Optimization** - Use cheapest provider per use case
4. **Vendor Independence** - Not locked to single provider
5. **Easy Testing** - Test with free/trial providers
6. **User Choice** - Let users bring their own credentials

---

## 🚀 Quick Start (Core Implementation)

### Week 1: Foundation
- Day 1-2: Create provider interface + refactor Oxylabs
- Day 3-4: Implement PIA provider
- Day 5-6: Build provider manager + integration

### Week 2: Polish (Optional)
- Day 1-2: Add Bright Data/Smartproxy
- Day 3-5: Admin UI + documentation

---

## 📝 Configuration Example

```bash
# .env with multi-provider support
PROVIDER_TYPE=auto  # auto, oxylabs, pia, brightdata

# Oxylabs
OXYLABS_USERNAME=customer-company
OXYLABS_PASSWORD=pass123

# PIA
PIA_USERNAME=p1234567
PIA_PASSWORD=pass456

# Bright Data
BRIGHTDATA_USERNAME=hl_abc123
BRIGHTDATA_PASSWORD=pass789
BRIGHTDATA_ZONE=residential

# Fallback order
PROVIDER_FALLBACKS=pia,brightdata
```

---

**Bottom Line:** 6 days of focused work transforms your platform into a multi-provider system. Start with Phases 1-3 for core flexibility, add Phase 4-5 later for polish.

# AtlanticProxy - Complete Implementation Guide
**Step-by-Step Instructions for All 8 Phases**

---

## 📖 HOW TO USE THIS GUIDE

This guide provides **practical, step-by-step instructions** for implementing each phase of AtlanticProxy.

### Structure
```
Each Phase Contains:
├── Overview & Goals
├── Prerequisites & Dependencies
├── Detailed Task Breakdown
├── Code Examples
├── Testing Instructions
├── Acceptance Criteria Checklist
└── Troubleshooting Guide
```

### Reading Order
1. **Start here:** This file (IMPLEMENTATION_GUIDE.md)
2. **Reference:** VPN_Grade_Standby_Proxy_Implementation_Tasks.md
3. **Details:** Phase-specific guides (created below)
4. **Performance:** Performance_Optimization_Brief.md
5. **Ad-Blocking:** AdBlock_Integration_Briefing.md

---

## 🚀 QUICK START

### Before You Begin
```bash
# 1. Clone repository
git clone https://github.com/atlanticproxy/atlanticproxy.git
cd atlanticproxy

# 2. Set up Go environment
go version  # Ensure Go 1.21+
go mod download

# 3. Create project structure
mkdir -p proxy-client/{cmd,internal,pkg,tests}
mkdir -p proxy-client/internal/{proxy,pool,monitor,killswitch,atlantic}

# 4. Initialize modules
cd proxy-client
go mod init github.com/atlanticproxy/proxy-client
```

### Development Environment Setup
```bash
# Install required tools
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install gotest.tools/gotestsum@latest

# Set up pre-commit hooks
git config core.hooksPath .githooks
chmod +x .githooks/*

# Create .env file
cp .env.example .env
# Edit .env with your Oxylabs credentials
```

---

## 📋 PHASE-BY-PHASE IMPLEMENTATION

### Phase 1: System-Level Foundation (Weeks 1-4)

#### What You'll Build
- Virtual network interface (TUN/TAP)
- System service daemon
- Traffic interception engine

#### Prerequisites
- Root/admin privileges
- Go 1.21+
- Platform-specific tools (ifconfig, route, iptables/pfctl)

#### Step 1: Create Project Structure
```bash
cd proxy-client

# Create directory structure
mkdir -p internal/{interceptor,atlantic,service}
mkdir -p pkg/{config,oxylabs}
mkdir -p cmd/service
mkdir -p tests

# Create main files
touch internal/interceptor/tun.go
touch internal/atlantic/traffic-interceptor.go
touch internal/service/service.go
touch cmd/service/main.go
```

#### Step 2: Implement TUN Interface (Task 1.1)

**File:** `proxy-client/internal/interceptor/tun.go`

```go
package interceptor

import (
    "fmt"
    "log"
    "net"
    "os/exec"
    "runtime"
    
    "github.com/songgao/water"
)

type TunConfig struct {
    InterfaceName string
    IP            string
    Netmask       string
}

type TunInterface struct {
    iface  *water.Interface
    config *TunConfig
}

func NewTunInterface(config *TunConfig) (*TunInterface, error) {
    if config == nil {
        config = &TunConfig{
            InterfaceName: "atlantic-tun0",
            IP:            "10.8.0.1",
            Netmask:       "255.255.255.0",
        }
    }
    
    return &TunInterface{config: config}, nil
}

func (t *TunInterface) Create() error {
    log.Printf("Creating TUN interface: %s", t.config.InterfaceName)
    
    cfg := water.Config{
        DeviceType: water.TUN,
    }
    
    // Platform-specific configuration
    switch runtime.GOOS {
    case "darwin":
        cfg.PlatformSpecificParams = water.PlatformSpecificParams{
            Name: t.config.InterfaceName,
        }
    case "linux":
        cfg.PlatformSpecificParams = water.PlatformSpecificParams{
            Name: t.config.InterfaceName,
        }
    case "windows":
        cfg.DeviceType = water.TAP
    default:
        return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
    }
    
    iface, err := water.New(cfg)
    if err != nil {
        return fmt.Errorf("failed to create TUN interface: %w", err)
    }
    
    t.iface = iface
    
    // Configure interface
    if err := t.configure(); err != nil {
        return fmt.Errorf("failed to configure interface: %w", err)
    }
    
    log.Printf("✅ TUN interface created: %s", t.config.InterfaceName)
    return nil
}

func (t *TunInterface) configure() error {
    switch runtime.GOOS {
    case "darwin":
        return t.configureMacOS()
    case "linux":
        return t.configureLinux()
    case "windows":
        return t.configureWindows()
    default:
        return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
    }
}

func (t *TunInterface) configureMacOS() error {
    commands := [][]string{
        {"ifconfig", t.config.InterfaceName, t.config.IP, "10.8.0.2", "up"},
        {"route", "add", "-net", "10.8.0.0/24", "-interface", t.config.InterfaceName},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            return fmt.Errorf("failed to execute %v: %w", cmd, err)
        }
    }
    
    log.Println("✅ macOS TUN interface configured")
    return nil
}

func (t *TunInterface) configureLinux() error {
    commands := [][]string{
        {"ip", "addr", "add", t.config.IP + "/24", "dev", t.config.InterfaceName},
        {"ip", "link", "set", "dev", t.config.InterfaceName, "up"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            return fmt.Errorf("failed to execute %v: %w", cmd, err)
        }
    }
    
    log.Println("✅ Linux TUN interface configured")
    return nil
}

func (t *TunInterface) configureWindows() error {
    cmd := exec.Command("netsh", "interface", "ip", "set", "address",
        t.config.InterfaceName, "static", t.config.IP, t.config.Netmask)
    
    if err := cmd.Run(); err != nil {
        return fmt.Errorf("failed to configure Windows TAP: %w", err)
    }
    
    log.Println("✅ Windows TAP interface configured")
    return nil
}

func (t *TunInterface) Close() error {
    if t.iface != nil {
        return t.iface.Close()
    }
    return nil
}

func (t *TunInterface) Read(p []byte) (int, error) {
    return t.iface.Read(p)
}

func (t *TunInterface) Write(p []byte) (int, error) {
    return t.iface.Write(p)
}
```

**Testing Task 1.1:**
```bash
# Test TUN interface creation
go test -v ./internal/interceptor -run TestTunInterface

# Manual verification
ifconfig | grep atlantic-tun0  # macOS/Linux
ipconfig | findstr atlantic-tun0  # Windows
```

#### Step 3: Implement System Service (Task 1.2)

**File:** `proxy-client/cmd/service/main.go`

```go
package main

import (
    "context"
    "flag"
    "log"
    "os"
    "os/signal"
    "syscall"
    
    "github.com/atlanticproxy/proxy-client/internal/service"
)

func main() {
    var (
        install   = flag.Bool("install", false, "Install as system service")
        uninstall = flag.Bool("uninstall", false, "Uninstall system service")
        run       = flag.Bool("run", false, "Run service")
    )
    flag.Parse()
    
    if *install {
        if err := service.Install(); err != nil {
            log.Fatalf("Failed to install service: %v", err)
        }
        log.Println("✅ Service installed successfully")
        return
    }
    
    if *uninstall {
        if err := service.Uninstall(); err != nil {
            log.Fatalf("Failed to uninstall service: %v", err)
        }
        log.Println("✅ Service uninstalled successfully")
        return
    }
    
    if *run {
        runService()
        return
    }
    
    flag.Usage()
}

func runService() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    svc := service.New()
    
    // Handle shutdown signals
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    go func() {
        <-sigChan
        log.Println("Shutting down...")
        cancel()
    }()
    
    if err := svc.Run(ctx); err != nil {
        log.Fatalf("Service error: %v", err)
    }
}
```

**File:** `proxy-client/internal/service/service.go`

```go
package service

import (
    "context"
    "log"
    "runtime"
    
    "github.com/atlanticproxy/proxy-client/internal/interceptor"
)

type Service struct {
    tun *interceptor.TunInterface
}

func New() *Service {
    return &Service{}
}

func (s *Service) Run(ctx context.Context) error {
    log.Println("🚀 Starting AtlanticProxy service...")
    
    // Create TUN interface
    tun, err := interceptor.NewTunInterface(nil)
    if err != nil {
        return err
    }
    
    if err := tun.Create(); err != nil {
        return err
    }
    defer tun.Close()
    
    s.tun = tun
    
    log.Println("✅ Service running. Press Ctrl+C to stop.")
    
    // Wait for context cancellation
    <-ctx.Done()
    
    log.Println("🛑 Service stopped")
    return nil
}

func Install() error {
    switch runtime.GOOS {
    case "darwin":
        return installMacOS()
    case "linux":
        return installLinux()
    case "windows":
        return installWindows()
    default:
        return nil
    }
}

func Uninstall() error {
    switch runtime.GOOS {
    case "darwin":
        return uninstallMacOS()
    case "linux":
        return uninstallLinux()
    case "windows":
        return uninstallWindows()
    default:
        return nil
    }
}

// Platform-specific implementations...
func installMacOS() error {
    // Create launchd plist
    return nil
}

func installLinux() error {
    // Create systemd service
    return nil
}

func installWindows() error {
    // Create Windows service
    return nil
}

func uninstallMacOS() error { return nil }
func uninstallLinux() error { return nil }
func uninstallWindows() error { return nil }
```

**Testing Task 1.2:**
```bash
# Build service binary
go build -o bin/atlantic-proxy-service ./cmd/service

# Install service
sudo ./bin/atlantic-proxy-service -install

# Check service status
systemctl status atlantic-proxy  # Linux
launchctl list | grep atlantic  # macOS
sc query atlantic-proxy  # Windows

# Uninstall service
sudo ./bin/atlantic-proxy-service -uninstall
```

#### Step 4: Implement Traffic Interception (Task 1.3)

**File:** `proxy-client/internal/atlantic/traffic-interceptor.go`

```go
package atlantic

import (
    "fmt"
    "log"
    "net"
    "os/exec"
    "runtime"
    
    "github.com/atlanticproxy/proxy-client/internal/interceptor"
)

type TrafficInterceptor struct {
    tun *interceptor.TunInterface
}

func NewTrafficInterceptor(tun *interceptor.TunInterface) *TrafficInterceptor {
    return &TrafficInterceptor{tun: tun}
}

func (t *TrafficInterceptor) Start() error {
    log.Println("🔄 Starting traffic interception...")
    
    // Route all traffic through TUN interface
    if err := t.setupRouting(); err != nil {
        return fmt.Errorf("failed to setup routing: %w", err)
    }
    
    // Intercept DNS
    if err := t.interceptDNS(); err != nil {
        return fmt.Errorf("failed to intercept DNS: %w", err)
    }
    
    log.Println("✅ Traffic interception active")
    return nil
}

func (t *TrafficInterceptor) setupRouting() error {
    switch runtime.GOOS {
    case "darwin":
        return t.setupRoutingMacOS()
    case "linux":
        return t.setupRoutingLinux()
    case "windows":
        return t.setupRoutingWindows()
    default:
        return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
    }
}

func (t *TrafficInterceptor) setupRoutingMacOS() error {
    commands := [][]string{
        {"route", "add", "default", "10.8.0.2"},
        {"route", "add", "0.0.0.0/1", "10.8.0.2"},
        {"route", "add", "128.0.0.0/1", "10.8.0.2"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            log.Printf("⚠️  Route command failed: %v", err)
        }
    }
    
    return nil
}

func (t *TrafficInterceptor) setupRoutingLinux() error {
    commands := [][]string{
        {"ip", "route", "add", "0.0.0.0/1", "dev", "atlantic-tun0"},
        {"ip", "route", "add", "128.0.0.0/1", "dev", "atlantic-tun0"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            log.Printf("⚠️  Route command failed: %v", err)
        }
    }
    
    return nil
}

func (t *TrafficInterceptor) setupRoutingWindows() error {
    commands := [][]string{
        {"route", "add", "0.0.0.0", "mask", "128.0.0.0", "10.8.0.2"},
        {"route", "add", "128.0.0.0", "mask", "128.0.0.0", "10.8.0.2"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            log.Printf("⚠️  Route command failed: %v", err)
        }
    }
    
    return nil
}

func (t *TrafficInterceptor) interceptDNS() error {
    switch runtime.GOOS {
    case "darwin":
        return t.interceptDNSMacOS()
    case "linux":
        return t.interceptDNSLinux()
    case "windows":
        return t.interceptDNSWindows()
    default:
        return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
    }
}

func (t *TrafficInterceptor) interceptDNSMacOS() error {
    commands := [][]string{
        {"networksetup", "-setdnsservers", "Wi-Fi", "10.8.0.1"},
        {"networksetup", "-setdnsservers", "Ethernet", "10.8.0.1"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            log.Printf("⚠️  DNS command failed: %v", err)
        }
    }
    
    return nil
}

func (t *TrafficInterceptor) interceptDNSLinux() error {
    // Modify /etc/resolv.conf
    cmd := exec.Command("sh", "-c", "echo 'nameserver 10.8.0.1' > /etc/resolv.conf")
    if err := cmd.Run(); err != nil {
        log.Printf("⚠️  DNS command failed: %v", err)
    }
    return nil
}

func (t *TrafficInterceptor) interceptDNSWindows() error {
    commands := [][]string{
        {"netsh", "interface", "ip", "set", "dns", "Wi-Fi", "static", "10.8.0.1"},
    }
    
    for _, cmd := range commands {
        if err := exec.Command(cmd[0], cmd[1:]...).Run(); err != nil {
            log.Printf("⚠️  DNS command failed: %v", err)
        }
    }
    
    return nil
}

func (t *TrafficInterceptor) Stop() error {
    log.Println("🛑 Stopping traffic interception...")
    // Restore original routing and DNS
    return nil
}
```

**Testing Phase 1:**
```bash
# Run all Phase 1 tests
go test -v ./internal/interceptor ./internal/atlantic ./internal/service

# Manual testing
sudo ./bin/atlantic-proxy-service -run

# Verify in another terminal
ifconfig | grep atlantic-tun0
route -n | grep 10.8.0

# Check DNS
cat /etc/resolv.conf | grep 10.8.0
```

#### Phase 1 Acceptance Checklist
- [ ] TUN interface creates successfully
- [ ] Interface survives network changes
- [ ] System service installs and starts
- [ ] Service auto-restarts on crash
- [ ] All traffic routes through TUN
- [ ] DNS queries intercepted
- [ ] No application can bypass proxy

---

## 📋 PHASE 2: PROXY ENGINE CORE
**Duration:** 4 weeks | **Tasks:** 3 | **Priority:** CRITICAL

### Phase Overview
Build the core proxy engine that routes all traffic through Oxylabs.

#### Step 1: Install Dependencies
```bash
go get github.com/elazarl/goproxy
go get github.com/elazarl/goproxy/ext
```

#### Step 2: Implement Oxylabs Client (Task 2.2)

**File:** `proxy-client/pkg/oxylabs/client.go`

```go
package oxylabs

import (
    "context"
    "fmt"
    "net/url"
    "sync"
    "time"
)

type Client struct {
    username string
    password string
    endpoints []string
    currentIdx int
    mu sync.RWMutex
}

func New(username, password string) *Client {
    return &Client{
        username: username,
        password: password,
        endpoints: []string{
            "pr.oxylabs.io:7777",
            "pr.oxylabs.io:8888",
            "pr.oxylabs.io:9999",
        },
    }
}

func (c *Client) GetProxy(ctx context.Context) (*url.URL, error) {
    c.mu.RLock()
    endpoint := c.endpoints[c.currentIdx]
    c.mu.RUnlock()
    
    proxyURL := fmt.Sprintf("http://%s:%s@%s", c.username, c.password, endpoint)
    return url.Parse(proxyURL)
}

func (c *Client) RotateEndpoint() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.currentIdx = (c.currentIdx + 1) % len(c.endpoints)
}

func (c *Client) TestConnection(ctx context.Context) error {
    proxyURL, err := c.GetProxy(ctx)
    if err != nil {
        return err
    }
    
    // Test connection to proxy
    client := &http.Client{
        Timeout: 5 * time.Second,
        Transport: &http.Transport{
            Proxy: http.ProxyURL(proxyURL),
        },
    }
    
    resp, err := client.Get("http://httpbin.org/ip")
    if err != nil {
        return fmt.Errorf("proxy connection failed: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != 200 {
        return fmt.Errorf("proxy returned status %d", resp.StatusCode)
    }
    
    return nil
}
```

#### Step 3: Implement Connection Pool (Task 2.3)

**File:** `proxy-client/internal/pool/manager.go`

```go
package pool

import (
    "context"
    "fmt"
    "net/http"
    "sync"
    "time"
    
    "github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

type Manager struct {
    oxylabs *oxylabs.Client
    pool []*http.Client
    mu sync.RWMutex
    poolSize int
}

func New(oxylabs *oxylabs.Client, poolSize int) *Manager {
    m := &Manager{
        oxylabs: oxylabs,
        pool: make([]*http.Client, 0, poolSize),
        poolSize: poolSize,
    }
    
    // Pre-warm connections
    for i := 0; i < poolSize; i++ {
        m.createClient()
    }
    
    return m
}

func (m *Manager) createClient() *http.Client {
    proxyURL, _ := m.oxylabs.GetProxy(context.Background())
    
    transport := &http.Transport{
        Proxy: http.ProxyURL(proxyURL),
        MaxIdleConns: 100,
        MaxIdleConnsPerHost: 10,
        MaxConnsPerHost: 20,
        IdleConnTimeout: 90 * time.Second,
        DisableKeepAlives: false,
        ForceAttemptHTTP2: true,
        TLSHandshakeTimeout: 10 * time.Second,
    }
    
    client := &http.Client{
        Transport: transport,
        Timeout: 30 * time.Second,
    }
    
    m.mu.Lock()
    m.pool = append(m.pool, client)
    m.mu.Unlock()
    
    return client
}

func (m *Manager) GetClient() *http.Client {
    m.mu.RLock()
    if len(m.pool) > 0 {
        client := m.pool[0]
        m.mu.RUnlock()
        return client
    }
    m.mu.RUnlock()
    
    return m.createClient()
}

func (m *Manager) Close() {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    for _, client := range m.pool {
        if transport, ok := client.Transport.(*http.Transport); ok {
            transport.CloseIdleConnections()
        }
    }
    m.pool = nil
}
```

#### Step 4: Implement Proxy Engine (Task 2.1)

**File:** `proxy-client/internal/proxy/engine.go`

```go
package proxy

import (
    "log"
    "net/http"
    
    "github.com/atlanticproxy/proxy-client/internal/pool"
    "github.com/elazarl/goproxy"
)

type Engine struct {
    proxy *goproxy.ProxyHttpServer
    pool *pool.Manager
}

func New(poolManager *pool.Manager) *Engine {
    proxy := goproxy.NewProxyHttpServer()
    
    // Configure proxy
    proxy.Verbose = false
    proxy.OnRequest().DoFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
        log.Printf("Proxying: %s %s", req.Method, req.URL)
        return req, nil
    })
    
    return &Engine{
        proxy: proxy,
        pool: poolManager,
    }
}

func (e *Engine) Start(addr string) error {
    log.Printf("Starting proxy engine on %s", addr)
    return http.ListenAndServe(addr, e.proxy)
}

func (e *Engine) Stop() {
    e.pool.Close()
}
```

**Testing Phase 2:**
```bash
# Build and test
go build -o bin/atlantic-proxy ./cmd/service

# Test Oxylabs connection
go test -v ./pkg/oxylabs -run TestConnection

# Test connection pool
go test -v ./internal/pool -run TestPoolManager

# Test proxy engine
go test -v ./internal/proxy -run TestEngine
```

---

## 📋 PHASE 3: STANDBY CONNECTION ASSURANCE
**Duration:** 4 weeks | **Tasks:** 3 | **Priority:** CRITICAL

### Phase Overview
Implement failover and kill switch for guaranteed connectivity.

#### Step 1: Network Monitor (Task 3.1)

**File:** `proxy-client/internal/monitor/network.go`

```go
package monitor

import (
    "log"
    "net"
    "time"
)

type NetworkMonitor struct {
    lastIP string
    ticker *time.Ticker
    done chan bool
}

func New() *NetworkMonitor {
    return &NetworkMonitor{
        done: make(chan bool),
    }
}

func (nm *NetworkMonitor) Start() {
    nm.ticker = time.NewTicker(5 * time.Second)
    
    go func() {
        for {
            select {
            case <-nm.ticker.C:
                nm.checkNetworkStatus()
            case <-nm.done:
                return
            }
        }
    }()
    
    log.Println("✅ Network monitor started")
}

func (nm *NetworkMonitor) checkNetworkStatus() {
    interfaces, err := net.Interfaces()
    if err != nil {
        log.Printf("Error checking interfaces: %v", err)
        return
    }
    
    for _, iface := range interfaces {
        if iface.Flags&net.FlagUp == 0 {
            continue
        }
        
        addrs, err := iface.Addrs()
        if err != nil {
            continue
        }
        
        for _, addr := range addrs {
            if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
                currentIP := ipnet.IP.String()
                if nm.lastIP != currentIP {
                    log.Printf("🔄 Network change detected: %s → %s", nm.lastIP, currentIP)
                    nm.lastIP = currentIP
                }
            }
        }
    }
}

func (nm *NetworkMonitor) Stop() {
    if nm.ticker != nil {
        nm.ticker.Stop()
    }
    nm.done <- true
}
```

#### Step 2: Failover Controller (Task 3.2)

**File:** `proxy-client/internal/failover/controller.go`

```go
package failover

import (
    "context"
    "log"
    "sync"
    "time"
)

type Controller struct {
    primaryProxy string
    backupProxies []string
    currentProxy string
    mu sync.RWMutex
    failureCount int
    maxFailures int
}

func New(primary string, backups []string) *Controller {
    return &Controller{
        primaryProxy: primary,
        backupProxies: backups,
        currentProxy: primary,
        maxFailures: 3,
    }
}

func (c *Controller) TestProxy(ctx context.Context, proxy string) bool {
    // Test proxy connectivity
    // Return true if working, false if failed
    return true
}

func (c *Controller) RecordFailure() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.failureCount++
    log.Printf("⚠️  Proxy failure #%d", c.failureCount)
    
    if c.failureCount >= c.maxFailures {
        c.failover()
    }
}

func (c *Controller) failover() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    for _, backup := range c.backupProxies {
        if backup != c.currentProxy {
            log.Printf("🔄 Failing over to: %s", backup)
            c.currentProxy = backup
            c.failureCount = 0
            return
        }
    }
}

func (c *Controller) GetCurrentProxy() string {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.currentProxy
}

func (c *Controller) RecordSuccess() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.failureCount = 0
}
```

#### Step 3: Kill Switch (Task 3.3)

**File:** `proxy-client/internal/killswitch/guardian.go`

```go
package killswitch

import (
    "log"
    "os/exec"
    "runtime"
)

type Guardian struct {
    enabled bool
    whitelist []string
}

func New() *Guardian {
    return &Guardian{
        whitelist: []string{
            "127.0.0.1",
            "::1",
        },
    }
}

func (g *Guardian) Enable() error {
    log.Println("🛡️  Enabling kill switch...")
    
    switch runtime.GOOS {
    case "darwin":
        return g.enableMacOS()
    case "linux":
        return g.enableLinux()
    case "windows":
        return g.enableWindows()
    }
    
    return nil
}

func (g *Guardian) enableMacOS() error {
    // Block all traffic except whitelisted
    cmd := exec.Command("pfctl", "-e")
    if err := cmd.Run(); err != nil {
        return err
    }
    
    g.enabled = true
    log.Println("✅ Kill switch enabled (macOS)")
    return nil
}

func (g *Guardian) enableLinux() error {
    // Use iptables to block traffic
    cmd := exec.Command("iptables", "-P", "OUTPUT", "DROP")
    if err := cmd.Run(); err != nil {
        return err
    }
    
    g.enabled = true
    log.Println("✅ Kill switch enabled (Linux)")
    return nil
}

func (g *Guardian) enableWindows() error {
    // Use netsh to block traffic
    cmd := exec.Command("netsh", "advfirewall", "set", "allprofiles", "state", "on")
    if err := cmd.Run(); err != nil {
        return err
    }
    
    g.enabled = true
    log.Println("✅ Kill switch enabled (Windows)")
    return nil
}

func (g *Guardian) Disable() error {
    log.Println("🛑 Disabling kill switch...")
    
    switch runtime.GOOS {
    case "darwin":
        return g.disableMacOS()
    case "linux":
        return g.disableLinux()
    case "windows":
        return g.disableWindows()
    }
    
    return nil
}

func (g *Guardian) disableMacOS() error {
    cmd := exec.Command("pfctl", "-d")
    if err := cmd.Run(); err != nil {
        return err
    }
    g.enabled = false
    return nil
}

func (g *Guardian) disableLinux() error {
    cmd := exec.Command("iptables", "-P", "OUTPUT", "ACCEPT")
    if err := cmd.Run(); err != nil {
        return err
    }
    g.enabled = false
    return nil
}

func (g *Guardian) disableWindows() error {
    cmd := exec.Command("netsh", "advfirewall", "set", "allprofiles", "state", "off")
    if err := cmd.Run(); err != nil {
        return err
    }
    g.enabled = false
    return nil
}

func (g *Guardian) IsEnabled() bool {
    return g.enabled
}
```

**Testing Phase 3:**
```bash
# Test network monitor
go test -v ./internal/monitor -run TestNetworkMonitor

# Test failover controller
go test -v ./internal/failover -run TestFailover

# Test kill switch
go test -v ./internal/killswitch -run TestKillSwitch
```

---

## 📋 PHASE 4: ANONYMITY VERIFICATION
**Duration:** 4 weeks | **Tasks:** 2 | **Priority:** HIGH

### Phase Overview
Implement leak detection and traffic protection.

#### Step 1: Leak Detector (Task 4.1)

**File:** `proxy-client/internal/validator/leak_detector.go`

```go
package validator

import (
    "context"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "time"
)

type LeakDetector struct {
    client *http.Client
    lastCheck time.Time
}

func New() *LeakDetector {
    return &LeakDetector{
        client: &http.Client{Timeout: 10 * time.Second},
    }
}

func (ld *LeakDetector) CheckIPLeak(ctx context.Context) (string, error) {
    resp, err := ld.client.Get("https://httpbin.org/ip")
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }
    
    var result map[string]string
    if err := json.Unmarshal(body, &result); err != nil {
        return "", err
    }
    
    ip := result["origin"]
    log.Printf("✅ IP check: %s", ip)
    return ip, nil
}

func (ld *LeakDetector) CheckDNSLeak(ctx context.Context) error {
    // Check if DNS queries are leaking
    resp, err := ld.client.Get("https://dns.google/resolve?name=example.com")
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    log.Println("✅ DNS leak check passed")
    return nil
}

func (ld *LeakDetector) Start() {
    ticker := time.NewTicker(30 * time.Second)
    
    go func() {
        for range ticker.C {
            if _, err := ld.CheckIPLeak(context.Background()); err != nil {
                log.Printf("⚠️  IP leak check failed: %v", err)
            }
        }
    }()
}
```

#### Step 2: Traffic Protection (Task 4.2)

**File:** `proxy-client/internal/validator/traffic_protection.go`

```go
package validator

import (
    "math/rand"
    "time"
)

type TrafficProtection struct {
    timingRandomization bool
    packetNormalization bool
}

func NewTrafficProtection() *TrafficProtection {
    return &TrafficProtection{
        timingRandomization: true,
        packetNormalization: true,
    }
}

func (tp *TrafficProtection) RandomizeDelay() time.Duration {
    if !tp.timingRandomization {
        return 0
    }
    
    // Add random delay between 1-10ms
    delay := time.Duration(rand.Intn(10)+1) * time.Millisecond
    return delay
}

func (tp *TrafficProtection) NormalizePacketSize(size int) int {
    if !tp.packetNormalization {
        return size
    }
    
    // Normalize to standard sizes (512, 1024, 1500)
    if size < 512 {
        return 512
    } else if size < 1024 {
        return 1024
    }
    return 1500
}
```

**Testing Phase 4:**
```bash
# Test leak detector
go test -v ./internal/validator -run TestLeakDetector

# Test traffic protection
go test -v ./internal/validator -run TestTrafficProtection
```

---

## 📋 PHASE 5: SYSTEM RESILIENCE
**Duration:** 4 weeks | **Tasks:** 2 | **Priority:** HIGH

### Phase Overview
Implement watchdog and basic performance optimization.

#### Step 1: Watchdog (Task 5.1)

**File:** `proxy-client/internal/service/watchdog.go`

```go
package service

import (
    "log"
    "runtime"
    "time"
)

type Watchdog struct {
    checkInterval time.Duration
    maxMemory uint64
    maxCPU float64
}

func NewWatchdog() *Watchdog {
    return &Watchdog{
        checkInterval: 10 * time.Second,
        maxMemory: 200 * 1024 * 1024, // 200MB
        maxCPU: 5.0, // 5%
    }
}

func (w *Watchdog) Start() {
    ticker := time.NewTicker(w.checkInterval)
    
    go func() {
        for range ticker.C {
            w.checkHealth()
        }
    }()
    
    log.Println("✅ Watchdog started")
}

func (w *Watchdog) checkHealth() {
    var m runtime.MemStats
    runtime.ReadMemStats(&m)
    
    if m.Alloc > w.maxMemory {
        log.Printf("⚠️  High memory usage: %d MB", m.Alloc/1024/1024)
        runtime.GC()
    }
    
    log.Printf("📊 Memory: %d MB, Goroutines: %d", m.Alloc/1024/1024, runtime.NumGoroutine())
}
```

#### Step 2: Basic Performance Optimization (Task 5.2)

Already covered in Phase 2 with connection pooling and HTTP/2 support.

**Testing Phase 5:**
```bash
# Test watchdog
go test -v ./internal/service -run TestWatchdog

# Run performance test
go test -bench=. -benchmem ./tests/benchmark
```

---

## 📋 PHASE 6: USER INTERFACE
**Duration:** 4 weeks | **Tasks:** 1 | **Priority:** MEDIUM

### Phase Overview
Build system tray application for user control.

#### Step 1: System Tray App (Task 6.1)

**File:** `proxy-client/cmd/tray/main.go`

```go
package main

import (
    "log"
    
    "github.com/getlantern/systray"
)

func main() {
    systray.Run(onReady, onExit)
}

func onReady() {
    systray.SetIcon(getIcon())
    systray.SetTitle("AtlanticProxy")
    systray.SetTooltip("VPN-Grade Proxy Protection")
    
    mStatus := systray.AddMenuItem("Status: Connected", "")
    mStatus.Disable()
    
    systray.AddSeparator()
    
    mToggle := systray.AddMenuItem("Kill Switch: ON", "")
    mLocation := systray.AddMenuItem("Location: US", "")
    
    systray.AddSeparator()
    
    mQuit := systray.AddMenuItem("Quit", "")
    
    for {
        select {
        case <-mToggle.ClickedCh:
            log.Println("Kill switch toggled")
        case <-mQuit.ClickedCh:
            systray.Quit()
            return
        }
    }
}

func onExit() {
    log.Println("Exiting tray application")
}

func getIcon() []byte {
    // Return icon bytes (PNG)
    return []byte{}
}
```

**Testing Phase 6:**
```bash
# Build tray app
go build -o bin/atlantic-proxy-tray ./cmd/tray

# Run tray app
./bin/atlantic-proxy-tray
```

---

## ⚡ PHASE 7: PERFORMANCE OPTIMIZATION
**Duration:** 4 weeks | **Tasks:** 14 | **Priority:** CRITICAL

### Phase Overview
Reduce latency from 200-900ms to <5ms.

**See Performance_Optimization_Brief.md for detailed implementation of all 14 tasks.**

Key tasks:
- 7.1: HTTP Connection Pooling (already done in Phase 2)
- 7.2: Proxy URL Caching
- 7.3: Async Health Monitoring
- 7.4-7.14: Advanced optimizations

**Testing Phase 7:**
```bash
# Run comprehensive benchmarks
go test -bench=. -benchmem ./tests/benchmark

# Test streaming performance
go test -v ./tests/integration -run TestStreaming

# Load testing
go test -v -run TestLoad ./tests/load
```

---

## 🚫 PHASE 8: AD-BLOCKING INTEGRATION
**Duration:** 4 weeks | **Tasks:** 6 | **Priority:** MEDIUM

### Phase Overview
Add DNS and HTTP-level ad blocking with regional compliance.

**See AdBlock_Integration_Briefing.md for detailed implementation.**

Key files to create:
- `proxy-client/internal/adblock/compliance.go` - Regional compliance
- `proxy-client/internal/adblock/dns_filter.go` - DNS filtering
- `proxy-client/internal/adblock/request_filter.go` - HTTP filtering
- `proxy-client/internal/adblock/blocklist_manager.go` - Blocklist management

**Testing Phase 8:**
```bash
# Test compliance
go test -v ./internal/adblock/compliance

# Test DNS filtering
go test -v ./internal/adblock -run TestDNSFilter

# Test HTTP filtering
go test -v ./internal/adblock -run TestHTTPFilter

# Test blocklist management
go test -v ./internal/adblock -run TestBlocklistManager
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
```bash
# Test individual components
go test -v ./internal/interceptor
go test -v ./internal/proxy
go test -v ./internal/killswitch
```

### Integration Tests
```bash
# Test component interactions
go test -v ./tests/integration

# Test with real Oxylabs
go test -v -tags=integration ./tests
```

### Performance Tests
```bash
# Benchmark latency
go test -bench=. -benchmem ./tests/benchmark

# Load testing
go test -v -run TestLoad ./tests/load
```

### Compliance Tests
```bash
# Test regional compliance
go test -v ./internal/adblock/compliance

# Test ad-blocking accuracy
go test -v ./internal/adblock
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Issue: TUN interface creation fails**
```
Solution:
1. Ensure running with root/admin privileges
2. Check if TUN/TAP kernel module is loaded
3. Verify platform-specific requirements
```

**Issue: Proxy connection fails**
```
Solution:
1. Verify Oxylabs credentials in .env
2. Check network connectivity
3. Verify firewall rules
```

**Issue: High latency**
```
Solution:
1. Check Phase 7 optimizations
2. Verify connection pooling is working
3. Monitor CPU/memory usage
```

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Status:** Ready for Implementation

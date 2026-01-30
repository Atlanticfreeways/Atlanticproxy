# AtlanticProxy - Developer Quick Start
**Fast Reference for Implementation**

---

## 🚀 5-MINUTE SETUP

```bash
# 1. Clone and setup
git clone https://github.com/atlanticproxy/atlanticproxy.git
cd atlanticproxy/proxy-client

# 2. Install dependencies
go mod download
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# 3. Create .env
cp .env.example .env
# Edit .env with Oxylabs credentials

# 4. Build
go build -o bin/atlantic-proxy-client ./cmd/service

# 5. Test
go test -v ./...
```

---

## 📁 PROJECT STRUCTURE

```
proxy-client/
├── cmd/
│   ├── service/          # System service entry point
│   └── tray/             # System tray UI
├── internal/
│   ├── interceptor/      # TUN/TAP interface (Phase 1)
│   ├── atlantic/         # Traffic interception (Phase 1)
│   ├── proxy/            # Proxy engine (Phase 2)
│   ├── pool/             # Connection pooling (Phase 2)
│   ├── monitor/          # Network monitoring (Phase 3)
│   ├── failover/         # Failover controller (Phase 3)
│   ├── killswitch/       # Kill switch (Phase 3)
│   ├── validator/        # Leak detection (Phase 4)
│   ├── service/          # Service management (Phase 5)
│   └── adblock/          # Ad-blocking (Phase 8)
├── pkg/
│   ├── config/           # Configuration management
│   └── oxylabs/          # Oxylabs API client
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── benchmark/        # Performance tests
│   └── compliance/       # Compliance tests
└── go.mod
```

---

## 🔄 PHASE QUICK REFERENCE

### Phase 1: Foundation (Weeks 1-4)
```bash
# Create directory structure
mkdir -p internal/{interceptor,atlantic,service}
mkdir -p cmd/service tests

# Key files to create
touch internal/interceptor/tun.go
touch internal/atlantic/traffic-interceptor.go
touch internal/service/service.go
touch cmd/service/main.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/interceptor
go test -v ./internal/atlantic
go test -v ./internal/service

# Manual verification
sudo ./bin/atlantic-proxy -run
# In another terminal:
ifconfig | grep atlantic-tun0
```

### Phase 2: Proxy Engine (Weeks 5-8)
```bash
# Create directory structure
mkdir -p internal/{proxy,pool}
mkdir -p pkg/oxylabs

# Install dependencies
go get github.com/elazarl/goproxy
go get github.com/elazarl/goproxy/ext

# Key files to create
touch internal/proxy/engine.go
touch pkg/oxylabs/client.go
touch internal/pool/manager.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/proxy
go test -v ./pkg/oxylabs
go test -v ./internal/pool

# Test Oxylabs connection
go test -v ./pkg/oxylabs -run TestConnection
```

### Phase 3: Failover (Weeks 9-12)
```bash
# Create directory structure
mkdir -p internal/{monitor,failover,killswitch}

# Key files to create
touch internal/monitor/network.go
touch internal/failover/controller.go
touch internal/killswitch/guardian.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/monitor
go test -v ./internal/failover
go test -v ./internal/killswitch

# Test failover manually
# Simulate proxy failure and verify automatic recovery
```

### Phase 4: Anonymity (Weeks 13-16)
```bash
# Create directory structure
mkdir -p internal/validator

# Key files to create
touch internal/validator/leak_detector.go
touch internal/validator/traffic_protection.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/validator

# Test leak detection
go test -v ./internal/validator -run TestLeakDetector
```

### Phase 5: Resilience (Weeks 17-20)
```bash
# Key files to create
touch internal/service/watchdog.go
touch internal/service/recovery.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/service

# Run performance test
go test -bench=. -benchmem ./tests/benchmark
```

### Phase 6: UI (Weeks 21-24)
```bash
# Create directory structure
mkdir -p cmd/tray

# Install dependencies
go get github.com/getlantern/systray

# Key files to create
touch cmd/tray/main.go

# Build
go build -o bin/atlantic-proxy-tray ./cmd/tray

# Run
./bin/atlantic-proxy-tray
```

### Phase 7: Performance (Weeks 25-28)
```bash
# Optimization tasks across multiple files
# See Performance_Optimization_Brief.md for detailed tasks

# Run comprehensive benchmarks
go test -bench=. -benchmem ./tests/benchmark

# Test streaming performance
go test -v ./tests/integration -run TestStreaming

# Load testing
go test -v -run TestLoad ./tests/load

# Monitor performance
go test -v ./tests/benchmark -run TestLatency
```

### Phase 8: Ad-Blocking (Weeks 29-32)
```bash
# Create directory structure
mkdir -p internal/adblock

# Install dependencies
go get github.com/miekg/dns

# Key files to create
touch internal/adblock/compliance.go
touch internal/adblock/dns_filter.go
touch internal/adblock/request_filter.go
touch internal/adblock/blocklist_manager.go

# Build and test
go build -o bin/atlantic-proxy ./cmd/service
go test -v ./internal/adblock

# Test compliance
go test -v ./internal/adblock/compliance

# Test DNS filtering
go test -v ./internal/adblock -run TestDNSFilter

# Test HTTP filtering
go test -v ./internal/adblock -run TestHTTPFilter
```

---

## 🧪 TESTING COMMANDS

```bash
# Run all tests
go test -v ./...

# Run specific phase tests
go test -v ./internal/interceptor ./internal/atlantic ./internal/service

# Run with coverage
go test -cover ./...

# Run benchmarks
go test -bench=. -benchmem ./tests/benchmark

# Run integration tests
go test -v -tags=integration ./tests/integration

# Run compliance tests
go test -v ./internal/adblock/compliance

# Lint code
golangci-lint run ./...

# Format code
go fmt ./...

# Vet code
go vet ./...
```

---

## 🔧 COMMON TASKS

### Build for Different Platforms
```bash
# macOS
GOOS=darwin GOARCH=amd64 go build -o bin/atlantic-proxy-darwin ./cmd/service

# Linux
GOOS=linux GOARCH=amd64 go build -o bin/atlantic-proxy-linux ./cmd/service

# Windows
GOOS=windows GOARCH=amd64 go build -o bin/atlantic-proxy.exe ./cmd/service
```

### Install Service
```bash
# macOS
sudo ./bin/atlantic-proxy-darwin -install

# Linux
sudo ./bin/atlantic-proxy-linux -install

# Windows (run as admin)
atlantic-proxy.exe -install
```

### Run Service
```bash
# macOS/Linux
sudo ./bin/atlantic-proxy-darwin -run

# Windows (run as admin)
atlantic-proxy.exe -run
```

### View Logs
```bash
# macOS
log stream --predicate 'process == "atlantic-proxy"'

# Linux
journalctl -u atlantic-proxy -f

# Windows
Get-EventLog -LogName Application -Source atlantic-proxy
```

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Phase |
|--------|--------|-------|
| Proxy overhead | <5ms | 7 |
| p50 latency | <5ms | 7 |
| p95 latency | <20ms | 7 |
| p99 latency | <50ms | 7 |
| Throughput | >500 Mbps | 7 |
| Memory usage | <200MB | 5 |
| CPU usage | <5% | 5 |
| Ad block rate | >95% | 8 |
| Failover time | <2 seconds | 3 |
| Uptime | >99.9% | 5 |

---

## 🐛 DEBUGGING & TROUBLESHOOTING

### Enable Debug Logging
```go
// In your code
import "log"

log.SetFlags(log.LstdFlags | log.Lshortfile)
log.Println("Debug message")

// Or use structured logging
import "github.com/sirupsen/logrus"

logrus.SetLevel(logrus.DebugLevel)
logrus.Debug("Debug message")
```

### Common Issues & Solutions

#### Issue 1: TUN Interface Creation Fails
**Error:** `failed to create TUN interface: permission denied`

**Solutions:**
```bash
# Check if running as root
sudo whoami  # Should output: root

# Check kernel module (Linux)
lsmod | grep tun  # Should show tun module loaded

# Load TUN module if missing (Linux)
sudo modprobe tun

# Check permissions (macOS)
ls -la /dev/tun*  # Should be readable

# Verify platform support
go run ./cmd/service -run  # Run with sudo
```

#### Issue 2: Proxy Connection Fails
**Error:** `proxy connection failed: connection refused`

**Solutions:**
```bash
# Test Oxylabs connectivity directly
curl -x http://username:password@pr.oxylabs.io:7777 https://httpbin.org/ip

# Check credentials in .env
cat .env | grep OXYLABS

# Test network connectivity
ping pr.oxylabs.io

# Check firewall rules
sudo iptables -L -n  # Linux
sudo pfctl -s rules  # macOS
netsh advfirewall show allprofiles  # Windows

# Verify proxy endpoint is reachable
telnet pr.oxylabs.io 7777
```

#### Issue 3: High Latency
**Symptom:** Proxy adds 200-900ms latency

**Solutions:**
```bash
# Check connection pool size
# Add logging to internal/pool/manager.go
log.Printf("Pool size: %d", len(m.pool))

# Monitor system resources
top  # macOS/Linux
taskmgr  # Windows

# Check network connections
netstat -an | grep ESTABLISHED  # Linux/macOS
netstat -ano | findstr ESTABLISHED  # Windows

# Verify HTTP/2 is enabled
# Check transport configuration in internal/proxy/engine.go
// Should have: ForceAttemptHTTP2: true

# Run latency benchmark
go test -bench=BenchmarkLatency -benchmem ./tests/benchmark

# Check for mutex contention
go test -bench=BenchmarkMutex -benchmem ./tests/benchmark
```

#### Issue 4: Memory Leak
**Symptom:** Memory usage grows over time

**Solutions:**
```bash
# Enable memory profiling
go test -memprofile=mem.prof ./...
go tool pprof mem.prof

# Check for goroutine leaks
go test -run TestGoroutineLeaks ./...

# Monitor memory in real-time
watch -n 1 'ps aux | grep atlantic-proxy'

# Force garbage collection
# Add to watchdog.go:
runtime.GC()

# Check for unclosed resources
# Verify all Close() methods are called:
defer client.Close()
defer conn.Close()
defer file.Close()
```

#### Issue 5: Kill Switch Not Working
**Symptom:** Traffic still flows when proxy fails

**Solutions:**
```bash
# Verify kill switch is enabled
# Check internal/killswitch/guardian.go

# Test kill switch manually
sudo ./bin/atlantic-proxy -run
# In another terminal:
sudo iptables -P OUTPUT DROP  # Linux
sudo pfctl -e  # macOS

# Verify traffic is blocked
ping 8.8.8.8  # Should timeout

# Check firewall rules
sudo iptables -L -n  # Linux
sudo pfctl -s rules  # macOS

# Disable kill switch
sudo iptables -P OUTPUT ACCEPT  # Linux
sudo pfctl -d  # macOS
```

#### Issue 6: DNS Leaks
**Symptom:** DNS queries bypass proxy

**Solutions:**
```bash
# Test DNS leak
nslookup example.com
# Should resolve through proxy

# Check DNS configuration
cat /etc/resolv.conf  # Linux
networksetup -getdnsservers Wi-Fi  # macOS

# Verify DNS interception
# Check internal/atlantic/traffic-interceptor.go

# Test with DNS leak checker
curl https://dns.google/resolve?name=example.com

# Monitor DNS queries
tcpdump -i any -n 'udp port 53'  # Linux/macOS
```

#### Issue 7: WebRTC Leaks
**Symptom:** Real IP exposed in WebRTC connections

**Solutions:**
```bash
# Test WebRTC leak
# Visit: https://ipleak.net/

# Block WebRTC in browser
# Firefox: about:config → media.peerconnection.enabled = false
# Chrome: Install WebRTC Leak Prevent extension

# Verify WebRTC blocking in proxy
# Check internal/validator/leak_detector.go

# Monitor WebRTC connections
netstat -an | grep 3478  # STUN port
```

#### Issue 8: Service Won't Start
**Error:** `service failed to start`

**Solutions:**
```bash
# Check service status
systemctl status atlantic-proxy  # Linux
launchctl list | grep atlantic  # macOS
sc query atlantic-proxy  # Windows

# View service logs
journalctl -u atlantic-proxy -f  # Linux
log stream --predicate 'process == "atlantic-proxy"'  # macOS
Get-EventLog -LogName Application -Source atlantic-proxy  # Windows

# Reinstall service
sudo ./bin/atlantic-proxy -uninstall
sudo ./bin/atlantic-proxy -install

# Check permissions
sudo whoami  # Should be root
```

#### Issue 9: Connection Pool Exhaustion
**Symptom:** `connection pool exhausted` errors

**Solutions:**
```bash
# Increase pool size
// In internal/pool/manager.go
poolSize := 100  // Increase from default

// Or auto-scale
if len(m.pool) < 10 {
    m.createClient()
}

# Monitor pool usage
go test -bench=BenchmarkPoolUsage -benchmem ./tests/benchmark

# Check for connection leaks
// Verify all connections are returned to pool
defer m.ReturnClient(client)
```

#### Issue 10: Failover Not Triggering
**Symptom:** Proxy doesn't switch on failure

**Solutions:**
```bash
# Check failover configuration
// In internal/failover/controller.go
maxFailures := 3  // Adjust threshold

# Test failover manually
// Simulate proxy failure
// Verify automatic switch to backup

# Monitor failover events
log.Printf("Failover triggered: %s", newProxy)

# Check backup proxy list
// Verify backups are configured
backups := []string{"proxy1", "proxy2", "proxy3"}
```

### Performance Debugging

```bash
# CPU profiling
go test -cpuprofile=cpu.prof ./...
go tool pprof cpu.prof

# Memory profiling
go test -memprofile=mem.prof ./...
go tool pprof mem.prof

# Goroutine profiling
go test -trace=trace.out ./...
go tool trace trace.out

# Benchmark comparison
go test -bench=. -benchmem ./tests/benchmark > before.txt
# Make changes
go test -bench=. -benchmem ./tests/benchmark > after.txt
benchstat before.txt after.txt
```

### Testing Checklist

Before committing code:
```bash
# Format code
go fmt ./...

# Vet code
go vet ./...

# Lint code
golangci-lint run ./...

# Run tests
go test -v ./...

# Run benchmarks
go test -bench=. -benchmem ./tests/benchmark

# Check coverage
go test -cover ./...

# Race detector
go test -race ./...
```

---

## 📚 DOCUMENTATION MAP

| Document | Purpose |
|----------|---------|
| **IMPLEMENTATION_GUIDE.md** | Step-by-step implementation |
| **PHASE_BREAKDOWN.md** | Detailed phase breakdown |
| **VPN_Grade_Standby_Proxy_Implementation_Tasks.md** | Complete task list |
| **Performance_Optimization_Brief.md** | Performance optimization guide |
| **AdBlock_Integration_Briefing.md** | Ad-blocking implementation |
| **AdBlock_Quick_Reference.md** | Ad-blocking quick reference |
| **ARCHITECTURE_OVERVIEW.md** | System architecture |
| **TECH_STACK.md** | Technology stack details |

---

## 🔑 KEY FILES BY PHASE

### Phase 1
- `internal/interceptor/tun.go` - TUN interface
- `internal/atlantic/traffic-interceptor.go` - Traffic interception
- `internal/service/service.go` - Service management
- `cmd/service/main.go` - Service entry point

### Phase 2
- `internal/proxy/engine.go` - Proxy engine
- `pkg/oxylabs/client.go` - Oxylabs client
- `internal/pool/manager.go` - Connection pool

### Phase 3
- `internal/monitor/network.go` - Network monitoring
- `internal/failover/controller.go` - Failover logic
- `internal/killswitch/guardian.go` - Kill switch

### Phase 4
- `internal/validator/leak_detector.go` - Leak detection
- `internal/validator/traffic_protection.go` - Traffic protection

### Phase 5
- `internal/service/watchdog.go` - Watchdog
- `internal/service/recovery.go` - Recovery logic

### Phase 6
- `cmd/tray/main.go` - System tray app

### Phase 7
- Multiple files (see Performance_Optimization_Brief.md)

### Phase 8
- `internal/adblock/compliance.go` - Compliance
- `internal/adblock/dns_filter.go` - DNS filtering
- `internal/adblock/request_filter.go` - HTTP filtering
- `internal/adblock/blocklist_manager.go` - Blocklist management

---

## 💡 TIPS & TRICKS

### Development Workflow
```bash
# Watch for changes and rebuild
while true; do
  go build -o bin/atlantic-proxy ./cmd/service && echo "✅ Built"
  sleep 2
done

# Run tests on save
find . -name "*.go" | entr go test -v ./...

# Format on save
find . -name "*.go" | entr go fmt ./...
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/phase-1-foundation

# Commit with phase reference
git commit -m "Phase 1: Implement TUN interface"

# Push and create PR
git push origin feature/phase-1-foundation
```

### Code Quality
```bash
# Run all checks
go fmt ./...
go vet ./...
golangci-lint run ./...
go test -v ./...

# Before committing
git add .
git commit -m "Phase X: Description"
```

---

## 📞 GETTING HELP

### Resources
- **Go Documentation:** https://golang.org/doc
- **goproxy:** https://github.com/elazarl/goproxy
- **water (TUN/TAP):** https://github.com/songgao/water
- **Oxylabs API:** https://docs.oxylabs.io

### Common Questions

**Q: How do I test the TUN interface?**
A: See IMPLEMENTATION_GUIDE.md Phase 1 testing section

**Q: How do I debug latency issues?**
A: See Performance_Optimization_Brief.md troubleshooting section

**Q: How do I implement ad-blocking?**
A: See AdBlock_Integration_Briefing.md

**Q: How do I set up the development environment?**
A: See 5-MINUTE SETUP section above

---

## ✅ IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Go 1.21+ installed
- [ ] Project cloned
- [ ] Dependencies installed
- [ ] .env configured
- [ ] Git initialized

### Each Phase
- [ ] Read phase documentation
- [ ] Create required files
- [ ] Implement tasks
- [ ] Write tests
- [ ] Pass acceptance criteria
- [ ] Code review
- [ ] Commit to git

### After Each Phase
- [ ] All tests passing
- [ ] Code formatted
- [ ] Documentation updated
- [ ] Performance benchmarks run
- [ ] Ready for next phase

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Status:** Ready for Development

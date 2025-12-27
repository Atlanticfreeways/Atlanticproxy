# 🌊 AtlanticProxy
**VPN-Grade Residential Proxy Suite with System-Wide Interception**

AtlanticProxy is a high-performance, secure, and user-friendly proxy client that enables system-wide traffic redirection through Oxylabs residential and datacenter networks. It combines low-level Go network engineering with a modern Next.js dashboard.

---

## 🚦 PROJECT STATUS: 🟢 Core Implementation Complete
AtlanticProxy has successfully transitioned through Phases 1-8. It is now a fully functional "VP-Grade" solution with robust performance and security features.

**Next Milestone:** Phase 9 - Production Polish & Distribution.

---

## ⚡ QUICK ACCESS
If you are continuing development or reviewing progress, start here:
- **[Phase 9 Roadmap & Quick Access](./PHASE9_QUICKACCESS.md)** 🚀
- **[Unified Completion Report (Phases 1-8)](About%20the%20Proj/UNIFIED_COMPLETION_REPORT.md)**
- **[Implementation Checklist](About%20the%20Proj/IMPLEMENTATION_CHECKLIST.md)**

---

## 🛠️ CORE FEATURES
- **System-Wide Interception:** Leveraging TUN/TAP interfaces to capture and route 100% of system traffic.
- **High-Performance Proxying:** Transparent HTTP/HTTPS proxy with connection pooling and SSL/TLS MITM.
- **Oxylabs Integration:** Direct access to premium residential proxy exit nodes with automated failover.
- **Advanced Security:** Native Kill Switch, DNS Leak prevention, and WebRTC blocking.
- **Smart Ad-Blocking:** DNS and HTTP-level filtering with regional compliance (GDPR aware).
- **Dual Interface:** 
    - **Go Tray App:** Light-weight status and quick toggle menu.
    - **Web Dashboard:** Comprehensive 7-page analytics and management suite.

---

## 📊 PERFORMANCE SPECS
- **p50 Latency:** 15ms - 40ms
- **Throughput:** >100 Mbps (Full 1080p/4K Streaming ready)
- **Memory Footprint:** ~80MB (Combined)
- **Failover Logic:** <500ms connection restoration

---

## 📂 PROJECT STRUCTURE
```
Atlanticproxy/
├── cmd/
│   ├── tray/               # Go System Tray UI
│   └── service/            # Go Background Core Service
├── scripts/proxy-client/    # Main Core Logic (Go)
│   ├── internal/            # AdBlock, Interceptor, Proxy, Failover logic
│   └── pkg/                 # Configuration and Oxylabs Client
├── atlantic-dashboard/     # Next.js 15 Web Dashboard
└── About the Proj/         # Project Roadmap, Checklists, and Docs
```

---

## 🚀 GETTING STARTED (DEVELOPER)

### 1. Build the Go Service
```bash
cd scripts/proxy-client
go build -o bin/proxy-service ./cmd/service
```

### 2. Build/Run the Tray App
```bash
make build-tray
# Run the binary generated in bin/
```

### 3. Start the Web Dashboard
```bash
npm run run-web-dashboard
# Opens at http://localhost:3000
```

---

## 📜 LICENSE
Internal/Private Development - Atlantic Proxy Limited.

---
**Last Updated:** December 27, 2025

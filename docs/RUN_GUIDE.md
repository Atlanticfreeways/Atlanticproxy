# 🚀 Run Guide: AtlanticProxy

This guide details the commands to start, stop, and configure the AtlanticProxy application stack.

## 📋 Quick Reference

| Component | Role | Port | Command |
| :--- | :--- | :--- | :--- |
| **Backend Service** | Core Logic & TUN | 8082 | `sudo ./service` |
| **System Tray** | GUI Control | - | `go run ./cmd/tray` |
| **Web Dashboard** | Web Interface | 3000 | `npm run dev` |
| **SOCKS5 Proxy** | Local Proxy | 1080 | `127.0.0.1:1080` |
| **Prometheus** | Metrics | 9091 | `http://localhost:9091` |
| **Grafana** | Visuals | 3001 | `http://localhost:3001` |

---

## � 0. Configuration
Before starting, ensure your environment is configured for your proxy provider.

**Location**: `scripts/proxy-client/.env`
```env
# Proxy Provider Selection (auto, residential, realtime, pia)
PROVIDER_TYPE=auto

# Oxylabs Residential (Username/Password)
OXYLABS_USERNAME=your_username
OXYLABS_PASSWORD=your_password

# Oxylabs Realtime/Crawler (API Key)
OXYLABS_API_KEY=your_key

# PIA S5 Proxy (API Key)
PIA_API_KEY=your_pia_key
```

---

## 🏗️ 1. Backend Service (Go)
**Requires**: `sudo` (for TUN interface creation).

### Build & Run (Single Step)
```bash
cd scripts/proxy-client
go build -o service ./cmd/service
sudo ./service
```

### Stop & Restart
```bash
sudo pkill -9 service
sudo ./service
```

---

## 🍏 2. System Tray App (Go)
The tray app provides quick access and notifications in the macOS menu bar.

### Run from Source
```bash
# Run from root
go run ./cmd/tray
```

### Build Binary
```bash
make build-tray
./bin/atlantic-tray
```

---

## 🖥️ 3. Web Dashboard (Next.js)
The full management interface.

### First Time Setup
```bash
cd atlantic-dashboard
npm install
```

### Run Development Server
```bash
cd atlantic-dashboard
npm run dev
```

---

## 🧪 4. Testing & Stability
### Stress Test (k6)
Simulate heavy traffic to verify rotation and billing.
```bash
k6 run scripts/proxy-client/scripts/stress_test.js
```

### Long-Duration Stability Test
Execute the automated 72h stability suite.
```bash
bash scripts/stability_test.sh
```

---

## 📊 5. Monitoring (Grafana & Prometheus)
The system is instrumented to provide real-time metrics for health, connections, and performance.

### Start Monitoring Stack
```bash
make monitor-up
```

### Accessing Dashboards
*   **Grafana**: [http://localhost:3001](http://localhost:3001)
    *   **User/Pass**: `admin` / `admin`
    *   **Dashboards Configured**:
        *   ✅ **AtlanticProxy - System Health**: CPU, RAM, Goroutines.
        *   ✅ **AtlanticProxy - Performance**: Latency, Bandwidth, Rotation.
*   **Prometheus (Raw Data)**: [http://localhost:9091](http://localhost:9091)

### Key Metrics to Watch:
*   `atlantic_proxy_active_connections`: Total current users.
*   `atlantic_proxy_provider_latency`: Real-time ping to Oxylabs/PIA.
*   `atlantic_proxy_rotation_failures_total`: Rotation health.
*   `go_memstats_heap_alloc_bytes`: Memory footprint (Target: < 50MB).

---

## 🔧 Troubleshooting

### Port Conflicts
If you see "address already in use":
```bash
sudo lsof -i :8082  # API
sudo lsof -i :1080  # SOCKS5
sudo lsof -i :5053  # DNS (if enabled)
sudo pkill -9 service
```

### Resetting State
To wipe the database and start fresh:
```bash
rm scripts/proxy-client/atlantic.db
```
*(The service will recreate and seed it on next start)*

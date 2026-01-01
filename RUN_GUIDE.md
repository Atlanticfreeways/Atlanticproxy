# 🚀 Run Guide: AtlanticProxy

This guide details the commands to start, stop, and restart the AtlanticProxy application stack.

## 📋 Quick Reference

| Component | Port | Local URL |
|-----------|------|-----------|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend API** | 8082 | http://localhost:8082 |
| **SOCKS5 Proxy** | 1080 | `127.0.0.1:1080` |
| **DNS Filter** | 5053 | `127.0.0.1:5053` |

---

## 🛠 Backend Service
**Location:** `scripts/proxy-client`

### 1. Build the Service
Always rebuild if you've made code changes.
```bash
cd "scripts/proxy-client"
go build -o service ./cmd/service
```

### 2. Start the Service
⚠️ **Requires sudo** due to network interface (TUN) creation and port binding.
Run this from the **project root**:
```bash
cd scripts/proxy-client && go build -o service ./cmd/service && sudo ./service
```
*Expected Output:*
```text
✅ AtlanticProxy service started successfully
✅ DNS Filter starting on 127.0.0.1:5053
✅ Starting HTTP API server on :8082
```

### 3. Stop & Restart (One-Liner)
If you need to refresh the backend after code changes:
```bash
sudo pkill -9 service; cd scripts/proxy-client && go build -o service ./cmd/service && sudo ./service
```

---

## 🖥 Frontend Dashboard
**Location:** `atlantic-dashboard`

### 1. Install Dependencies (First Run Only)
```bash
cd "atlantic-dashboard"
npm install
```

### 2. Start Development Server
Use this for active development. Auto-reloads on change.
```bash
cd "atlantic-dashboard"
npm run dev
```

### 3. Build & Start (Production Mode)
Use this for testing the final optimized build.
```bash
cd "atlantic-dashboard"
npm run build
npm start
```

---

## 🔧 Troubleshooting

### Port Conflicts
If you see "address already in use" errors:

**Check what's using the ports:**
```bash
# Check Backend API
sudo lsof -i :8082

# Check SOCKS5
sudo lsof -i :1080

# Check DNS
sudo lsof -i :5053
```

**Kill conflicting processes:**
```bash
# Kill by PID (replace 1234 with PID from lsof)
sudo kill -9 1234

# OR Kill all Atlantic services
sudo pkill -9 service
sudo pkill -9 -f "atlantic"
```

### Database
**Location:** `./atlantic.db` (In the directory where you run the service)

**Reset Database (Delete all data):**
```bash
rm atlantic.db
```
*The service will automatically recreate the database and seed default data on next startup.*

### System Service Conflicts
If the service keeps auto-restarting or you can't free port 8080/8082:
```bash
# Unload the LaunchDaemon
sudo launchctl bootout system /Library/LaunchDaemons/com.atlanticproxy.client.plist
```

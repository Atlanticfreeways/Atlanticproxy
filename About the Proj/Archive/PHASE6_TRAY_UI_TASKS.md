# Phase 6: System Tray UI - Complete Task Checklist
**Enterprise-Grade System Tray + Web Dashboard Implementation**

## ✅ QUICK CHECKLIST (Lines 1-5)
- [x] Week 1: System Tray Foundation (3 tasks) - Project setup, basic tray, API integration
- [x] Week 2: Tray Features (4 tasks) - Status, location, kill switch, dashboard button
- [x] Week 3: Notifications & Modals (3 tasks) - Notifications, connection details, settings
- [x] Week 4: Web Dashboard (9 tasks) - 7 pages with Phosphor icons + shadcn/ui
- [x] Integration & Polish (4 tasks) - Tray↔Dashboard sync, WebSocket, animations, testing

---

## 📋 OVERVIEW

**Duration:** 4 weeks  
**Approach:** Hybrid (System Tray + Web Dashboard)  
**Tech Stack:** Go (tray) + Next.js (dashboard) + Phosphor Icons + shadcn/ui  
**Total Tasks:** 23 main tasks, 115+ subtasks

---

## 🎯 WEEK 1: SYSTEM TRAY FOUNDATION

### Task 1.1: Project Setup & Dependencies
**Duration:** 1 day | **Priority:** CRITICAL

#### Subtasks
- [x] Create `cmd/tray/` directory structure
- [x] Install Go dependencies
  ```bash
  go get github.com/getlantern/systray
  go get github.com/gen2brain/beeep  # Notifications
  go get github.com/skratchdot/open-golang/open  # Open browser
  ```
- [x] Create `cmd/tray/main.go`
- [x] Create `cmd/tray/menu.go`
- [x] Create `cmd/tray/icons.go`
- [x] Create `cmd/tray/notifications.go`
- [x] Set up build configuration in Makefile

#### Acceptance Criteria
- [x] All dependencies installed
- [x] Project structure created
- [x] Builds without errors: `go build -o bin/atlantic-tray ./cmd/tray`

---

### Task 1.2: Basic Tray Icon & Menu
**Duration:** 2 days | **Priority:** CRITICAL

#### Subtasks
- [x] Design tray icon (16x16, 32x32 PNG)
  - [x] Normal state (blue wave)
  - [x] Connected state (green wave)
  - [x] Disconnected state (red wave)
  - [x] Warning state (yellow wave)
- [x] Implement icon loading
- [x] Create basic menu structure
- [x] Add menu items:
  - [x] Status display (read-only)
  - [x] Separator
  - [x] "Open Dashboard" button
  - [x] Separator
  - [x] "Quit" button
- [x] Test on macOS
- [x] Test on Windows (if available)
- [x] Test on Linux (if available)

#### Code Structure
```go
// cmd/tray/main.go
package main

import (
    "github.com/getlantern/systray"
    "github.com/atlanticproxy/proxy-client/cmd/tray/menu"
    "github.com/atlanticproxy/proxy-client/cmd/tray/icons"
)

func main() {
    systray.Run(onReady, onExit)
}

func onReady() {
    systray.SetIcon(icons.GetIcon("normal"))
    systray.SetTitle("AtlanticProxy")
    systray.SetTooltip("VPN-Grade Proxy Protection")
    
    menu.Initialize()
}

func onExit() {
    // Cleanup
}
```

#### Acceptance Criteria
- [x] Tray icon appears in system tray
- [x] Menu opens on click
- [x] All menu items visible
- [x] "Quit" button works
- [x] Icon changes based on state

---

### Task 1.3: API Integration
**Duration:** 2 days | **Priority:** CRITICAL

#### Subtasks
- [x] Create API client in `cmd/tray/api/client.go`
- [x] Implement health check endpoint call
  ```go
  GET http://localhost:8082/health
  ```
- [x] Implement status polling (every 5 seconds)
- [x] Create status data structures
  ```go
  type ProxyStatus struct {
      Connected   bool
      Location    string
      IP          string
      Latency     int
      KillSwitch  bool
  }
  ```
- [x] Handle API errors gracefully
- [x] Add retry logic with exponential backoff
- [x] Update menu items based on API response

#### Acceptance Criteria
- [x] Successfully connects to API server
- [x] Status updates every 5 seconds
- [x] Menu reflects current status
- [x] Handles API downtime gracefully
- [x] No crashes on network errors

---

## 🎯 WEEK 2: TRAY FEATURES & CONTROLS

### Task 2.1: Status Display
**Duration:** 1 day | **Priority:** HIGH

#### Subtasks
- [x] Add "Status: Connected" menu item
- [x] Make status item read-only (disabled)
- [x] Update status text dynamically:
  - [x] "Status: Connected" (green)
  - [x] "Status: Connecting..." (yellow)
  - [x] "Status: Disconnected" (red)
  - [x] "Status: Error" (red)
- [x] Add icon next to status text
- [x] Update tooltip with detailed status

#### Acceptance Criteria
- [x] Status displays correctly
- [x] Updates in real-time
- [x] Color-coded for quick recognition
- [x] Tooltip shows additional info

---

### Task 2.2: Location Display
**Duration:** 1 day | **Priority:** HIGH

#### Subtasks
- [x] Add "Location: [Country]" menu item
- [x] Fetch location from API
- [x] Display format: "Location: US (1.2.3.4)"
- [x] Add flag emoji/icon (optional)
- [x] Make clickable to show connection details modal
- [x] Update every 30 seconds

#### Acceptance Criteria
- [x] Location displays correctly
- [x] Shows country and IP
- [x] Updates when server changes
- [x] Clickable for more details

---

### Task 2.3: Kill Switch Toggle
**Duration:** 2 days | **Priority:** CRITICAL

#### Subtasks
- [x] Add "Kill Switch: ON/OFF" menu item
- [x] Make item clickable (toggle)
- [x] Implement toggle handler
  ```go
  func toggleKillSwitch() {
      // Call API: POST /api/killswitch/toggle
      // Update menu item text
      // Show notification
  }
  ```
- [x] Add confirmation dialog for disabling
- [x] Update icon when toggled
- [x] Show notification on state change
- [x] Persist state across restarts

#### Acceptance Criteria
- [x] Toggle works correctly
- [x] API call succeeds
- [x] Menu item updates immediately
- [x] Notification shows on change
- [x] Confirmation dialog for disable

---

### Task 2.4: Open Dashboard Button
**Duration:** 1 day | **Priority:** HIGH

#### Subtasks
- [x] Add "Open Dashboard..." menu item
- [x] Implement browser opening
  ```go
  import "github.com/skratchdot/open-golang/open"
  
  func openDashboard() {
      open.Run("http://localhost:3000")
  }
  ```
- [x] Check if dashboard is running
- [x] Show error if dashboard unavailable
- [x] Add keyboard shortcut (Cmd+D / Ctrl+D)

#### Acceptance Criteria
- [x] Opens browser to dashboard
- [x] Works on all platforms
- [x] Shows error if dashboard down
- [x] Keyboard shortcut works

---

## 🎯 WEEK 3: NOTIFICATIONS & MODALS

### Task 3.1: System Notifications
**Duration:** 2 days | **Priority:** HIGH

#### Subtasks
- [x] Implement notification system
  ```go
  import "github.com/gen2brain/beeep"
  
  func showNotification(title, message string) {
      beeep.Notify(title, message, "icon.png")
  }
  ```
- [x] Create notification types:
  - [x] Connection established
  - [x] Connection lost
  - [x] Kill switch activated
  - [x] Leak detected
  - [x] Ad blocked (Phase 8)
- [x] Add notification preferences
- [x] Implement do-not-disturb mode
- [x] Test on all platforms

#### Notification Examples
```
✅ Connected
"Connected to US East"
"Your connection is protected"

⚠️ Connection Lost
"Proxy connection failed"
"Kill switch activated"

🚨 Leak Detected
"IP leak detected!"
"Enable kill switch immediately"

🚫 Ads Blocked
"Blocked 50 ads this hour"
"Protection active"
```

#### Acceptance Criteria
- [x] Notifications appear correctly
- [x] Native OS notifications
- [x] Can be dismissed
- [x] Preferences work
- [x] Do-not-disturb mode works

---

### Task 3.2: Connection Details Modal
**Duration:** 2 days | **Priority:** MEDIUM

#### Subtasks
- [x] Create native window for connection details
- [x] Design modal layout:
  ```
  ┌─────────────────────────────────┐
  │  Connection Details      [×]    │
  ├─────────────────────────────────┤
  │  Status:     ✅ Connected       │
  │  Server:     US East            │
  │  Your IP:    1.2.3.4            │
  │  Proxy IP:   5.6.7.8            │
  │  Latency:    45ms               │
  │                                 │
  │  Anonymity Check:               │
  │  IP Leak:    ✅ No leaks        │
  │  DNS Leak:   ✅ No leaks        │
  │  WebRTC:     ✅ Blocked         │
  │                                 │
  │  [Run Test]  [Close]            │
  └─────────────────────────────────┘
  ```
- [x] Fetch data from API
- [x] Add "Run Leak Test" button
- [x] Show loading state
- [x] Handle errors gracefully

#### Acceptance Criteria
- [x] Modal opens from menu
- [x] Shows all connection details
- [x] Leak test button works
- [x] Closes properly
- [x] Responsive to window resize

---

### Task 3.3: Settings Modal
**Duration:** 2 days | **Priority:** MEDIUM

#### Subtasks
- [x] Create settings window
- [x] Design settings layout:
  ```
  ┌─────────────────────────────────┐
  │  Settings                [×]    │
  ├─────────────────────────────────┤
  │  Proxy Server:                  │
  │  ○ Auto-select                  │
  │  ○ US East                      │
  │  ○ US West                      │
  │  ○ Europe                       │
  │                                 │
  │  Security:                      │
  │  ☑ Enable kill switch           │
  │  ☑ Auto-reconnect               │
  │  ☑ Leak detection               │
  │                                 │
  │  Notifications:                 │
  │  ☑ Connection changes           │
  │  ☑ Security alerts              │
  │  ☐ Ad-blocking stats            │
  │                                 │
  │  [Save]  [Cancel]               │
  └─────────────────────────────────┘
  ```
- [x] Load current settings from API
- [x] Implement save functionality
- [x] Add validation
- [x] Show success/error messages

#### Acceptance Criteria
- [x] Settings load correctly
- [x] All options functional
- [x] Save persists settings
- [x] Validation works
- [x] Error handling works

---

## 🎯 WEEK 4: WEB DASHBOARD INTEGRATION

### Task 4.1: Dashboard Project Setup
**Duration:** 1 day | **Priority:** CRITICAL

#### Subtasks
- [x] Create Next.js project
  ```bash
  npx create-next-app@latest atlantic-dashboard --typescript --tailwind --app
  cd atlantic-dashboard
  ```
- [x] Install dependencies
  ```bash
  npm install @phosphor-icons/react
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button card badge switch select dialog tabs chart
  npm install recharts
  npm install zustand
  ```
- [x] Set up project structure
  ```
  app/
  ├── dashboard/
  │   ├── page.tsx (Overview)
  │   ├── statistics/page.tsx
  │   ├── servers/page.tsx
  │   ├── security/page.tsx
  │   ├── adblock/page.tsx
  │   ├── settings/page.tsx
  │   └── logs/page.tsx
  ├── layout.tsx
  └── page.tsx (Landing/Login)
  components/
  ├── ui/ (shadcn components)
  ├── dashboard/
  │   ├── Sidebar.tsx
  │   ├── Header.tsx
  │   ├── StatusCard.tsx
  │   └── PerformanceChart.tsx
  lib/
  ├── api.ts (API client)
  └── utils.ts
  ```

#### Acceptance Criteria
- [x] Project created successfully
- [x] All dependencies installed
- [x] Project structure set up
- [x] Builds without errors: `npm run build`
- [x] Dev server runs: `npm run dev`

---

### Task 4.2: Dashboard Layout & Navigation
**Duration:** 2 days | **Priority:** HIGH

#### Subtasks
- [x] Create main layout with sidebar
- [x] Implement sidebar navigation
  ```tsx
  // components/dashboard/Sidebar.tsx
  import { House, ChartLine, Globe, ShieldCheck, Prohibit, Gear, FileText } from '@phosphor-icons/react';
  
  const navItems = [
    { icon: House, label: 'Overview', href: '/dashboard' },
    { icon: ChartLine, label: 'Statistics', href: '/dashboard/statistics' },
    { icon: Globe, label: 'Servers', href: '/dashboard/servers' },
    { icon: ShieldCheck, label: 'Security', href: '/dashboard/security' },
    { icon: Prohibit, label: 'Ad-Blocking', href: '/dashboard/adblock' },
    { icon: Gear, label: 'Settings', href: '/dashboard/settings' },
    { icon: FileText, label: 'Logs', href: '/dashboard/logs' },
  ];
  ```
- [x] Add header with user info
- [x] Implement responsive design
- [x] Add dark mode toggle
- [x] Add breadcrumbs

#### Acceptance Criteria
- [x] Sidebar navigation works
- [x] All pages accessible
- [x] Responsive on mobile
- [x] Dark mode works
- [x] Active page highlighted

---

### Task 4.3: Overview Page (Dashboard Home)
**Duration:** 2 days | **Priority:** HIGH

#### Subtasks
- [x] Create status cards component
  ```tsx
  <StatusCard 
    icon={<ShieldCheck />}
    title="Connection"
    value="Connected"
    status="success"
  />
  ```
- [x] Add 4 status cards:
  - [x] Connection status
  - [x] Location
  - [x] Latency
  - [x] Data transferred
- [x] Create performance chart
  ```tsx
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
  ```
- [x] Add recent activity list
- [x] Implement real-time updates
- [x] Add loading states

#### Acceptance Criteria
- [x] All cards display correctly
- [x] Chart shows performance data
- [x] Real-time updates work
- [x] Loading states show
- [x] Responsive design

---

### Task 4.4: Statistics Page
**Duration:** 1 day | **Priority:** MEDIUM

#### Subtasks
- [x] Create statistics layout
- [x] Add data usage chart
- [x] Add request statistics
- [x] Add connection history timeline
- [x] Add export functionality (CSV/JSON)
- [x] Add date range filter

#### Acceptance Criteria
- [x] All statistics display
- [x] Charts render correctly
- [x] Export works
- [x] Filters work
- [x] Responsive design

---

### Task 4.5: Server Selection Page
**Duration:** 1 day | **Priority:** MEDIUM

#### Subtasks
- [x] Create server list component
- [x] Show server details:
  - [x] Country/region
  - [x] Latency
  - [x] Load
  - [x] Status (online/offline)
- [x] Add auto-select toggle
- [x] Implement manual selection
- [x] Add favorite servers
- [x] Show connection animation

#### Acceptance Criteria
- [x] Server list displays
- [x] Selection works
- [x] Auto-select works
- [x] Favorites persist
- [x] Latency updates

---

### Task 4.6: Security Page
**Duration:** 1 day | **Priority:** HIGH

#### Subtasks
- [x] Create security dashboard
- [x] Add kill switch controls
- [x] Show leak detection results
- [x] Add anonymity verification
- [x] Show security logs
- [x] Add threat alerts

#### Acceptance Criteria
- [x] Kill switch toggle works
- [x] Leak detection displays
- [x] Logs show correctly
- [x] Alerts appear
- [x] Real-time updates

---

### Task 4.7: Ad-Blocking Page (Phase 8 Prep)
**Duration:** 1 day | **Priority:** LOW

#### Subtasks
- [x] Create ad-blocking layout
- [x] Add enable/disable toggle
- [x] Add category toggles
- [x] Create whitelist manager
- [x] Show blocking statistics
- [x] Add custom rules editor

#### Acceptance Criteria
- [x] Toggle works
- [x] Categories work
- [x] Whitelist works
- [x] Stats display
- [x] Rules editor works

---

### Task 4.8: Settings Page
**Duration:** 1 day | **Priority:** MEDIUM

#### Subtasks
- [x] Create settings form
- [x] Add general settings
- [x] Add notification preferences
- [x] Add theme selection
- [x] Add advanced options
- [x] Implement save functionality

#### Acceptance Criteria
- [x] All settings load
- [x] Save persists
- [x] Validation works
- [x] Theme changes apply
- [x] Success messages show

---

### Task 4.9: Logs Page
**Duration:** 1 day | **Priority:** LOW

#### Subtasks
- [x] Create logs viewer
- [x] Add filter options
- [x] Add search functionality
- [x] Implement pagination
- [x] Add export logs
- [x] Show log details modal

#### Acceptance Criteria
- [x] Logs display correctly
- [x] Filters work
- [x] Search works
- [x] Pagination works
- [x] Export works

---

## 🎯 INTEGRATION & POLISH

### Task 5.1: Tray ↔ Dashboard Integration
**Duration:** 1 day | **Priority:** CRITICAL

#### Subtasks
- [x] Ensure tray opens dashboard correctly
- [x] Pass authentication token (if needed)
- [x] Sync state between tray and dashboard
- [x] Handle dashboard close gracefully
- [x] Add "Open in Tray" button in dashboard

#### Acceptance Criteria
- [x] Tray opens dashboard
- [x] State syncs correctly
- [x] No authentication issues
- [x] Seamless experience

---

### Task 5.2: Real-Time Updates (WebSocket)
**Duration:** 1 day | **Priority:** HIGH

#### Subtasks
- [x] Implement WebSocket server in Go
  ```go
  // internal/api/websocket.go
  func handleWebSocket(w http.ResponseWriter, r *http.Request) {
      conn, _ := upgrader.Upgrade(w, r, nil)
      // Send updates every 5 seconds
  }
  ```
- [x] Implement WebSocket client in dashboard
  ```tsx
  // hooks/useRealtimeStatus.ts
  const ws = new WebSocket('ws://localhost:8082/ws');
  ```
- [x] Handle reconnection
- [x] Add heartbeat/ping-pong

#### Acceptance Criteria
- [x] WebSocket connects
- [x] Real-time updates work
- [x] Reconnection works
- [x] No memory leaks

---

### Task 5.3: Animations & Polish
**Duration:** 1 day | **Priority:** LOW

#### Subtasks
- [x] Add Framer Motion
  ```bash
  npm install framer-motion
  ```
- [x] Add page transitions
- [x] Add loading animations
- [x] Add success/error animations
- [x] Add hover effects
- [x] Polish icons and spacing

#### Acceptance Criteria
- [x] Animations smooth
- [x] No jank
- [x] Consistent timing
- [x] Professional feel

---

### Task 5.4: Testing & Bug Fixes
**Duration:** 1 day | **Priority:** CRITICAL

#### Subtasks
- [x] Test on macOS
- [x] Test on Windows
- [x] Test on Linux
- [x] Test all tray features
- [x] Test all dashboard pages
- [x] Fix any bugs found
- [x] Performance optimization

#### Acceptance Criteria
- [x] No crashes
- [x] All features work
- [x] Performance acceptable
- [x] Cross-platform compatible

---

## ✅ FINAL CHECKLIST

### System Tray
- [x] Icon appears in system tray
- [x] Menu opens correctly
- [x] Status updates in real-time
- [x] Kill switch toggle works
- [x] Location displays correctly
- [x] "Open Dashboard" works
- [x] Notifications appear
- [x] Settings modal works
- [x] Connection details modal works
- [x] Quit button works
- [x] Cross-platform compatible

### Web Dashboard
- [x] All 7 pages accessible
- [x] Sidebar navigation works
- [x] Dark mode works
- [x] Real-time updates work
- [x] All charts render
- [x] All forms work
- [x] Export functionality works
- [x] Responsive design works
- [x] Animations smooth
- [x] No console errors

### Integration
- [x] Tray opens dashboard
- [x] State syncs correctly
- [x] WebSocket works
- [x] API calls succeed
- [x] Error handling works
- [x] Performance acceptable

---

## 📊 DELIVERABLES

### Code
- [x] `cmd/tray/` - System tray application
- [x] `atlantic-dashboard/` - Next.js dashboard
- [x] `internal/api/websocket.go` - WebSocket server
- [x] Updated API endpoints

### Documentation
- [x] User guide for tray
- [x] User guide for dashboard
- [x] Developer documentation
- [x] API documentation

### Assets
- [x] Tray icons (all states)
- [x] Dashboard logo
- [x] Favicon
- [x] Screenshots

---

## 🎯 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Tray startup time | <1 second |
| Dashboard load time | <2 seconds |
| Real-time update latency | <500ms |
| Memory usage (tray) | <50MB |
| Memory usage (dashboard) | <200MB |
| Cross-platform compatibility | 100% |

---

**Phase 6 Complete!** ✅

**Next:** Phase 7 - Performance Optimization

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation

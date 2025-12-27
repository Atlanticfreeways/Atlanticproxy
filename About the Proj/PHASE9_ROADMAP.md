# 🚀 AtlanticProxy Phase 9: Production Polish & Distribution
**Roadmap to V1.0 Release**

## 🎯 Vision
Transform the functional AtlanticProxy codebase into a polished, professional product ready for end-user distribution and commercial-grade reliability.

---

## 🛠️ PHASE 9.1: VISUAL EXCELLENCE & BRANDING
**Objective:** Create high-quality visual assets to replace placeholders.

- [ ] **Tray Icon Suite:**
    - [ ] Generate 16x16 and 32x32 PNGs for:
        - `normal.png` (Idle/Ready)
        - `active.png` (Connected/Active)
        - `error.png` (Disconnected/Issue)
        - `warning.png` (Slow/Health check fail)
    - [ ] Convert to `.ico` (Windows) and `.icns` (macOS).
- [x] **Branding Assets:**
    - [x] Create vector-based high-res logo SVG.
    - [ ] Design custom tray icon set (Normal, Active, Error, Warning).
    - [x] Implement dynamic Favicon for web dashboard.
    - [ ] Implement a custom "Atlantic" splash screen for the dashbaord loader.
- [ ] **UI Polish:**
    - [ ] Finalize "Glassmorphism" effects in the Dashboard.
    - [ ] Add smooth transitions (Framer Motion) between dashboard pages.

---

## 📡 PHASE 9.2: REAL-TIME COMMUNICATION (WEBSOCKETS)
**Objective:** Eliminate the 5s polling delay for tray↔dashboard synchronization.

- [x] **Backend (Go):**
    - [x] Implement a WebSocket server in `internal/api/server.go`.
    - [x] Create a broadcaster to push state changes (IP, Status, Block count) immediately.
- [x] **Frontend (Next.js):**
    - [x] Replace `axios` polling with a persistent `WebSocket` hook in `lib/api.ts`.
    - [x] Implement auto-reconnection logic.
- [ ] **Sync Verification:**
    - [ ] Toggle Kill Switch in Dashboard -> Verify instantaneous tray menu update.
    - [ ] Change region in Dashboard -> Verify tray menu location update <100ms.

---

## 🛡️ PHASE 9.3: ADVANCED AD-BLOCKING FEATURES
**Objective:** Give users granular control over their browsing experience.

- [x] **Whitelist Management:**
    - [x] Add "Whitelist" button to the Security page in the Dashboard.
    - [x] Implement `internal/adblock/whitelist.go` to store excluded domains.
    - [x] Update `DNSFilter` and `RequestFilter` to check whitelist before blocking.
- [ ] **Custom Rules:**
    - [ ] Add a "Custom Filter" text area in Ad-Block settings.
    - [ ] Support manual entry of EasyList-format rules.
- [ ] **Blocklist Refresh UX:**
    - [ ] Add "Update Now" button with progress spinner.

---

## 📦 PHASE 9.4: PACKAGING & INSTALLERS
**Objective:** Create single-click installation experiences for all platforms.

- [ ] **macOS Distribution:**
    - [x] Create initial `scripts/build_installers.sh` for binary stripping.
    - [x] Modernize root `Makefile` for unified prod builds.
    - [ ] Script to install MITM Root CA to the System Keychain.
    - [ ] Create `.app` bundle using `appdmg`.
    - [ ] Implement privilege helper tool for TUN interface creation.

- [ ] **Windows Distribution:**
    - [ ] Use NSIS or MSI to bundle the Go service + Tray binary.
    - [ ] Include automated TAP driver installation.
    - [ ] Configure "Start on Boot" registry keys correctly.
- [ ] **Linux:**
    - [ ] Create `.deb` and `.rpm` packages.
    - [ ] Configure `systemd` unit files during installation.

---

## 🧪 PHASE 9.5: ENDURANCE & QA
**Objective:** Ensure 99.9% uptime and zero memory leaks.

- [ ] **24-Hour Stress Test:**
    - [ ] Consistent 4K streaming while running 100+ TCP/UDP connections.
    - [ ] Profile memory usage over 24 hours to verify `sync.Pool` efficiency.
- [ ] **Browser Compatibility:**
    - [ ] Verify SSL/TLS intercept in Chrome, Firefox, Safari, and Brave.
    - [ ] Check for WebRTC leak prevention across all browsers.

---

## 📅 TIMELINE ESTIMATES
- **Visuals & UX:** 1 Week
- **WebSockets:** 3 Days
- **Ad-Block Features:** 4 Days
- **Packaging:** 2 Weeks
- **QA:** 1 Week

**Total Estimate:** ~5 Weeks to Production Ready.

---

## ✅ COMPLETION CRITERIA
1. [ ] One-click installer works on macOS and Windows.
2. [ ] Zero polling (WebSocket only) for status updates.
3. [ ] Professional icons in the system tray.
4. [ ] User can whitelist their own domains.
5. [ ] Service survives a 24-hour load test without crash.

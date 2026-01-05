# Dashboard Full Control Implementation Tasks

This document outlines the final engineering requirements to transform the AtlanticProxy dashboard from a basic status view into a high-control command center, following industry best practices for security and stability.

## Core Stability & Best Practice Requirements
*   **Idempotency**: Ensure all control actions (Toggles, Rotations) can be safely retried without state corruption.
*   **Fail-Safe Design**: If the proxy engine encounters an error, the Killswitch must remain in its strict state to prevent leaks.
*   **Cross-Platform Awareness**: Detect and report OS-specific limitations (e.g., `pf` vs `iptables` for Killswitch).
*   **State Persistence**: System should recover last-known state (Adblock on/off, Killswitch status) after a backend restart using the SQLite Store.

## Phase 1: Identity & Geo-Transparency (Target: 1-2 Days)
*Objective: Users must see exactly what the internet sees about them with 100% accuracy.*

- [x] **IP & ISP Insights Component**
    - [x] Add "Active Identity" card to the dashboard.
    - [x] **Stability**: Use a multi-source IP lookup (e.g., fallback between `ipinfo.io`, `icanhazip`, and `ip-api`) to handle provider downtime.
    - [x] Display Current Public IP (Residential IP).
    - [x] Display Detected ISP and ASN.
    - [x] Show Geo-Location (City, Country) with a small map indicator.
- [x] **Real-time Performance Monitor**
    - [x] Implement a rolling "ms" latency chart (Ping/Jitter).
    - [x] Add "Last Health Check" timestamp with auto-refresh every 30s.

## Phase 2: Security & Leak Protection (Target: 2-3 Days)
*Objective: Professional-grade leak detection and enforcement.*

- [x] **Anonymity Intelligence Logic**
    - [x] Create logic to calculate an "Anonymity Score" (0-100%) based on leaks and blacklist status.
    - [x] Return detailed status: "You are exposed" vs "You are anonymous".
- [x] **Status Endpoint Enhancement**
    - [x] Update `/status` or create `/security/status` to return real-time leak checks (DNS, WebRTC).
- [x] **Killswitch Controls**
    - [x] **Feature**: Add a physical-style toggle switch for "Strict Killswitch".
    - [x] **Implementation**:
        - [x] macOS: Use `pf` (Packet Filter) anchor injection.
        - [ ] Linux: Use `iptables` rules to drop non-tun traffic.
        - [ ] Windows: Use WFP (Windows Filtering Platform) API.
    - [x] **Strict Mode**: Ensure that when "Disconnect" is clicked, internet access is cut until reconnected (optional setting).

## Phase 3: Protocol & Manual Access (Target: 1 Day)
*Objective: Power users need access to the raw proxy credentials.*

- [x] **Protocol Detail View**
    - [x] Add a "Secret View" or "Advanced" tab/modal.
    - [x] **SOCKS5**: Display `127.0.0.1:1080` (or configured port).
    - [x] **Shadowsocks**: Display `base64` encoded `ss://` link for external clients (e.g., Potatso, Shadowrocket).
    - [x] **Features**:
        - [x] "Copy to Clipboard" buttons.
        - [ ] "Config Refresh" button to rotate credentials if compromised (later phase).
    - [ ] Add "Copy to Clipboard" with 30s secure clear.

## Phase 4: Service Management (Target: 2 Days)
*Objective: Granular control over the sidecar services.*

- [x] **Adblocker Command Center**
    - [x] Implement category-based toggles (Ads, Social, Malware).
    - [x] **Stability**: Ensure the "Custom Rules" list is validated on the backend before being applied to the engine.
    - [x] Show real-time "Requests Blocked" counter via WebSockets (Included in Usage Stats).
- [x] **IP Rotation Hub**
    - [x] Visual toggle for "Sticky" vs "Fast" rotation.
    - [x] Add "Rotation Countdown" timer with a manual override.

## Phase 5: Dashboard Integrity & Sync (Target: 1 Day)
- [x] **Robust WebSocket Pipeline**
    - [x] Update `ProxyStatus` to include `ProtectionLevel`.
    - [x] Implement "Reconnection Logic": If the WebSocket drops, the UI automatically reconnects.

---

### Technical Requirements
- **Backend**: Expose `internal/validator/leak_detector.go` results via `/api/security/leaks` endpoint.
- **Frontend**: Transition from "Mock Skeletons" to real data bindings for `IP`, `Location`, and `Killswitch`.

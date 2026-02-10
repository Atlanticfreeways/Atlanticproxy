do# WebSocket & Dashboard Connectivity - Implementation Tasks

**Priority:** HIGH  
**Estimated Time:** 4-6 hours  
**Status:** Not Started

---

## 🎯 Objective

Fix WebSocket real-time updates and ensure all dashboard tabs/buttons are fully functional with proper backend connectivity.

---

## 📋 Tasks Breakdown

### Phase 1: WebSocket Backend (1 hour)

#### 1.1 Verify WebSocket Endpoint
**File:** `scripts/proxy-client/internal/api/server.go`

- [ ] Confirm `/ws` endpoint is registered
- [ ] Verify WebSocket upgrader configuration
- [ ] Check CORS settings allow WebSocket connections
- [ ] Add authentication to WebSocket connections

**Code to verify:**
```go
router.GET("/ws", s.handleWebSocket)
```

#### 1.2 Status Broadcasting
**File:** `scripts/proxy-client/internal/api/server.go`

- [ ] Ensure status updates broadcast to all connected clients
- [ ] Add broadcast on connect/disconnect events
- [ ] Add broadcast on IP rotation
- [ ] Add broadcast on kill switch toggle
- [ ] Add error handling for failed broadcasts

**Events to broadcast:**
- Connection status change
- IP rotation complete
- Location change
- Security status update
- Kill switch toggle

---

### Phase 2: WebSocket Frontend (1.5 hours)

#### 2.1 Fix API Client WebSocket
**File:** `atlantic-dashboard/lib/api.ts`

- [ ] Update WebSocket URL to use correct port (8765)
- [ ] Add reconnection logic (retry 3 times, 2s delay)
- [ ] Add connection state management
- [ ] Add heartbeat/ping mechanism
- [ ] Handle connection errors gracefully

**Current issue:**
```typescript
// Change from:
this.wsUrl = baseUrl.replace('http', 'ws');

// To:
this.wsUrl = 'ws://localhost:8765';
```

#### 2.2 Re-enable WebSocket in Dashboard
**File:** `atlantic-dashboard/app/dashboard/page.tsx`

- [ ] Re-enable `subscribeToStatus()` call
- [ ] Remove manual polling after actions
- [ ] Add connection status indicator
- [ ] Handle WebSocket disconnection gracefully
- [ ] Add fallback to polling if WebSocket fails

**Code to add:**
```typescript
useEffect(() => {
    const unsubscribe = apiClient.subscribeToStatus((data) => {
        setStatus(data);
    });
    return () => unsubscribe();
}, []);
```

---

### Phase 3: Dashboard Tabs Connectivity (2 hours)

#### 3.1 Overview Tab (Dashboard Home)
**File:** `atlantic-dashboard/app/dashboard/page.tsx`

- [x] Connect button → `/api/proxy/connect`
- [x] Disconnect button → `/api/proxy/disconnect`
- [x] Rotate IP button → `/api/rotation/session/new`
- [ ] Real-time status updates via WebSocket
- [ ] Error handling with user feedback

#### 3.2 Locations Tab
**File:** `atlantic-dashboard/app/dashboard/locations/page.tsx`

- [ ] Fetch locations → `/api/locations/available`
- [ ] Connect to location → `/api/rotation/geo` + `/api/proxy/connect`
- [ ] Add to favorites → Local storage or API
- [ ] Search functionality (client-side)
- [ ] Loading states

#### 3.3 Protocol Tab
**File:** `atlantic-dashboard/app/dashboard/protocol/page.tsx`

- [ ] Fetch current protocol → `/api/protocol/current`
- [ ] Change protocol → `/api/protocol/set`
- [ ] Show credentials → `/api/protocol/credentials`
- [ ] Copy to clipboard functionality
- [ ] Plan-based access control (Personal+)

#### 3.4 IP Rotation Tab
**File:** `atlantic-dashboard/app/dashboard/rotation/page.tsx`

- [ ] Fetch config → `/api/rotation/config`
- [ ] Update mode → `/api/rotation/config` (POST)
- [ ] Force rotation → `/api/rotation/session/new`
- [ ] Fetch stats → `/api/rotation/stats`
- [ ] Real-time rotation events

#### 3.5 Security Tab
**File:** `atlantic-dashboard/app/dashboard/security/page.tsx`

- [ ] Fetch status → `/api/security/status`
- [ ] Toggle kill switch → `/api/killswitch`
- [ ] Run leak test → `/api/security/test`
- [ ] Real-time security updates
- [ ] Anonymity score display

#### 3.6 Ad-Blocking Tab
**File:** `atlantic-dashboard/app/dashboard/adblock/page.tsx`

- [ ] Fetch stats → `/adblock/stats`
- [ ] Toggle categories → `/adblock/categories`
- [ ] Fetch whitelist → `/adblock/whitelist`
- [ ] Add to whitelist → `/adblock/whitelist` (POST)
- [ ] Remove from whitelist → `/adblock/whitelist` (DELETE)
- [ ] Refresh lists → `/adblock/refresh`

#### 3.7 Statistics Tab
**File:** `atlantic-dashboard/app/dashboard/statistics/page.tsx`

- [ ] Fetch stats → `/api/statistics`
- [ ] Fetch hourly data → `/api/statistics/hourly`
- [ ] Fetch top countries → `/api/statistics/countries`
- [ ] Real-time data updates
- [ ] Chart rendering

#### 3.8 Servers Tab
**File:** `atlantic-dashboard/app/dashboard/servers/page.tsx`

- [ ] Fetch server list → `/api/servers/list`
- [ ] Fetch server status → `/api/servers/status`
- [ ] Connect to server → `/api/servers/connect`
- [ ] Real-time latency updates
- [ ] Server health indicators

#### 3.9 Settings Tab
**File:** `atlantic-dashboard/app/dashboard/settings/page.tsx`

- [ ] Fetch user settings → `/api/settings`
- [ ] Update settings → `/api/settings` (POST)
- [ ] Change password → `/api/auth/password`
- [ ] Update preferences → `/api/settings/preferences`
- [ ] Form validation

#### 3.10 Billing Tab
**File:** `atlantic-dashboard/app/dashboard/billing/page.tsx`

- [x] Fetch subscription → `/api/billing/subscription`
- [x] Fetch usage → `/api/billing/usage`
- [x] Cancel subscription → `/api/billing/cancel`
- [ ] Update payment method → `/api/billing/payment-method`
- [ ] View invoices → `/api/billing/invoices`

#### 3.11 Usage Tab
**File:** `atlantic-dashboard/app/dashboard/usage/page.tsx`

- [ ] Fetch usage data → `/api/billing/usage`
- [ ] Fetch protocol breakdown → `/api/statistics/protocols`
- [ ] Fetch daily usage → `/api/statistics/daily`
- [ ] Chart rendering
- [ ] Export data functionality

#### 3.12 Activity Tab
**File:** `atlantic-dashboard/app/dashboard/activity/page.tsx`

- [ ] Fetch activity log → `/api/activity/log`
- [ ] Filter by type → Query params
- [ ] Filter by date → Query params
- [ ] Pagination
- [ ] Real-time activity updates

---

### Phase 4: Missing API Endpoints (1 hour)

#### 4.1 Backend Endpoints to Add/Verify

**File:** `scripts/proxy-client/internal/api/server.go`

- [ ] `GET /api/protocol/current` - Get current protocol
- [ ] `POST /api/protocol/set` - Change protocol
- [ ] `GET /api/servers/list` - List available servers
- [ ] `GET /api/servers/status` - Server health status
- [ ] `POST /api/servers/connect` - Connect to specific server
- [ ] `GET /api/statistics/hourly` - Hourly statistics
- [ ] `GET /api/statistics/countries` - Top countries
- [ ] `GET /api/statistics/protocols` - Protocol breakdown
- [ ] `GET /api/statistics/daily` - Daily usage
- [ ] `GET /api/activity/log` - Activity log
- [ ] `GET /api/settings` - User settings
- [ ] `POST /api/settings` - Update settings
- [ ] `POST /api/settings/preferences` - Update preferences

---

### Phase 5: Error Handling & UX (30 min)

#### 5.1 Global Error Handler
- [ ] Add toast notifications for errors
- [ ] Add loading states to all buttons
- [ ] Add retry logic for failed requests
- [ ] Add offline detection
- [ ] Add connection status indicator

#### 5.2 Loading States
- [ ] Skeleton loaders for data fetching
- [ ] Button loading spinners
- [ ] Page-level loading indicators
- [ ] Optimistic UI updates

---

## 🧪 Testing Checklist

### WebSocket Testing
- [ ] Connect to WebSocket on dashboard load
- [ ] Receive status updates in real-time
- [ ] Reconnect after connection loss
- [ ] Handle multiple tabs (multiple connections)
- [ ] Graceful degradation to polling

### Dashboard Testing
- [ ] Test all 13 tabs load without errors
- [ ] Test all buttons trigger correct API calls
- [ ] Test all forms submit successfully
- [ ] Test error messages display correctly
- [ ] Test loading states work properly

### Integration Testing
- [ ] Connect → See status update via WebSocket
- [ ] Rotate IP → See new IP via WebSocket
- [ ] Toggle kill switch → See status change
- [ ] Change location → See location update
- [ ] All tabs show consistent data

---

## 📝 Implementation Order

### Day 1 (3 hours)
1. Fix WebSocket backend broadcasting
2. Fix WebSocket frontend connection
3. Re-enable WebSocket in dashboard
4. Test real-time updates

### Day 2 (3 hours)
5. Fix Locations tab connectivity
6. Fix Protocol tab connectivity
7. Fix IP Rotation tab connectivity
8. Fix Security tab connectivity

### Day 3 (2 hours)
9. Fix remaining tabs (Ad-blocking, Statistics, Servers)
10. Add missing API endpoints
11. Add error handling
12. Full integration testing

---

## 🚀 Quick Start

### 1. Backend WebSocket Fix
```bash
cd scripts/proxy-client
# Edit internal/api/server.go
# Verify /ws endpoint and broadcasting
go run ./cmd/service
```

### 2. Frontend WebSocket Fix
```bash
cd atlantic-dashboard
# Edit lib/api.ts
# Update WebSocket URL and reconnection logic
npm run dev
```

### 3. Test WebSocket
```bash
# Open browser console
# Navigate to http://localhost:3456/dashboard
# Check for WebSocket connection in Network tab
# Trigger connect/disconnect and verify real-time updates
```

---

## 📊 Success Criteria

- [ ] WebSocket connects automatically on dashboard load
- [ ] Status updates appear in real-time (no manual refresh)
- [ ] All 13 dashboard tabs load without errors
- [ ] All buttons trigger correct API calls
- [ ] All forms submit successfully
- [ ] Error messages display clearly
- [ ] Loading states work properly
- [ ] App works offline (graceful degradation)

---

## 🐛 Known Issues to Fix

1. **WebSocket URL hardcoded** - Should use env variable
2. **No reconnection logic** - Fails permanently on disconnect
3. **Dashboard polling removed** - Breaks when WebSocket fails
4. **Missing API endpoints** - Some tabs have no backend
5. **No error boundaries** - Crashes propagate to entire app
6. **No loading states** - Users don't know when data is loading

---

## 📁 Files to Modify

### Backend (3 files)
- `scripts/proxy-client/internal/api/server.go`
- `scripts/proxy-client/internal/api/websocket.go` (create if needed)
- `scripts/proxy-client/internal/api/handlers.go`

### Frontend (15 files)
- `atlantic-dashboard/lib/api.ts`
- `atlantic-dashboard/app/dashboard/page.tsx`
- `atlantic-dashboard/app/dashboard/locations/page.tsx`
- `atlantic-dashboard/app/dashboard/protocol/page.tsx`
- `atlantic-dashboard/app/dashboard/rotation/page.tsx`
- `atlantic-dashboard/app/dashboard/security/page.tsx`
- `atlantic-dashboard/app/dashboard/adblock/page.tsx`
- `atlantic-dashboard/app/dashboard/statistics/page.tsx`
- `atlantic-dashboard/app/dashboard/servers/page.tsx`
- `atlantic-dashboard/app/dashboard/settings/page.tsx`
- `atlantic-dashboard/app/dashboard/billing/page.tsx`
- `atlantic-dashboard/app/dashboard/usage/page.tsx`
- `atlantic-dashboard/app/dashboard/activity/page.tsx`
- `atlantic-dashboard/components/ui/toast.tsx` (create)
- `atlantic-dashboard/lib/websocket.ts` (create)

---

## 💡 Tips

1. **Start with WebSocket** - Get real-time updates working first
2. **Test incrementally** - Fix one tab at a time
3. **Use browser DevTools** - Monitor Network tab for API calls
4. **Add console.logs** - Debug WebSocket messages
5. **Test error cases** - Disconnect backend, test offline mode

---

**Status:** Ready to implement  
**Next Step:** Start with Phase 1 (WebSocket Backend)

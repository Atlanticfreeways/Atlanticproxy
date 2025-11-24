package main

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"
)

type SessionManager struct {
	sessions map[string]*Session
	mutex    sync.RWMutex
	ctx      context.Context
	cancel   context.CancelFunc
}

type Session struct {
	id           string
	provider     string
	endpoint     string
	cookies      []*http.Cookie
	headers      map[string]string
	client       *http.Client
	lastUsed     time.Time
	created      time.Time
	switchCount  int
	mutex        sync.RWMutex
}

type SessionSwitchEvent struct {
	sessionID    string
	fromProvider string
	toProvider   string
	timestamp    time.Time
	reason       string
}

func NewSessionManager() *SessionManager {
	ctx, cancel := context.WithCancel(context.Background())
	
	sm := &SessionManager{
		sessions: make(map[string]*Session),
		ctx:      ctx,
		cancel:   cancel,
	}
	
	return sm
}

func (sm *SessionManager) Start() error {
	fmt.Println("🔄 Starting Advanced Session Persistence...")
	
	// Start session maintenance
	go sm.sessionMaintenance()
	
	// Start session monitoring
	go sm.sessionMonitoring()
	
	fmt.Println("✅ Session persistence active - seamless provider switching enabled")
	return nil
}

func (sm *SessionManager) CreateSession(userID string) (*Session, error) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()
	
	sessionID := fmt.Sprintf("session_%s_%d", userID, time.Now().UnixNano())
	
	session := &Session{
		id:          sessionID,
		provider:    "oxylabs", // Start with primary provider
		endpoint:    "pr.oxylabs.io:7777",
		cookies:     make([]*http.Cookie, 0),
		headers:     make(map[string]string),
		lastUsed:    time.Now(),
		created:     time.Now(),
		switchCount: 0,
	}
	
	// Create HTTP client with session persistence
	session.client = sm.createSessionClient(session)
	
	sm.sessions[sessionID] = session
	
	fmt.Printf("🆕 Created session %s on %s\n", sessionID, session.provider)
	return session, nil
}

func (sm *SessionManager) createSessionClient(session *Session) *http.Client {
	jar := &SessionCookieJar{session: session}
	
	transport := &SessionTransport{
		session: session,
		base: &http.Transport{
			MaxIdleConns:       10,
			IdleConnTimeout:    30 * time.Second,
			DisableCompression: false,
		},
	}
	
	return &http.Client{
		Transport: transport,
		Jar:       jar,
		Timeout:   30 * time.Second,
	}
}

func (sm *SessionManager) SwitchProvider(sessionID, newProvider string) error {
	sm.mutex.RLock()
	session, exists := sm.sessions[sessionID]
	sm.mutex.RUnlock()
	
	if !exists {
		return fmt.Errorf("session not found: %s", sessionID)
	}
	
	session.mutex.Lock()
	defer session.mutex.Unlock()
	
	oldProvider := session.provider
	session.provider = newProvider
	session.endpoint = sm.getProviderEndpoint(newProvider)
	session.switchCount++
	
	// Update client with new provider
	session.client = sm.createSessionClient(session)
	
	// Log switch event
	event := SessionSwitchEvent{
		sessionID:    sessionID,
		fromProvider: oldProvider,
		toProvider:   newProvider,
		timestamp:    time.Now(),
		reason:       "manual_switch",
	}
	
	fmt.Printf("🔄 Session %s switched: %s → %s (switch #%d)\n", 
		sessionID, oldProvider, newProvider, session.switchCount)
	
	sm.logSwitchEvent(event)
	return nil
}

func (sm *SessionManager) getProviderEndpoint(provider string) string {
	endpoints := map[string]string{
		"oxylabs":    "pr.oxylabs.io:7777",
		"smartproxy": "gate.smartproxy.com:7000",
		"bright":     "zproxy.lum-superproxy.io:22225",
		"proxy6":     "proxy6.net:3128",
	}
	return endpoints[provider]
}

func (sm *SessionManager) GetSession(sessionID string) (*Session, error) {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()
	
	session, exists := sm.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}
	
	session.mutex.Lock()
	session.lastUsed = time.Now()
	session.mutex.Unlock()
	
	return session, nil
}

func (sm *SessionManager) sessionMaintenance() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-sm.ctx.Done():
			return
		case <-ticker.C:
			sm.cleanupExpiredSessions()
		}
	}
}

func (sm *SessionManager) cleanupExpiredSessions() {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()
	
	expired := make([]string, 0)
	
	for id, session := range sm.sessions {
		session.mutex.RLock()
		if time.Since(session.lastUsed) > 30*time.Minute {
			expired = append(expired, id)
		}
		session.mutex.RUnlock()
	}
	
	for _, id := range expired {
		delete(sm.sessions, id)
		fmt.Printf("🗑️  Cleaned up expired session: %s\n", id)
	}
}

func (sm *SessionManager) sessionMonitoring() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-sm.ctx.Done():
			return
		case <-ticker.C:
			sm.monitorSessions()
		}
	}
}

func (sm *SessionManager) monitorSessions() {
	sm.mutex.RLock()
	activeCount := len(sm.sessions)
	sm.mutex.RUnlock()
	
	fmt.Printf("📊 Active sessions: %d\n", activeCount)
}

func (sm *SessionManager) logSwitchEvent(event SessionSwitchEvent) {
	// In production, this would log to a proper logging system
	fmt.Printf("📝 Switch Event: %s (%s → %s) at %s\n", 
		event.sessionID, event.fromProvider, event.toProvider, 
		event.timestamp.Format("15:04:05"))
}

func (sm *SessionManager) Status() string {
	sm.mutex.RLock()
	defer sm.mutex.RUnlock()
	
	status := "🔄 ADVANCED SESSION PERSISTENCE STATUS\n"
	status += "====================================\n"
	
	providerCount := make(map[string]int)
	totalSwitches := 0
	
	for _, session := range sm.sessions {
		session.mutex.RLock()
		providerCount[session.provider]++
		totalSwitches += session.switchCount
		session.mutex.RUnlock()
	}
	
	status += fmt.Sprintf("Active Sessions: %d\n", len(sm.sessions))
	status += fmt.Sprintf("Total Provider Switches: %d\n", totalSwitches)
	status += "Provider Distribution:\n"
	
	for provider, count := range providerCount {
		status += fmt.Sprintf("  %s: %d sessions\n", provider, count)
	}
	
	return status
}

func (sm *SessionManager) Stop() {
	fmt.Println("🛑 Stopping session manager...")
	sm.cancel()
}

// SessionCookieJar maintains cookies across provider switches
type SessionCookieJar struct {
	session *Session
}

func (jar *SessionCookieJar) SetCookies(u *url.URL, cookies []*http.Cookie) {
	jar.session.mutex.Lock()
	defer jar.session.mutex.Unlock()
	
	jar.session.cookies = append(jar.session.cookies, cookies...)
}

func (jar *SessionCookieJar) Cookies(u *url.URL) []*http.Cookie {
	jar.session.mutex.RLock()
	defer jar.session.mutex.RUnlock()
	
	return jar.session.cookies
}

// SessionTransport maintains headers and connection state
type SessionTransport struct {
	session *Session
	base    http.RoundTripper
}

func (st *SessionTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	st.session.mutex.RLock()
	
	// Apply session headers
	for key, value := range st.session.headers {
		req.Header.Set(key, value)
	}
	
	// Add session tracking
	req.Header.Set("X-Atlantic-Session", st.session.id)
	req.Header.Set("X-Atlantic-Provider", st.session.provider)
	
	st.session.mutex.RUnlock()
	
	return st.base.RoundTrip(req)
}

func main() {
	sm := NewSessionManager()
	
	if err := sm.Start(); err != nil {
		fmt.Printf("Failed to start session manager: %v\n", err)
		return
	}
	
	// Demo: Create sessions and test provider switching
	fmt.Println("\n🧪 Testing Session Persistence...")
	
	// Create test sessions
	session1, _ := sm.CreateSession("user1")
	session2, _ := sm.CreateSession("user2")
	
	// Test provider switching
	fmt.Println("\n🔄 Testing Provider Switching...")
	sm.SwitchProvider(session1.id, "smartproxy")
	sm.SwitchProvider(session1.id, "bright")
	sm.SwitchProvider(session2.id, "proxy6")
	
	// Show status
	fmt.Printf("\n%s", sm.Status())
	
	// Keep running for demonstration
	time.Sleep(3 * time.Second)
	sm.Stop()
}
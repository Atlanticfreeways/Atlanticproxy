package billing

import (
	"sync"
	"time"
)

type UsageTracker struct {
	mu       sync.RWMutex
	sessions map[string]*SessionUsage
}

type SessionUsage struct {
	UserID          string
	SessionID       string
	BytesTransferred int64
	StartTime       time.Time
	LastUpdate      time.Time
	Protocol        string
	Location        string
}

func NewUsageTracker() *UsageTracker {
	return &UsageTracker{
		sessions: make(map[string]*SessionUsage),
	}
}

// StartSession begins tracking usage for a session
func (t *UsageTracker) StartSession(userID, sessionID, protocol, location string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	t.sessions[sessionID] = &SessionUsage{
		UserID:     userID,
		SessionID:  sessionID,
		StartTime:  time.Now(),
		LastUpdate: time.Now(),
		Protocol:   protocol,
		Location:   location,
	}
}

// RecordBytes adds bytes transferred to session
func (t *UsageTracker) RecordBytes(sessionID string, bytes int64) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	if session, exists := t.sessions[sessionID]; exists {
		session.BytesTransferred += bytes
		session.LastUpdate = time.Now()
	}
}

// EndSession stops tracking and returns final usage
func (t *UsageTracker) EndSession(sessionID string) *SessionUsage {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	session := t.sessions[sessionID]
	delete(t.sessions, sessionID)
	return session
}

// GetSessionUsage returns current usage for a session
func (t *UsageTracker) GetSessionUsage(sessionID string) *SessionUsage {
	t.mu.RLock()
	defer t.mu.RUnlock()
	
	return t.sessions[sessionID]
}

// GetUserTotalUsage calculates total usage for a user
func (t *UsageTracker) GetUserTotalUsage(userID string) int64 {
	t.mu.RLock()
	defer t.mu.RUnlock()
	
	var total int64
	for _, session := range t.sessions {
		if session.UserID == userID {
			total += session.BytesTransferred
		}
	}
	return total
}

// CalculateConnectionTime returns duration of session in seconds
func CalculateConnectionTime(session *SessionUsage) int64 {
	if session == nil {
		return 0
	}
	return int64(time.Since(session.StartTime).Seconds())
}

// CalculatePAYGCost calculates cost for PAYG users ($1.20/hour)
func CalculatePAYGCost(connectionSeconds int64) float64 {
	hours := float64(connectionSeconds) / 3600.0
	return hours * 1.20
}

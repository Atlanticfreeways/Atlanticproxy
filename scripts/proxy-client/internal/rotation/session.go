package rotation

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// Session represents a rotating IP session
type Session struct {
	ID        string
	CreatedAt time.Time
	ExpiresAt time.Time
	Duration  time.Duration
	IP        string // This might be filled after the first request or determined by the proxy
	Location  string // Country/City
}

// NewSession creates a new session with the specified duration
func NewSession(duration time.Duration) *Session {
	id := generateSessionID()
	now := time.Now()

	expiresAt := time.Time{}
	if duration > 0 {
		expiresAt = now.Add(duration)
	}

	return &Session{
		ID:        id,
		CreatedAt: now,
		ExpiresAt: expiresAt,
		Duration:  duration,
	}
}

// generateSessionID generates a random alphanumeric string for session ID
func generateSessionID() string {
	bytes := make([]byte, 6) // 6 bytes = 12 hex characters
	if _, err := rand.Read(bytes); err != nil {
		// Fallback if random fails, though unlikely
		return "session-" + time.Now().Format("20060102150405")
	}
	return hex.EncodeToString(bytes)
}

// IsExpired checks if the current session has expired
func (s *Session) IsExpired() bool {
	if s.Duration == 0 {
		return true // 0 means per-request, so it expires immediately after use
	}
	return time.Now().After(s.ExpiresAt)
}

// TimeRemaining returns the duration until the session expires
func (s *Session) TimeRemaining() time.Duration {
	if s.Duration == 0 {
		return 0
	}
	remaining := time.Until(s.ExpiresAt)
	if remaining < 0 {
		return 0
	}
	return remaining
}

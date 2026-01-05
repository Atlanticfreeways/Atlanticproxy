package rotation

import (
	"errors"
	"sync"
	"time"
)

// RotationMode defines the IP rotation strategy
type RotationMode string

const (
	ModePerRequest  RotationMode = "per-request"
	ModeSticky1Min  RotationMode = "sticky-1min"
	ModeSticky10Min RotationMode = "sticky-10min"
	ModeSticky30Min RotationMode = "sticky-30min"
)

// RotationConfig holds configuration for the rotation manager
type RotationConfig struct {
	Mode    RotationMode
	Country string
	City    string
	State   string
}

// Manager handles IP rotation logic and session management
type Manager struct {
	mu             sync.RWMutex
	config         RotationConfig
	currentSession *Session
	analytics      *AnalyticsManager
	stopChan       chan struct{}
}

// NewManager creates a new rotation manager with default settings
func NewManager(analytics *AnalyticsManager) *Manager {
	return &Manager{
		config: RotationConfig{
			Mode: ModePerRequest, // Default mode
		},
		analytics: analytics,
		stopChan:  make(chan struct{}),
	}
}

// SetMode updates the rotation mode and triggers a rotation if needed
func (m *Manager) SetMode(mode RotationMode) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Validate mode
	switch mode {
	case ModePerRequest, ModeSticky1Min, ModeSticky10Min, ModeSticky30Min:
		m.config.Mode = mode
	default:
		return errors.New("invalid rotation mode")
	}

	// Force a new session when mode changes
	return m.forceRotationLocked()
}

// GetCurrentSession returns the active session, creating one if needed
func (m *Manager) GetCurrentSession() (*Session, error) {
	m.mu.RLock()
	if m.currentSession != nil && !m.currentSession.IsExpired() {
		defer m.mu.RUnlock()
		return m.currentSession, nil
	}
	m.mu.RUnlock()

	// Need to create a new session
	m.mu.Lock()
	defer m.mu.Unlock()

	// Double check after acquiring write lock
	if m.currentSession != nil && !m.currentSession.IsExpired() {
		return m.currentSession, nil
	}

	if err := m.forceRotationLocked(); err != nil {
		return nil, err
	}

	return m.currentSession, nil
}

// ForceRotation forces a new session to be generated immediately
func (m *Manager) ForceRotation() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.forceRotationLocked()
}

// forceRotationLocked is the internal implementation of ForceRotation
// Must be called with lock held
func (m *Manager) forceRotationLocked() error {
	var duration time.Duration

	switch m.config.Mode {
	case ModePerRequest:
		duration = 0 // Or very short
	case ModeSticky1Min:
		duration = 1 * time.Minute
	case ModeSticky10Min:
		duration = 10 * time.Minute
	case ModeSticky30Min:
		duration = 30 * time.Minute
	}

	session := NewSession(duration)
	m.currentSession = session

	if m.analytics != nil {
		m.analytics.TrackRotation(session.ID, "forced", m.config.Mode, m.config.Country)
	}

	return nil
}

// UpdateConfig updates the full configuration including geo-targeting
func (m *Manager) UpdateConfig(config RotationConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Validate mode
	switch config.Mode {
	case ModePerRequest, ModeSticky1Min, ModeSticky10Min, ModeSticky30Min:
		// valid
	default:
		return errors.New("invalid rotation mode")
	}

	m.config = config
	// Force rotation to apply new geo settings immediately
	return m.forceRotationLocked()
}

// GetConfig returns the current configuration
func (m *Manager) GetConfig() RotationConfig {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.config
}

// Close stops any background processes
func (m *Manager) Close() {
	close(m.stopChan)
}

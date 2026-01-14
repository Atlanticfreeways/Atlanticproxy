package rotation

import (
	"testing"
)

// Mocking time and behavior is simpler by just testing the logic directly
// since the Manager struct seems to handle state internally.

func TestRotationModeSwitching(t *testing.T) {
	m := NewManager(nil)

	// 1. Default should be PerRequest
	if m.config.Mode != ModePerRequest {
		t.Errorf("Expected default mode %s, got %s", ModePerRequest, m.config.Mode)
	}

	// 2. Switch to Sticky
	err := m.SetMode(ModeSticky10Min)
	if err != nil {
		t.Fatalf("Failed to set mode: %v", err)
	}

	m.mu.RLock()
	mode := m.config.Mode
	m.mu.RUnlock()

	if mode != ModeSticky10Min {
		t.Errorf("Expected mode %s, got %s", ModeSticky10Min, mode)
	}

	// 3. Invalid Mode
	err = m.SetMode("invalid-mode")
	if err == nil {
		t.Error("Expected error for invalid mode, got nil")
	}
}

func TestSessionGeneration(t *testing.T) {
	m := NewManager(nil)

	// Initial session
	proxy, err := m.GetCurrentSession()
	if err != nil {
		t.Fatalf("Failed to get initial proxy: %v", err)
	}

	initialID := ""
	// The proxy variable here is actually a *Session struct based on GetCurrentSession return signature
	if proxy == nil {
		t.Fatal("Expected proxy session, got nil")
	}

	// For per-request, subsequent calls should ideally return different credentials/params
	// but without mocking uuid/rand, it might be hard to deterministically test "difference".
	// However, we can test state changes on ForceRotation.

	m.SetMode(ModeSticky30Min)
	m.mu.RLock()
	initialID = m.currentSession.ID
	m.mu.RUnlock()

	if initialID == "" {
		t.Error("Expected session ID to be set after sticky mode init")
	}

	// Force rotation
	m.ForceRotation()

	m.mu.RLock()
	nextID := m.currentSession.ID
	m.mu.RUnlock()

	if initialID == nextID {
		t.Error("Expected session ID to change after forced rotation")
	}
}

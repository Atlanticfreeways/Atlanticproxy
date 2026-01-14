package rotation

import (
	"testing"
	"time"
)

func TestNewManager(t *testing.T) {
	manager := NewManager(nil)
	if manager == nil {
		t.Fatal("NewManager returned nil")
	}
	if manager.config.Mode != ModePerRequest {
		t.Errorf("Expected default mode %s, got %s", ModePerRequest, manager.config.Mode)
	}
}

func TestSetMode(t *testing.T) {
	manager := NewManager(nil)
	err := manager.SetMode(ModeSticky10Min)
	if err != nil {
		t.Fatalf("SetMode failed: %v", err)
	}
	if manager.config.Mode != ModeSticky10Min {
		t.Errorf("Expected mode %s, got %s", ModeSticky10Min, manager.config.Mode)
	}

	// Check if session was created
	session, err := manager.GetCurrentSession()
	if err != nil {
		t.Fatalf("GetCurrentSession failed: %v", err)
	}
	if session == nil {
		t.Fatal("Session should not be nil after SetMode")
	}

	// Test invalid mode
	err = manager.SetMode("invalid-mode")
	if err == nil {
		t.Error("SetMode should have failed with invalid mode")
	}
}

func TestSessionExpiration(t *testing.T) {
	// Create a session with very short duration
	session := NewSession(100 * time.Millisecond)

	if session.IsExpired() {
		t.Error("New session should not be expired immediately")
	}

	time.Sleep(200 * time.Millisecond)

	if !session.IsExpired() {
		t.Error("Session should be expired after duration")
	}
}

func TestManagerRotation(t *testing.T) {
	manager := NewManager(nil)
	manager.SetMode(ModeSticky1Min)

	session1, _ := manager.GetCurrentSession()
	if session1 == nil {
		t.Fatal("First session is nil")
	}

	// Force rotation
	manager.ForceRotation()

	session2, _ := manager.GetCurrentSession()
	if session2 == nil {
		t.Fatal("Second session is nil")
	}

	if session1.ID == session2.ID {
		t.Error("Session ID should change after rotation")
	}
}

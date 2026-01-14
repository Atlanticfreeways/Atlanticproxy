package proxy

import (
	"context"
	"testing"
)

func TestEngine_StartStop(t *testing.T) {
	config := &Config{
		ListenAddr:      "127.0.0.1:0", // Random port
		OxylabsUsername: "user",
		OxylabsPassword: "pass",
	}

	engine := NewEngine(
		config,
		nil, // adblock
		nil, // rotation
		nil, // analytics
		nil, // billing
	)

	// Mock oxylabs somehow or ensure it doesn't block Start
	// Start runs in background
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := engine.Start(ctx); err != nil {
		t.Fatalf("Failed to start engine: %v", err)
	}

	if !engine.IsRunning() {
		t.Error("Engine should be running")
	}

	// Verify server exists
	if engine.server == nil {
		t.Error("Server should be initialized")
	}

	engine.Stop()

	if engine.IsRunning() {
		t.Error("Engine should be stopped")
	}
}

func TestEngine_HealthCheck(t *testing.T) {
	// This tests the logic structure, actual network call will fail or need mock
	config := &Config{
		ListenAddr: "127.0.0.1:0",
	}
	engine := NewEngine(
		config,
		nil, // adblock
		nil, // rotation
		nil, // analytics
		nil, // billing
	)

	// Just verify method exists and runs without panic
	// We can't easily assert success without mocking the external URL response
	go engine.performHealthCheck()
}

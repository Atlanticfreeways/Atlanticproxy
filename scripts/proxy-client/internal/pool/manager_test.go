package pool

import (
	"context"
	"testing"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

func TestManager_Start(t *testing.T) {
	oxylabsClient := oxylabs.NewClient("user", "pass")
	config := &Config{
		MinConnections: 2,
		MaxConnections: 5,
		IdleTimeout:    time.Second,
	}

	manager := NewManager(config, oxylabsClient)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := manager.Start(ctx); err != nil {
		t.Fatalf("Failed to start manager: %v", err)
	}

	// Verify we have connections in pool
	if len(manager.clients) != 2 {
		t.Errorf("Expected 2 clients in pool, got %d", len(manager.clients))
	}
}

func TestManager_GetReleaseSimple(t *testing.T) {
	oxylabsClient := oxylabs.NewClient("user", "pass")
	config := &Config{
		MinConnections: 1,
		MaxConnections: 2,
	}
	manager := NewManager(config, oxylabsClient)
	ctx := context.Background()
	manager.Start(ctx)

	client, err := manager.GetClient(ctx)
	if err != nil {
		t.Fatalf("GetClient failed: %v", err)
	}
	if client == nil {
		t.Fatal("Client is nil")
	}

	manager.ReleaseClient(client)
	if len(manager.clients) == 0 {
		t.Error("Client should be returned to pool")
	}
}

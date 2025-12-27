package oxylabs

import (
	"context"
	"testing"
)

func TestClient_GetProxy(t *testing.T) {
	client := NewClient("user", "pass")

	proxyURL, err := client.GetProxy(context.Background())
	if err != nil {
		t.Fatalf("Failed to get proxy: %v", err)
	}

	if proxyURL.User.Username() != "user" {
		t.Errorf("Expected username 'user', got %s", proxyURL.User.Username())
	}
}

func TestClient_EndpointManagement(t *testing.T) {
	client := NewClient("user", "pass")

	initialCount := len(client.endpoints)

	client.AddEndpoint("new.endpoint:8080")
	if len(client.endpoints) != initialCount+1 {
		t.Error("Endpoint not added")
	}

	client.RemoveEndpoint("new.endpoint:8080")
	if len(client.endpoints) != initialCount {
		t.Error("Endpoint not removed")
	}
}

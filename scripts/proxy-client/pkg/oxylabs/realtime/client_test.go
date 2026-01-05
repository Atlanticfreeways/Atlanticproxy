package realtime

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

func TestClient_FetchURL(t *testing.T) {
	// Mock server to simulate Oxylabs Realtime API
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request
		if r.Method != "POST" {
			t.Errorf("Expected POST request, got %s", r.Method)
		}
		if r.URL.Path != "/v1/queries" {
			t.Errorf("Expected path /v1/queries, got %s", r.URL.Path)
		}
		auth := r.Header.Get("Authorization")
		if auth != "Bearer test-api-key" {
			t.Errorf("Expected Authorization header 'Bearer test-api-key', got '%s'", auth)
		}

		// Mock response body
		responseJSON := `{
			"results": [
				{
					"content": "<html><body>Mock Content</body></html>",
					"status_code": 200,
					"url": "https://example.com"
				}
			]
		}`
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(responseJSON))
	}))
	defer mockServer.Close()

	// Initialize client with mock server endpoint
	client := NewClient("test-api-key")
	client.endpoint = mockServer.URL + "/v1/queries"

	// Test FetchURL
	ctx := context.Background()
	config := oxylabs.ProxyConfig{Country: "US"}
	resp, err := client.FetchURL(ctx, "https://example.com", config)
	if err != nil {
		t.Fatalf("FetchURL failed: %v", err)
	}
	defer resp.Body.Close()

	// Verify response
	if resp.StatusCode != 200 {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response body: %v", err)
	}

	expectedContent := "<html><body>Mock Content</body></html>"
	if string(body) != expectedContent {
		t.Errorf("Expected body '%s', got '%s'", expectedContent, string(body))
	}
}

func TestClient_FetchURL_Error(t *testing.T) {
	// Mock server simulating error
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Unauthorized"))
	}))
	defer mockServer.Close()

	client := NewClient("invalid-key")
	client.endpoint = mockServer.URL

	resp, err := client.FetchURL(context.Background(), "https://example.com", oxylabs.ProxyConfig{})

	// Implementation note: The client returns the response if the API call completes, even if status is not 200
	// So we expect err == nil and resp.StatusCode == 401
	if err != nil {
		t.Fatalf("Expected no error (client should return response), got: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", resp.StatusCode)
	}
}

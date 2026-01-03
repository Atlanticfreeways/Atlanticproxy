package providers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

func TestPIAProvider(t *testing.T) {
	// Mock PIA API server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("apikey") != "test-key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "text/plain")
		w.Write([]byte("1.2.3.4:5678"))
	}))
	defer ts.Close()

	provider := NewPIAProvider("test-key")
	provider.BaseURL = ts.URL

	proxyURL, err := provider.GetProxy(context.Background(), oxylabs.ProxyConfig{Country: "US"})
	if err != nil {
		t.Fatalf("GetProxy failed: %v", err)
	}

	if proxyURL.Host != "1.2.3.4:5678" {
		t.Errorf("Expected host 1.2.3.4:5678, got %s", proxyURL.Host)
	}
}

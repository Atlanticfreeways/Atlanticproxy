package proxy

import (
	"log"
	"net/http"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/atlanticproxy/proxy-client/pkg/oxylabs/realtime"
	"github.com/elazarl/goproxy"
)

type RealtimeAdapter struct {
	client *realtime.Client
}

func NewRealtimeAdapter(apiKey string) *RealtimeAdapter {
	return &RealtimeAdapter{
		client: realtime.NewClient(apiKey),
	}
}

// HandleRequest intercepts the request and uses the Realtime API to fetch the content
// It returns a response and nil error if successful, or nil response and error/nil if it shouldn't handle it
func (a *RealtimeAdapter) HandleRequest(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	// Only handle if this mode is active (can be checked via context or config)
	// For now, we assume if this handler is called, it should try to fetch.

	// Extract geo configuration from context or headers
	geo := req.Header.Get("X-Proxy-Country")
	config := oxylabs.ProxyConfig{
		Country: geo,
	}

	log.Printf("[RealtimeAdapter] Fetching %s via Crawler API (Geo: %s)", req.URL.String(), geo)

	resp, err := a.client.FetchURL(req.Context(), req.URL.String(), config)
	if err != nil {
		log.Printf("[RealtimeAdapter] Error fetching URL: %v", err)
		// Return specific error response
		return req, goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusBadGateway, "Crawler API Error: "+err.Error())
	}

	return req, resp
}

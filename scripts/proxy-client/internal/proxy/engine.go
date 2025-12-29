package proxy

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/elazarl/goproxy"
)

type Config struct {
	OxylabsUsername string
	OxylabsPassword string
	ListenAddr      string
	HealthCheckURL  string
}

type Engine struct {
	config           *Config
	oxylabs          *oxylabs.Client
	adblock          *adblock.Engine
	rotationManager  *rotation.Manager
	analyticsManager *rotation.AnalyticsManager
	billingManager   *billing.Manager
	proxy            *goproxy.ProxyHttpServer
	server           *http.Server
	healthCheck      *time.Ticker
	transport        *http.Transport
	mu               sync.RWMutex
	running          bool
}

func NewEngine(config *Config, adblocker *adblock.Engine, rm *rotation.Manager, am *rotation.AnalyticsManager, bm *billing.Manager) *Engine {
	if config == nil {
		config = &Config{
			ListenAddr:     "127.0.0.1:8080",
			HealthCheckURL: "https://httpbin.org/ip",
		}
	}

	oxylabsClient := oxylabs.NewClient(config.OxylabsUsername, config.OxylabsPassword)

	proxy := goproxy.NewProxyHttpServer()
	proxy.Verbose = false

	// Initialize shared transport for connection pooling
	transport := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
		ForceAttemptHTTP2:   true,
	}

	engine := &Engine{
		config:           config,
		oxylabs:          oxylabsClient,
		adblock:          adblocker,
		rotationManager:  rm,
		analyticsManager: am,
		billingManager:   bm,
		proxy:            proxy,
		transport:        transport,
	}


	// Set proxy function to use cached oxylabs proxies with rotation logic
	transport.Proxy = func(req *http.Request) (*url.URL, error) {
		proxyConfig := oxylabs.ProxyConfig{}
		
		if engine.rotationManager != nil {
			// Get current config to check mode and geo
			rotConfig := engine.rotationManager.GetConfig()
			proxyConfig.Country = rotConfig.Country
			proxyConfig.City = rotConfig.City
			proxyConfig.State = rotConfig.State
			
			// Handle sessions
			session, err := engine.rotationManager.GetCurrentSession()
			if err == nil && session != nil {
				proxyConfig.SessionID = session.ID
				proxyConfig.SessionTime = int(session.TimeRemaining().Minutes())
			}
		}

		return engine.oxylabs.GetProxyWithConfig(req.Context(), proxyConfig)
	}

	return engine
}

func (e *Engine) Start(ctx context.Context) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.running {
		return fmt.Errorf("proxy engine already running")
	}

	// Configure proxy handlers
	e.setupProxyHandlers()

	// Create HTTP server
	e.server = &http.Server{
		Addr:    e.config.ListenAddr,
		Handler: e.proxy,
	}

	// Start health checking
	e.healthCheck = time.NewTicker(30 * time.Second)
	go e.runHealthCheck(ctx)

	// Start server
	go func() {
		if err := e.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			// Log error but don't stop the service
			fmt.Printf("Proxy server error: %v\n", err)
		}
	}()

	e.running = true
	return nil
}

func (e *Engine) setupProxyHandlers() {
	// Handle HTTPS CONNECT requests
	e.proxy.OnRequest().HandleConnect(goproxy.AlwaysMitm)

	// Handle HTTP requests
	e.proxy.OnRequest().DoFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		// Ad-blocking check
		if e.adblock != nil && e.adblock.HTTPFilter.ShouldBlockRequest(req) {
			return req, goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusForbidden, "Blocked by Atlantic AdBlock")
		}

		// Use shared transport for connection pooling
		ctx.RoundTripper = goproxy.RoundTripperFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Response, error) {
			// Billing: Check Quota
			if e.billingManager != nil {
				if err := e.billingManager.CanAcceptConnection(); err != nil {
					return nil, err // This might need a better error response for goproxy
				}
				e.billingManager.Usage.AddRequest()
			}

			resp, err := e.transport.RoundTrip(req)
			
			// Analytics
			if e.analyticsManager != nil {
				if err != nil {
					e.analyticsManager.TrackFailure()
				} else {
					e.analyticsManager.TrackSuccess()
				}
			}

			// Billing: Track Bytes
			if e.billingManager != nil && resp != nil {
				// Simple estimation for now: ContentLength if available
				if resp.ContentLength > 0 {
					e.billingManager.Usage.AddData(resp.ContentLength)
				}
			}
			
			return resp, err
		})

		return req, nil
	})



	// Handle responses
	e.proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
		// Add headers to indicate proxy usage
		if resp != nil {
			resp.Header.Set("X-Atlantic-Proxy", "active")
		}
		return resp
	})
}

func (e *Engine) runHealthCheck(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case <-e.healthCheck.C:
			e.performHealthCheck()
		}
	}
}

func (e *Engine) performHealthCheck() {
	// Create client using shared transport to reuse connection pool
	client := &http.Client{
		Transport: e.transport,
		Timeout:   10 * time.Second,
	}

	// Test request
	resp, err := client.Get(e.config.HealthCheckURL)
	if err != nil {
		fmt.Printf("Proxy health check failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		fmt.Println("Proxy health check passed")
	} else {
		fmt.Printf("Proxy health check failed with status: %d\n", resp.StatusCode)
	}
}


func (e *Engine) Stop() {
	e.mu.Lock()
	defer e.mu.Unlock()

	if !e.running {
		return
	}

	if e.healthCheck != nil {
		e.healthCheck.Stop()
	}

	if e.server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		e.server.Shutdown(ctx)
	}

	e.running = false
}

func (e *Engine) IsRunning() bool {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.running
}

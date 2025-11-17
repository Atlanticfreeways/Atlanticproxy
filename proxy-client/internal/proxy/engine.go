package proxy

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
	"github.com/elazarl/goproxy"
)

type Config struct {
	OxylabsUsername string
	OxylabsPassword string
	ListenAddr      string
	HealthCheckURL  string
}

type Engine struct {
	config      *Config
	oxylabs     *oxylabs.Client
	proxy       *goproxy.ProxyHttpServer
	server      *http.Server
	healthCheck *time.Ticker
	mu          sync.RWMutex
	running     bool
}

func NewEngine(config *Config) *Engine {
	if config == nil {
		config = &Config{
			ListenAddr:     "127.0.0.1:8080",
			HealthCheckURL: "https://httpbin.org/ip",
		}
	}

	oxylabsClient := oxylabs.NewClient(config.OxylabsUsername, config.OxylabsPassword)
	
	proxy := goproxy.NewProxyHttpServer()
	proxy.Verbose = false

	return &Engine{
		config:  config,
		oxylabs: oxylabsClient,
		proxy:   proxy,
	}
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
		// Get Oxylabs proxy
		proxyURL, err := e.oxylabs.GetProxy(context.Background())
		if err != nil {
			return req, goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusBadGateway, "Proxy unavailable")
		}

		// Set proxy for this request
		ctx.RoundTripper = goproxy.RoundTripperFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Response, error) {
			client := &http.Client{
				Transport: &http.Transport{
					Proxy: http.ProxyURL(proxyURL),
				},
			}
			return client.Do(req)
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
	// Test proxy connectivity
	proxyURL, err := e.oxylabs.GetProxy(context.Background())
	if err != nil {
		fmt.Printf("Health check failed: %v\n", err)
		return
	}

	// Create client with proxy
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
		Timeout: 10 * time.Second,
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
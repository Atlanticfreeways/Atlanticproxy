package proxy

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/adblock"
	"github.com/atlanticproxy/proxy-client/internal/billing"
	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/atlanticproxy/proxy-client/pkg/cert"
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
	config           *Config
	oxylabs          *oxylabs.Client
	adblock          *adblock.Engine
	rotationManager  *rotation.Manager
	analyticsManager *rotation.AnalyticsManager
	billingManager   *billing.Manager
	proxy            *goproxy.ProxyHttpServer
	server           *http.Server
	socks5           *Socks5Server
	shadowsocks      *ShadowsocksServer
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

	// Initialize SOCKS5 server
	socks5, err := NewSocks5Server("127.0.0.1:1080", oxylabsClient, bm)
	if err == nil {
		engine.socks5 = socks5
	}

	// Initialize Shadowsocks server (Premium Only)
	// Method: chacha20-ietf-poly1305, Password: proxy-secret
	ss, err := NewShadowsocksServer("0.0.0.0:8388", "AEAD_CHACHA20_IETF_POLY1305", "proxy-secret", oxylabsClient, bm)
	if err == nil {
		engine.shadowsocks = ss
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
			fmt.Printf("HTTP Proxy error: %v\n", err)
		}
	}()

	// Start SOCKS5 server
	if e.socks5 != nil {
		go func() {
			if err := e.socks5.Start(ctx); err != nil {
				fmt.Printf("SOCKS5 Proxy error: %v\n", err)
			}
		}()
	}

	// Start Shadowsocks server
	if e.shadowsocks != nil {
		go func() {
			if err := e.shadowsocks.Start(ctx); err != nil {
				fmt.Printf("Shadowsocks Proxy error: %v\n", err)
			}
		}()
	}

	e.running = true
	return nil
}

func (e *Engine) setupProxyHandlers() {
	// Handle HTTPS CONNECT requests
	// Configure Root CA for MITM
	certPEM, keyPEM, err := cert.GetCA()
	if err == nil {
		ca, err := tls.X509KeyPair(certPEM, keyPEM)
		if err == nil {
			if leaf, err := x509.ParseCertificate(ca.Certificate[0]); err == nil {
				ca.Leaf = leaf
				goproxy.GoproxyCa = ca
				e.proxy.OnRequest().HandleConnect(goproxy.AlwaysMitm)
			}
		}
	}

	if goproxy.GoproxyCa.Leaf == nil {
		// Fallback to default if custom fails
		e.proxy.OnRequest().HandleConnect(goproxy.AlwaysMitm)
	}

	// Handle HTTP requests
	e.proxy.OnRequest().DoFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		// Ad-blocking check
		if e.adblock != nil && e.adblock.HTTPFilter.ShouldBlockRequest(req) {
			return req, NewBlockedResponse(
				req,
				"Content Blocked",
				"🛡️",
				fmt.Sprintf("Access to <b>%s</b> has been restricted by your AtlanticProxy Ad-Blocking rules.", req.Host),
				"Manage Filters",
			)
		}

		// Use shared transport for connection pooling
		ctx.RoundTripper = goproxy.RoundTripperFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Response, error) {
			// Billing: Check Quota
			if e.billingManager != nil {
				if err := e.billingManager.CanAcceptConnection(); err != nil {
					// Serve intercept page instead of error
					return NewBlockedResponse(
						req,
						"Quota Exceeded",
						"💳",
						"You've reached the data or connection limit for your current plan. Upgrade now to restore access.",
						"Upgrade Plan",
					), nil
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
				// Estimate data if ContentLength is missing
				size := resp.ContentLength
				if size <= 0 {
					size = 5120 // 5KB estimate for chunks/dynamic
				}
				e.billingManager.Usage.AddData(size)
			}

			return resp, err
		})

		return req, nil
	})

	// Handle responses
	e.proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
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

package oxylabs

import (
	"context"
	"crypto/tls"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

type Client struct {
	username     string
	password     string
	endpoints    []string
	sessionID    string
	mu           sync.RWMutex
	healthy      map[string]bool
	cachedProxy  *url.URL
	lastUpdate   time.Time
	cacheTimeout time.Duration
}

// ProxyConfig holds optional parameters for proxy generation
type ProxyConfig struct {
	SessionID   string
	Country     string
	City        string
	State       string
	SessionTime int // Duration in minutes for sticky sessions
}

func NewClient(username, password string) *Client {
	return &Client{
		username: username,
		password: password,
		endpoints: []string{
			"79.127.141.221:7777", // Pre-resolved IP (geo0node.com)
			"pr.oxylabs.io:7777",  // Standard
			"pr.oxylabs.io:8000",  // Standard (Alternative)
		},
		healthy:      make(map[string]bool),
		cacheTimeout: 30 * time.Second,
	}
}

// GetProxy returns a proxy URL, using cache if available and valid
func (c *Client) GetProxy(ctx context.Context) (*url.URL, error) {
	// Default behavior uses empty config
	return c.GetProxyWithConfig(ctx, ProxyConfig{})
}

// GetProxyWithConfig returns a proxy URL with specific configuration (session, geo, etc)
func (c *Client) GetProxyWithConfig(ctx context.Context, config ProxyConfig) (*url.URL, error) {
	c.mu.RLock()
	// Only use cache if no specific session/geo config is requested, or if it matches (handling logic omitted for brevity)
	// For now, if config is provided, we bypass cache or checking it is complex.
	// Simplified: if config is empty, use standard cache logic.
	useCache := config.SessionID == "" && config.Country == ""

	if useCache && c.cachedProxy != nil && time.Since(c.lastUpdate) < c.cacheTimeout {
		proxy := c.cachedProxy
		c.mu.RUnlock()
		return proxy, nil
	}
	c.mu.RUnlock()

	c.mu.Lock()
	defer c.mu.Unlock()

	// Double check cache
	if useCache && c.cachedProxy != nil && time.Since(c.lastUpdate) < c.cacheTimeout {
		return c.cachedProxy, nil
	}

	if len(c.endpoints) == 0 {
		return nil, fmt.Errorf("no proxy endpoints available")
	}

	// Format username with parameters
	// Format: customer-USERNAME-cc-COUNTRY-city-CITY-st-STATE-sessid-SESSIONID-sesstime-TIME
	var sb strings.Builder

	// Handle customer prefix (ensure no double prefix)
	if strings.HasPrefix(c.username, "customer-") {
		sb.WriteString(c.username)
	} else {
		sb.WriteString("customer-")
		sb.WriteString(c.username)
	}

	if config.Country != "" {
		sb.WriteString("-cc-")
		sb.WriteString(strings.ToUpper(config.Country))
	}
	if config.City != "" {
		sb.WriteString("-city-")
		sb.WriteString(strings.ToLower(config.City))
	}
	if config.State != "" {
		sb.WriteString("-st-")
		sb.WriteString(strings.ToLower(config.State))
	}

	// Add session ID if provided, otherwise use client's default if set
	sessID := config.SessionID
	if sessID == "" {
		sessID = c.sessionID
	}
	if sessID != "" {
		sb.WriteString("-sessid-")
		sb.WriteString(sessID)
	}

	if config.SessionTime > 0 {
		sb.WriteString(fmt.Sprintf("-sesstime-%d", config.SessionTime))
	}

	finalUsername := sb.String()

	// Select endpoint
	// If mobile/residential specific logic needed, select passed port
	// For now random healthy
	endpoint := c.selectHealthyEndpoint()

	proxyURL := &url.URL{
		Scheme: "http",
		Host:   endpoint,
		User:   url.UserPassword(finalUsername, c.password),
	}

	if useCache {
		c.cachedProxy = proxyURL
		c.lastUpdate = time.Now()
	}

	return proxyURL, nil
}

func (c *Client) selectHealthyEndpoint() string {
	var healthyEndpoints []string
	for _, endpoint := range c.endpoints {
		if healthy, exists := c.healthy[endpoint]; !exists || healthy {
			healthyEndpoints = append(healthyEndpoints, endpoint)
		}
	}

	if len(healthyEndpoints) == 0 {
		healthyEndpoints = c.endpoints
	}

	return healthyEndpoints[rand.Intn(len(healthyEndpoints))]
}

func (c *Client) MarkHealthy(endpoint string, healthy bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.healthy[endpoint] = healthy
}

func (c *Client) AddEndpoint(endpoint string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for _, existing := range c.endpoints {
		if existing == endpoint {
			return // Already exists
		}
	}

	c.endpoints = append(c.endpoints, endpoint)
	c.healthy[endpoint] = true
}

func (c *Client) RemoveEndpoint(endpoint string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for i, existing := range c.endpoints {
		if existing == endpoint {
			c.endpoints = append(c.endpoints[:i], c.endpoints[i+1:]...)
			delete(c.healthy, endpoint)
			break
		}
	}
}

func (c *Client) GetHealthyEndpoints() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var healthy []string
	for _, endpoint := range c.endpoints {
		if isHealthy, exists := c.healthy[endpoint]; !exists || isHealthy {
			healthy = append(healthy, endpoint)
		}
	}

	return healthy
}

func (c *Client) StartHealthMonitoring(ctx context.Context) {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			c.checkEndpointHealth(ctx)
		}
	}
}

func (c *Client) checkEndpointHealth(ctx context.Context) {
	c.mu.RLock()
	endpoints := make([]string, len(c.endpoints))
	copy(endpoints, c.endpoints)
	c.mu.RUnlock()

	for _, endpoint := range endpoints {
		go func(ep string) {
			proxyURL := &url.URL{
				Scheme: "http",
				Host:   ep,
				User:   url.UserPassword(c.username, c.password),
			}
			healthy := c.testEndpoint(ctx, proxyURL)
			c.MarkHealthy(ep, healthy)
		}(endpoint)
	}
}

func (c *Client) testEndpoint(ctx context.Context, proxyURL *url.URL) bool {
	client := &http.Client{
		Transport: &http.Transport{
			Proxy:           http.ProxyURL(proxyURL),
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Timeout: 5 * time.Second,
	}

	req, err := http.NewRequestWithContext(ctx, "GET", "http://httpbin.org/ip", nil)
	if err != nil {
		return false
	}

	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// SetSessionID sets a default session ID for the client
func (c *Client) SetSessionID(sessionID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.sessionID = sessionID
	// Invalidate cache since session changed
	c.cachedProxy = nil
}

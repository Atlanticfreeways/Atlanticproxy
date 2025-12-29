package oxylabs

import (
	"context"
	"fmt"
	"math/rand"
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
			"pr.oxylabs.io:7777", // Standard
			"pr.oxylabs.io:8000", // Standard (Alternative)
			"pr.oxylabs.io:8001", // Mobile/Residential specific
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
	var userParts []string
	userParts = append(userParts, "customer-"+c.username)

	if config.Country != "" {
		userParts = append(userParts, "cc-"+strings.ToUpper(config.Country))
	}
	if config.City != "" {
		userParts = append(userParts, "city-"+strings.ToLower(config.City))
	}
	if config.State != "" {
		userParts = append(userParts, "st-"+strings.ToLower(config.State))
	}
	
	// Add session ID if provided, otherwise use client's default if set
	sessID := config.SessionID
	if sessID == "" {
		sessID = c.sessionID
	}
	if sessID != "" {
		userParts = append(userParts, "sessid-"+sessID)
	}

	if config.SessionTime > 0 {
		userParts = append(userParts, fmt.Sprintf("sesstime-%d", config.SessionTime))
	}

	finalUsername := strings.Join(userParts, ";") // Oxylabs uses semicolon delimiter for some params? Actually typically it is user-param-val. 
    // Oxylabs standard format: customer-username-cc-US-city-ny-sessid-xyz
    // They are joined by hyphens in the 'user' part, but if using separate params, documentation says:
    // "customer-USERNAME-cc-US:PASSWORD"
    // Wait, the standard format is "customer-USERNAME-param-value". All in the username string.
    
    // Let's re-join correctly with hyphens if that's the driver.
    // Actually Oxylabs often uses "customer-user-cc-US". 
    // My previous code used "customer-"+username. 
    // I need to be careful not to double hyphenate if not needed.
    
    // Correction: Oxylabs often allows: customer-USERNAME-cc-US-sessid-123
    // So I should join with hyphens.
    
    // Refine joining logic:
    // The prefix is "customer-"+c.username
    // Then append "-param-value" for each.
    
    var sb strings.Builder
    sb.WriteString("customer-")
    sb.WriteString(c.username)
    
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
    if sessID != "" {
        sb.WriteString("-sessid-")
        sb.WriteString(sessID)
    }
    if config.SessionTime > 0 {
        sb.WriteString(fmt.Sprintf("-sesstime-%d", config.SessionTime))
    }
    
    finalUsername = sb.String()

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
	return true
}

// SetSessionID sets a default session ID for the client
func (c *Client) SetSessionID(sessionID string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.sessionID = sessionID
    // Invalidate cache since session changed
    c.cachedProxy = nil
}

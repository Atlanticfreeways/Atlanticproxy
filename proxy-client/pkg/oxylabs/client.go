package oxylabs

import (
	"context"
	"fmt"
	"math/rand"
	"net/url"
	"sync"
	"time"
)

type Client struct {
	username  string
	password  string
	endpoints []string
	mu        sync.RWMutex
	healthy   map[string]bool
}

func NewClient(username, password string) *Client {
	return &Client{
		username: username,
		password: password,
		endpoints: []string{
			"pr.oxylabs.io:7777",
			"pr.oxylabs.io:8000",
			"pr.oxylabs.io:8001",
		},
		healthy: make(map[string]bool),
	}
}

func (c *Client) GetProxy(ctx context.Context) (*url.URL, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if len(c.endpoints) == 0 {
		return nil, fmt.Errorf("no proxy endpoints available")
	}

	// Find healthy endpoints
	var healthyEndpoints []string
	for _, endpoint := range c.endpoints {
		if healthy, exists := c.healthy[endpoint]; !exists || healthy {
			healthyEndpoints = append(healthyEndpoints, endpoint)
		}
	}

	if len(healthyEndpoints) == 0 {
		// If no healthy endpoints, try any endpoint
		healthyEndpoints = c.endpoints
	}

	// Select random healthy endpoint
	endpoint := healthyEndpoints[rand.Intn(len(healthyEndpoints))]

	return &url.URL{
		Scheme: "http",
		Host:   endpoint,
		User:   url.UserPassword(c.username, c.password),
	}, nil
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
			// Simple health check - try to create connection
			proxyURL := &url.URL{
				Scheme: "http",
				Host:   ep,
				User:   url.UserPassword(c.username, c.password),
			}

			// Test with a simple HTTP request
			// This is a basic implementation - in production you'd want more sophisticated health checks
			healthy := c.testEndpoint(ctx, proxyURL)
			c.MarkHealthy(ep, healthy)
		}(endpoint)
	}
}

func (c *Client) testEndpoint(ctx context.Context, proxyURL *url.URL) bool {
	// Basic endpoint test
	// In a real implementation, you'd make an actual HTTP request through the proxy
	// For now, we'll assume endpoints are healthy unless proven otherwise
	return true
}
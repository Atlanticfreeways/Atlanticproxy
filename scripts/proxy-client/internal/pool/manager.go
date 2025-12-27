package pool

import (
	"context"
	"fmt"
	"net/http"

	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/pkg/oxylabs"
)

type Config struct {
	MinConnections int
	MaxConnections int
	IdleTimeout    time.Duration
}

type Manager struct {
	config  *Config
	oxylabs *oxylabs.Client
	clients chan *http.Client
	mu      sync.RWMutex
}

func NewManager(config *Config, oxylabsClient *oxylabs.Client) *Manager {
	if config == nil {
		config = &Config{
			MinConnections: 5,
			MaxConnections: 20,
			IdleTimeout:    90 * time.Second,
		}
	}

	return &Manager{
		config:  config,
		oxylabs: oxylabsClient,
		clients: make(chan *http.Client, config.MaxConnections),
	}
}

func (m *Manager) Start(ctx context.Context) error {
	// Initialize min connections
	for i := 0; i < m.config.MinConnections; i++ {
		client, err := m.createClient(ctx)
		if err != nil {
			return fmt.Errorf("failed to create initial connection: %w", err)
		}
		m.clients <- client
	}

	// Start maintenance loop
	go m.maintainPool(ctx)

	return nil
}

func (m *Manager) GetClient(ctx context.Context) (*http.Client, error) {
	select {
	case client := <-m.clients:
		return client, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
		// Pool empty, try create new if under limit (simplified)
		return m.createClient(ctx)
	}
}

func (m *Manager) ReleaseClient(client *http.Client) {
	// Return to pool if not full
	select {
	case m.clients <- client:
	default:
		// Pool full, discard
	}
}

func (m *Manager) createClient(ctx context.Context) (*http.Client, error) {
	proxyURL, err := m.oxylabs.GetProxy(ctx)
	if err != nil {
		return nil, err
	}

	return &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
			// Optimize connection settings for high throughput
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 100,
			IdleConnTimeout:     m.config.IdleTimeout,
			DisableKeepAlives:   false,
		},
		Timeout: 30 * time.Second,
	}, nil
}

func (m *Manager) maintainPool(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Ensure min connections
			current := len(m.clients)
			if current < m.config.MinConnections {
				for i := 0; i < m.config.MinConnections-current; i++ {
					if client, err := m.createClient(ctx); err == nil {
						m.clients <- client
					}
				}
			}
		}
	}
}

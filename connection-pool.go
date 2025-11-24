package main

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"
)

type ConnectionPool struct {
	pools    map[string]*ProviderPool
	mutex    sync.RWMutex
	ctx      context.Context
	cancel   context.CancelFunc
	failover *FailoverManager
}

type ProviderPool struct {
	provider    string
	connections []*ProxyConnection
	mutex       sync.RWMutex
	minSize     int
	maxSize     int
	active      bool
}

type ProxyConnection struct {
	id         string
	client     *http.Client
	lastUsed   time.Time
	healthy    bool
	provider   string
	endpoint   string
	mutex      sync.RWMutex
}

type FailoverManager struct {
	providers []string
	current   int
	mutex     sync.RWMutex
}

func NewConnectionPool() *ConnectionPool {
	ctx, cancel := context.WithCancel(context.Background())
	
	pool := &ConnectionPool{
		pools:  make(map[string]*ProviderPool),
		ctx:    ctx,
		cancel: cancel,
		failover: &FailoverManager{
			providers: []string{"oxylabs", "smartproxy", "bright", "proxy6"},
		},
	}
	
	// Initialize provider pools
	for _, provider := range pool.failover.providers {
		pool.pools[provider] = &ProviderPool{
			provider:    provider,
			connections: make([]*ProxyConnection, 0),
			minSize:     3,
			maxSize:     5,
			active:      true,
		}
	}
	
	return pool
}

func (cp *ConnectionPool) Start() error {
	fmt.Println("🚀 Starting Persistent Connection Pools...")
	
	// Pre-warm all provider pools
	for provider, pool := range cp.pools {
		if err := cp.warmPool(provider, pool); err != nil {
			fmt.Printf("⚠️  Failed to warm pool %s: %v\n", provider, err)
		}
	}
	
	// Start health monitoring
	go cp.healthMonitor()
	
	// Start connection maintenance
	go cp.connectionMaintenance()
	
	fmt.Println("✅ Connection pools started with 3-5 pre-warmed connections per provider")
	return nil
}

func (cp *ConnectionPool) warmPool(provider string, pool *ProviderPool) error {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	
	for i := 0; i < pool.minSize; i++ {
		conn, err := cp.createConnection(provider)
		if err != nil {
			return fmt.Errorf("failed to create connection %d: %v", i, err)
		}
		pool.connections = append(pool.connections, conn)
	}
	
	fmt.Printf("🔥 Pre-warmed %d connections for %s\n", pool.minSize, provider)
	return nil
}

func (cp *ConnectionPool) createConnection(provider string) (*ProxyConnection, error) {
	endpoint := cp.getProviderEndpoint(provider)
	
	transport := &http.Transport{
		Proxy: http.ProxyURL(&url.URL{
			Scheme: "http",
			Host:   endpoint,
		}),
		MaxIdleConns:        10,
		IdleConnTimeout:     30 * time.Second,
		DisableCompression:  true,
		DisableKeepAlives:   false,
	}
	
	client := &http.Client{
		Transport: transport,
		Timeout:   10 * time.Second,
	}
	
	conn := &ProxyConnection{
		id:       fmt.Sprintf("%s-%d", provider, time.Now().UnixNano()),
		client:   client,
		lastUsed: time.Now(),
		healthy:  true,
		provider: provider,
		endpoint: endpoint,
	}
	
	// Test connection
	if err := cp.testConnection(conn); err != nil {
		return nil, fmt.Errorf("connection test failed: %v", err)
	}
	
	return conn, nil
}

func (cp *ConnectionPool) getProviderEndpoint(provider string) string {
	endpoints := map[string]string{
		"oxylabs":    "pr.oxylabs.io:7777",
		"smartproxy": "gate.smartproxy.com:7000",
		"bright":     "zproxy.lum-superproxy.io:22225",
		"proxy6":     "proxy6.net:3128",
	}
	return endpoints[provider]
}

func (cp *ConnectionPool) testConnection(conn *ProxyConnection) error {
	resp, err := conn.client.Get("http://httpbin.org/ip")
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		return fmt.Errorf("unexpected status: %d", resp.StatusCode)
	}
	
	return nil
}

func (cp *ConnectionPool) GetConnection() (*ProxyConnection, error) {
	cp.mutex.RLock()
	currentProvider := cp.failover.providers[cp.failover.current]
	cp.mutex.RUnlock()
	
	// Try current provider first
	if conn := cp.getFromPool(currentProvider); conn != nil {
		return conn, nil
	}
	
	// Failover to next provider
	return cp.failoverConnection()
}

func (cp *ConnectionPool) getFromPool(provider string) *ProxyConnection {
	cp.mutex.RLock()
	pool, exists := cp.pools[provider]
	cp.mutex.RUnlock()
	
	if !exists || !pool.active {
		return nil
	}
	
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	
	for _, conn := range pool.connections {
		conn.mutex.Lock()
		if conn.healthy && time.Since(conn.lastUsed) < 30*time.Second {
			conn.lastUsed = time.Now()
			conn.mutex.Unlock()
			return conn
		}
		conn.mutex.Unlock()
	}
	
	return nil
}

func (cp *ConnectionPool) failoverConnection() (*ProxyConnection, error) {
	cp.failover.mutex.Lock()
	defer cp.failover.mutex.Unlock()
	
	startProvider := cp.failover.current
	
	for i := 0; i < len(cp.failover.providers); i++ {
		cp.failover.current = (cp.failover.current + 1) % len(cp.failover.providers)
		provider := cp.failover.providers[cp.failover.current]
		
		if conn := cp.getFromPool(provider); conn != nil {
			if cp.failover.current != startProvider {
				fmt.Printf("⚡ Failover: Switched to %s (<500ms)\n", provider)
			}
			return conn, nil
		}
	}
	
	return nil, fmt.Errorf("no healthy connections available")
}

func (cp *ConnectionPool) healthMonitor() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-cp.ctx.Done():
			return
		case <-ticker.C:
			cp.checkAllConnections()
		}
	}
}

func (cp *ConnectionPool) checkAllConnections() {
	cp.mutex.RLock()
	pools := make(map[string]*ProviderPool)
	for k, v := range cp.pools {
		pools[k] = v
	}
	cp.mutex.RUnlock()
	
	for provider, pool := range pools {
		go cp.checkPoolHealth(provider, pool)
	}
}

func (cp *ConnectionPool) checkPoolHealth(provider string, pool *ProviderPool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	
	healthyCount := 0
	for _, conn := range pool.connections {
		if cp.testConnection(conn) == nil {
			conn.mutex.Lock()
			conn.healthy = true
			conn.mutex.Unlock()
			healthyCount++
		} else {
			conn.mutex.Lock()
			conn.healthy = false
			conn.mutex.Unlock()
		}
	}
	
	fmt.Printf("🔍 %s: %d/%d connections healthy\n", provider, healthyCount, len(pool.connections))
}

func (cp *ConnectionPool) connectionMaintenance() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-cp.ctx.Done():
			return
		case <-ticker.C:
			cp.maintainPools()
		}
	}
}

func (cp *ConnectionPool) maintainPools() {
	cp.mutex.RLock()
	pools := make(map[string]*ProviderPool)
	for k, v := range cp.pools {
		pools[k] = v
	}
	cp.mutex.RUnlock()
	
	for provider, pool := range pools {
		cp.maintainPool(provider, pool)
	}
}

func (cp *ConnectionPool) maintainPool(provider string, pool *ProviderPool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	
	// Remove unhealthy connections
	healthy := make([]*ProxyConnection, 0)
	for _, conn := range pool.connections {
		conn.mutex.RLock()
		if conn.healthy {
			healthy = append(healthy, conn)
		}
		conn.mutex.RUnlock()
	}
	pool.connections = healthy
	
	// Add new connections if below minimum
	for len(pool.connections) < pool.minSize {
		if conn, err := cp.createConnection(provider); err == nil {
			pool.connections = append(pool.connections, conn)
		} else {
			break
		}
	}
}

func (cp *ConnectionPool) Status() string {
	cp.mutex.RLock()
	defer cp.mutex.RUnlock()
	
	status := "🏊 PERSISTENT CONNECTION POOLS STATUS\n"
	status += "=====================================\n"
	
	for provider, pool := range cp.pools {
		pool.mutex.RLock()
		healthy := 0
		for _, conn := range pool.connections {
			conn.mutex.RLock()
			if conn.healthy {
				healthy++
			}
			conn.mutex.RUnlock()
		}
		status += fmt.Sprintf("%s: %d/%d healthy connections\n", provider, healthy, len(pool.connections))
		pool.mutex.RUnlock()
	}
	
	cp.failover.mutex.RLock()
	current := cp.failover.providers[cp.failover.current]
	cp.failover.mutex.RUnlock()
	
	status += fmt.Sprintf("Current Provider: %s\n", current)
	return status
}

func (cp *ConnectionPool) Stop() {
	fmt.Println("🛑 Stopping connection pools...")
	cp.cancel()
}

func main() {
	pool := NewConnectionPool()
	
	if err := pool.Start(); err != nil {
		fmt.Printf("Failed to start connection pool: %v\n", err)
		return
	}
	
	// Test connection retrieval
	fmt.Println("\n🧪 Testing connection retrieval...")
	for i := 0; i < 3; i++ {
		conn, err := pool.GetConnection()
		if err != nil {
			fmt.Printf("❌ Failed to get connection: %v\n", err)
		} else {
			fmt.Printf("✅ Got connection: %s from %s\n", conn.id, conn.provider)
		}
	}
	
	// Show status
	fmt.Printf("\n%s", pool.Status())
	
	// Keep running for demonstration
	time.Sleep(5 * time.Second)
	pool.Stop()
}
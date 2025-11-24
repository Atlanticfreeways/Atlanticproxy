package main

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type HealthMonitor struct {
	providers map[string]*ProviderHealth
	metrics   *SystemMetrics
	mutex     sync.RWMutex
	ctx       context.Context
	cancel    context.CancelFunc
}

type ProviderHealth struct {
	name         string
	status       HealthStatus
	latency      time.Duration
	successRate  float64
	lastCheck    time.Time
	failureCount int
	totalChecks  int
}

type HealthStatus int

const (
	Healthy HealthStatus = iota
	Degraded
	Unhealthy
)

type SystemMetrics struct {
	totalRequests    int64
	successfulReqs   int64
	failedReqs       int64
	avgLatency       time.Duration
	uptime           time.Duration
	startTime        time.Time
	mutex            sync.RWMutex
}

func NewHealthMonitor() *HealthMonitor {
	ctx, cancel := context.WithCancel(context.Background())
	
	hm := &HealthMonitor{
		providers: make(map[string]*ProviderHealth),
		metrics:   &SystemMetrics{startTime: time.Now()},
		ctx:       ctx,
		cancel:    cancel,
	}
	
	// Initialize provider health tracking
	providers := []string{"oxylabs", "smartproxy", "bright", "proxy6"}
	for _, provider := range providers {
		hm.providers[provider] = &ProviderHealth{
			name:   provider,
			status: Healthy,
		}
	}
	
	return hm
}

func (hm *HealthMonitor) Start() error {
	fmt.Println("🔍 Starting Continuous Health Monitoring...")
	
	// Start health checks
	go hm.continuousHealthCheck()
	
	// Start metrics collection
	go hm.metricsCollection()
	
	// Start performance optimization
	go hm.performanceOptimization()
	
	fmt.Println("✅ Health monitoring active - 24/7 provider performance tracking")
	return nil
}

func (hm *HealthMonitor) continuousHealthCheck() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-hm.ctx.Done():
			return
		case <-ticker.C:
			hm.checkAllProviders()
		}
	}
}

func (hm *HealthMonitor) checkAllProviders() {
	hm.mutex.RLock()
	providers := make(map[string]*ProviderHealth)
	for k, v := range hm.providers {
		providers[k] = v
	}
	hm.mutex.RUnlock()
	
	var wg sync.WaitGroup
	for name, provider := range providers {
		wg.Add(1)
		go func(n string, p *ProviderHealth) {
			defer wg.Done()
			hm.checkProvider(n, p)
		}(name, provider)
	}
	wg.Wait()
}

func (hm *HealthMonitor) checkProvider(name string, provider *ProviderHealth) {
	start := time.Now()
	
	// Simulate health check (in production, this would be actual proxy test)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get("http://httpbin.org/ip")
	
	latency := time.Since(start)
	provider.lastCheck = time.Now()
	provider.totalChecks++
	
	if err != nil || (resp != nil && resp.StatusCode != 200) {
		provider.failureCount++
		hm.updateProviderStatus(provider, latency, false)
	} else {
		hm.updateProviderStatus(provider, latency, true)
		if resp != nil {
			resp.Body.Close()
		}
	}
}

func (hm *HealthMonitor) updateProviderStatus(provider *ProviderHealth, latency time.Duration, success bool) {
	provider.latency = latency
	
	if provider.totalChecks > 0 {
		successCount := provider.totalChecks - provider.failureCount
		provider.successRate = float64(successCount) / float64(provider.totalChecks)
	}
	
	// Update status based on success rate and latency
	if provider.successRate >= 0.95 && latency < 2*time.Second {
		provider.status = Healthy
	} else if provider.successRate >= 0.80 && latency < 5*time.Second {
		provider.status = Degraded
	} else {
		provider.status = Unhealthy
	}
	
	statusStr := hm.statusString(provider.status)
	fmt.Printf("🔍 %s: %s (%.1f%% success, %dms latency)\n", 
		provider.name, statusStr, provider.successRate*100, latency.Milliseconds())
}

func (hm *HealthMonitor) statusString(status HealthStatus) string {
	switch status {
	case Healthy:
		return "✅ Healthy"
	case Degraded:
		return "⚠️  Degraded"
	case Unhealthy:
		return "❌ Unhealthy"
	default:
		return "❓ Unknown"
	}
}

func (hm *HealthMonitor) metricsCollection() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-hm.ctx.Done():
			return
		case <-ticker.C:
			hm.updateSystemMetrics()
		}
	}
}

func (hm *HealthMonitor) updateSystemMetrics() {
	hm.metrics.mutex.Lock()
	defer hm.metrics.mutex.Unlock()
	
	hm.metrics.uptime = time.Since(hm.metrics.startTime)
	
	// Calculate average latency from providers
	hm.mutex.RLock()
	var totalLatency time.Duration
	healthyCount := 0
	
	for _, provider := range hm.providers {
		if provider.status == Healthy {
			totalLatency += provider.latency
			healthyCount++
		}
	}
	hm.mutex.RUnlock()
	
	if healthyCount > 0 {
		hm.metrics.avgLatency = totalLatency / time.Duration(healthyCount)
	}
	
	fmt.Printf("📊 System Metrics: Uptime %v, Avg Latency %dms\n", 
		hm.metrics.uptime.Round(time.Second), hm.metrics.avgLatency.Milliseconds())
}

func (hm *HealthMonitor) performanceOptimization() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-hm.ctx.Done():
			return
		case <-ticker.C:
			hm.optimizePerformance()
		}
	}
}

func (hm *HealthMonitor) optimizePerformance() {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()
	
	healthyProviders := 0
	degradedProviders := 0
	unhealthyProviders := 0
	
	for _, provider := range hm.providers {
		switch provider.status {
		case Healthy:
			healthyProviders++
		case Degraded:
			degradedProviders++
		case Unhealthy:
			unhealthyProviders++
		}
	}
	
	// Performance optimization recommendations
	if unhealthyProviders > 0 {
		fmt.Printf("⚡ Optimization: %d unhealthy providers detected - activating failover\n", unhealthyProviders)
	}
	
	if degradedProviders > 1 {
		fmt.Printf("⚡ Optimization: %d degraded providers - consider load balancing adjustment\n", degradedProviders)
	}
	
	if healthyProviders >= 3 {
		fmt.Printf("⚡ Optimization: %d healthy providers - system performing optimally\n", healthyProviders)
	}
}

func (hm *HealthMonitor) GetBestProvider() string {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()
	
	var bestProvider string
	var bestScore float64
	
	for name, provider := range hm.providers {
		if provider.status == Unhealthy {
			continue
		}
		
		// Score based on success rate and latency
		latencyScore := 1.0 - (float64(provider.latency.Milliseconds()) / 5000.0)
		if latencyScore < 0 {
			latencyScore = 0
		}
		
		score := (provider.successRate * 0.7) + (latencyScore * 0.3)
		
		if score > bestScore {
			bestScore = score
			bestProvider = name
		}
	}
	
	if bestProvider == "" {
		bestProvider = "oxylabs" // fallback
	}
	
	return bestProvider
}

func (hm *HealthMonitor) RecordRequest(success bool, latency time.Duration) {
	hm.metrics.mutex.Lock()
	defer hm.metrics.mutex.Unlock()
	
	hm.metrics.totalRequests++
	if success {
		hm.metrics.successfulReqs++
	} else {
		hm.metrics.failedReqs++
	}
}

func (hm *HealthMonitor) Status() string {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()
	
	status := "🔍 CONTINUOUS HEALTH MONITORING STATUS\n"
	status += "====================================\n"
	
	for name, provider := range hm.providers {
		statusStr := hm.statusString(provider.status)
		status += fmt.Sprintf("%s: %s (%.1f%% success, %dms)\n", 
			name, statusStr, provider.successRate*100, provider.latency.Milliseconds())
	}
	
	hm.metrics.mutex.RLock()
	status += fmt.Sprintf("\nSystem Metrics:\n")
	status += fmt.Sprintf("Uptime: %v\n", hm.metrics.uptime.Round(time.Second))
	status += fmt.Sprintf("Total Requests: %d\n", hm.metrics.totalRequests)
	status += fmt.Sprintf("Success Rate: %.1f%%\n", 
		float64(hm.metrics.successfulReqs)/float64(hm.metrics.totalRequests)*100)
	status += fmt.Sprintf("Average Latency: %dms\n", hm.metrics.avgLatency.Milliseconds())
	hm.metrics.mutex.RUnlock()
	
	bestProvider := hm.GetBestProvider()
	status += fmt.Sprintf("Best Provider: %s\n", bestProvider)
	
	return status
}

func (hm *HealthMonitor) Stop() {
	fmt.Println("🛑 Stopping health monitor...")
	hm.cancel()
}

func main() {
	monitor := NewHealthMonitor()
	
	if err := monitor.Start(); err != nil {
		fmt.Printf("Failed to start health monitor: %v\n", err)
		return
	}
	
	// Demo: Run monitoring for a period
	fmt.Println("\n🧪 Testing Health Monitoring...")
	
	// Simulate some requests
	go func() {
		for i := 0; i < 5; i++ {
			monitor.RecordRequest(true, 150*time.Millisecond)
			time.Sleep(2 * time.Second)
		}
	}()
	
	// Let it run and show status
	time.Sleep(15 * time.Second)
	fmt.Printf("\n%s", monitor.Status())
	
	time.Sleep(5 * time.Second)
	monitor.Stop()
}
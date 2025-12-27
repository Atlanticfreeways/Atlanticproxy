package failover

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/atlanticproxy/proxy-client/internal/killswitch"
	"github.com/atlanticproxy/proxy-client/internal/monitor"
	"github.com/atlanticproxy/proxy-client/internal/proxy"
)

type Config struct {
	MaxRetries int
	RetryDelay time.Duration
}

type Controller struct {
	config     *Config
	monitor    *monitor.NetworkMonitor
	killswitch *killswitch.Guardian
	proxy      *proxy.Engine
	status     string
	mu         sync.RWMutex
}

func NewController(config *Config, monitor *monitor.NetworkMonitor, ks *killswitch.Guardian, proxy *proxy.Engine) *Controller {
	if config == nil {
		config = &Config{
			MaxRetries: 3,
			RetryDelay: 1 * time.Second,
		}
	}
	return &Controller{
		config:     config,
		monitor:    monitor,
		killswitch: ks,
		proxy:      proxy,
		status:     "healthy",
	}
}

func (c *Controller) Start(ctx context.Context) error {
	// Register callback with network monitor
	c.monitor.AddCallback(c.HandleNetworkChange)
	return nil
}

func (c *Controller) HandleNetworkChange(change monitor.NetworkChange) {
	c.mu.Lock()
	defer c.mu.Unlock()

	log.Printf("Failover Controller: Network change detected: %v", change)

	switch change.Type {
	case "interface_down":
		if change.Interface == "atlantic-tun0" {
			// TUN interface went down unexpectedly
			log.Println("Failover: Critical interface down!")
			c.activateEmergencyProtocol()
		}
	case "ip_changed":
		// Re-evaluate routes/firewall
		c.reconfigureNetwork()
	}
}

func (c *Controller) activateEmergencyProtocol() {
	c.status = "failover_active"

	// 1. Engage Kill Switch (if not already engaged)
	if c.killswitch != nil {
		if err := c.killswitch.Enable(); err != nil {
			log.Printf("Failover: Failed to engage killswitch: %v", err)
		}
	}

	// 2. Stop Proxy traffic
	// (Proxy engine handles graceful connections, but we want to stop new ones)

	// 3. Attempt Recovery
	go c.attemptRecovery()
}

func (c *Controller) attemptRecovery() {
	log.Println("Failover: Attempting recovery...")

	for i := 0; i < c.config.MaxRetries; i++ {
		time.Sleep(c.config.RetryDelay)

		// Try to restart proxy components
		// In a real scenario, this would involve re-initializing the TUN interface
		// and verifying connectivity.

		if c.verifyConnectivity() {
			log.Println("Failover: Connectivity restored!")
			c.status = "healthy"
			// Optionally disable killswitch if safe
			// c.killswitch.Disable() // Policy decision: manual or auto?
			return
		}
	}

	log.Println("Failover: Recovery failed. Manual intervention required.")
	c.status = "failed"
}

func (c *Controller) verifyConnectivity() bool {
	// Placeholder for checking internet access
	// In production, ping a known reliable server
	return false
}

func (c *Controller) reconfigureNetwork() {
	// Re-apply routing rules if IP changed
	log.Println("Failover: Reconfiguring network rules...")
}

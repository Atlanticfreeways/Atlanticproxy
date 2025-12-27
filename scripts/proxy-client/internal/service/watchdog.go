package service

import (
	"context"
	"log"
	"runtime"
	"time"
)

type WatchdogConfig struct {
	CheckInterval time.Duration
	MaxMemoryMB   uint64
	MaxCPUUsage   float64
}

type Watchdog struct {
	config *WatchdogConfig
	ticker *time.Ticker
}

func NewWatchdog(config *WatchdogConfig) *Watchdog {
	if config == nil {
		config = &WatchdogConfig{
			CheckInterval: 5 * time.Second,
			MaxMemoryMB:   50,  // Strict 50MB limit
			MaxCPUUsage:   5.0, // 5%
		}
	}
	return &Watchdog{
		config: config,
	}
}

func (w *Watchdog) Start(ctx context.Context) error {
	w.ticker = time.NewTicker(w.config.CheckInterval)
	go w.monitorLoop(ctx)
	return nil
}

func (w *Watchdog) monitorLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			w.ticker.Stop()
			return
		case <-w.ticker.C:
			w.checkSystemHealth()
		}
	}
}

func (w *Watchdog) checkSystemHealth() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	allocMB := m.Alloc / 1024 / 1024
	if allocMB > w.config.MaxMemoryMB {
		log.Printf("Watchdog: Memory usage high (%d MB). Triggering GC...", allocMB)
		runtime.GC()

		// If still high, we might need aggressive action (restart component)
		// For now, valid strategy is aggressive GC
	}
}

// PerformRecovery - restart critical components if failed
func (w *Watchdog) PerformRecovery() {
	log.Println("Watchdog: Initiating system recovery...")
	// Logic to restart services would hook into Service manager
}

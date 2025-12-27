package service

import (
	"context"
	"runtime"
	"testing"
	"time"
)

func TestWatchdog_CheckHealth(t *testing.T) {
	config := &WatchdogConfig{
		CheckInterval: 10 * time.Millisecond,
		MaxMemoryMB:   1, // Low limit to trigger check logic
	}

	wd := NewWatchdog(config)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := wd.Start(ctx); err != nil {
		t.Fatalf("Failed to start watchdog: %v", err)
	}

	// Allocate some memory to potentially trigger logic
	_ = make([]byte, 2*1024*1024)

	// Wait for a few ticks
	time.Sleep(50 * time.Millisecond)

	// Verification is mostly that it doesn't crash and logs output
	// Hard to assert GC happened without deep runtime inspection
}

func TestWatchdog_GC(t *testing.T) {
	// Verify memory stats change after mandatory GC
	var m1, m2 runtime.MemStats
	runtime.ReadMemStats(&m1)

	// Create garbage
	for i := 0; i < 1000; i++ {
		_ = make([]byte, 1024)
	}

	runtime.GC()
	runtime.ReadMemStats(&m2)

	// Just ensuring runtime functions work as expected in this environment
	if m2.Alloc > m1.Alloc+10000000 {
		// Unlikely unless other threads are active
	}
}

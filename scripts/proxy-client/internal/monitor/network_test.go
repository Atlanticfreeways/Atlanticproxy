package monitor

import (
	"context"
	"testing"
	"time"
)

// We need to mock netlink interactions... which is hard without an interface wrapper.
// But for "industry standard" coverage of logic, we can test the loop and callbacks.

func TestNetworkMonitor_Callbacks(t *testing.T) {
	config := &Config{CheckInterval: 1}
	monitor := New(config)

	changes := make(chan NetworkChange, 1)
	monitor.AddCallback(func(change NetworkChange) {
		changes <- change
	})

	// Manually trigger a detection to verify callback logic
	oldInterfaces := map[string]InterfaceInfo{
		"eth0": {Name: "eth0", State: "up"},
	}
	newInterfaces := map[string]InterfaceInfo{
		"eth0": {Name: "eth0", State: "down"},
	}

	monitor.detectChanges(oldInterfaces, newInterfaces)

	select {
	case change := <-changes:
		if change.Type != "interface_state_changed" {
			t.Errorf("Expected interface_state_changed, got %s", change.Type)
		}
		if change.NewValue != "down" {
			t.Errorf("Expected new state down, got %s", change.NewValue)
		}
	case <-time.After(1 * time.Second):
		t.Error("Callback timeout")
	}
}

func TestNetworkMonitor_StartStop(t *testing.T) {
	// Just verifies no panics on start/stop
	monitor := New(nil)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := monitor.Start(ctx); err != nil {
		t.Errorf("Start failed: %v", err)
	}
	monitor.Stop()
}

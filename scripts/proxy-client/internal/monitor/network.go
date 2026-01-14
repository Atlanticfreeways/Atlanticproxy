package monitor

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/vishvananda/netlink"
)

type Config struct {
	CheckInterval int // seconds
}

type NetworkMonitor struct {
	config    *Config
	ticker    *time.Ticker
	callbacks []NetworkChangeCallback
}

type NetworkChangeCallback func(change NetworkChange)

type NetworkChange struct {
	Type      string // "interface_up", "interface_down", "ip_changed", "route_changed"
	Interface string
	OldValue  string
	NewValue  string
}

func New(config *Config) *NetworkMonitor {
	if config == nil {
		config = &Config{
			CheckInterval: 5,
		}
	}

	return &NetworkMonitor{
		config: config,
	}
}

func (n *NetworkMonitor) Start(ctx context.Context) error {
	n.ticker = time.NewTicker(time.Duration(n.config.CheckInterval) * time.Second)

	go n.monitorLoop(ctx)
	return nil
}

func (n *NetworkMonitor) Stop() {
	if n.ticker != nil {
		n.ticker.Stop()
	}
}

func (n *NetworkMonitor) AddCallback(callback NetworkChangeCallback) {
	n.callbacks = append(n.callbacks, callback)
}

func (n *NetworkMonitor) monitorLoop(ctx context.Context) {
	lastInterfaces := n.getCurrentInterfaces()

	for {
		select {
		case <-ctx.Done():
			return
		case <-n.ticker.C:
			currentInterfaces := n.getCurrentInterfaces()
			n.detectChanges(lastInterfaces, currentInterfaces)
			lastInterfaces = currentInterfaces
		}
	}
}

func (n *NetworkMonitor) getCurrentInterfaces() map[string]InterfaceInfo {
	interfaces := make(map[string]InterfaceInfo)

	links, err := netlink.LinkList()
	if err != nil {
		return interfaces
	}

	for _, link := range links {
		attrs := link.Attrs()

		// Get IP addresses
		addrs, err := netlink.AddrList(link, 0)
		if err != nil {
			continue
		}

		var ipAddresses []string
		for _, addr := range addrs {
			ipAddresses = append(ipAddresses, addr.IP.String())
		}

		interfaces[attrs.Name] = InterfaceInfo{
			Name:        attrs.Name,
			State:       attrs.OperState.String(),
			IPAddresses: ipAddresses,
			MTU:         attrs.MTU,
		}
	}

	return interfaces
}

type InterfaceInfo struct {
	Name        string
	State       string
	IPAddresses []string
	MTU         int
}

func (n *NetworkMonitor) detectChanges(old, current map[string]InterfaceInfo) {
	// Check for interface state changes
	for name, currentInfo := range current {
		if oldInfo, exists := old[name]; exists {
			// Interface existed before, check for changes
			if oldInfo.State != currentInfo.State {
				change := NetworkChange{
					Type:      "interface_state_changed",
					Interface: name,
					OldValue:  oldInfo.State,
					NewValue:  currentInfo.State,
				}
				n.notifyCallbacks(change)
			}

			// Check for IP address changes
			if !equalStringSlices(oldInfo.IPAddresses, currentInfo.IPAddresses) {
				change := NetworkChange{
					Type:      "ip_changed",
					Interface: name,
					OldValue:  fmt.Sprintf("%v", oldInfo.IPAddresses),
					NewValue:  fmt.Sprintf("%v", currentInfo.IPAddresses),
				}
				n.notifyCallbacks(change)
			}
		} else {
			// New interface
			change := NetworkChange{
				Type:      "interface_added",
				Interface: name,
				NewValue:  currentInfo.State,
			}
			n.notifyCallbacks(change)
		}
	}

	// Check for removed interfaces
	for name, oldInfo := range old {
		if _, exists := current[name]; !exists {
			change := NetworkChange{
				Type:      "interface_removed",
				Interface: name,
				OldValue:  oldInfo.State,
			}
			n.notifyCallbacks(change)
		}
	}
}

func (n *NetworkMonitor) notifyCallbacks(change NetworkChange) {
	for _, callback := range n.callbacks {
		go callback(change)
	}
}

func equalStringSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	for i, v := range a {
		if v != b[i] {
			return false
		}
	}

	return true
}

func (n *NetworkMonitor) GetDefaultGateway() (net.IP, error) {
	routes, err := netlink.RouteList(nil, 4)
	if err != nil {
		return nil, err
	}

	for _, route := range routes {
		if route.Dst == nil {
			return route.Gw, nil
		}
	}

	return nil, fmt.Errorf("no default gateway found")
}

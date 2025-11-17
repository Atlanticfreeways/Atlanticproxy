// +build linux

package interceptor

import (
	"context"
	"fmt"
	"net"
	"os/exec"

	"github.com/songgao/water"
	"github.com/vishvananda/netlink"
)

type Config struct {
	InterfaceName string
	TunIP         string
	TunNetmask    string
}

type TunInterceptor struct {
	iface  *water.Interface
	config *Config
}

func NewTunInterceptor(config *Config) (*TunInterceptor, error) {
	if config == nil {
		config = &Config{
			InterfaceName: "utun9",
			TunIP:         "10.8.0.1",
			TunNetmask:    "255.255.255.0",
		}
	}

	iface, err := water.New(water.Config{
		DeviceType: water.TUN,
		PlatformSpecificParams: water.PlatformSpecificParams{
			Name: config.InterfaceName,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create TUN interface: %w", err)
	}

	return &TunInterceptor{
		iface:  iface,
		config: config,
	}, nil
}

func (t *TunInterceptor) Start(ctx context.Context) error {
	// Configure TUN interface
	if err := t.configureTunInterface(); err != nil {
		return fmt.Errorf("failed to configure TUN interface: %w", err)
	}

	// Set up routing rules
	if err := t.setupRouting(); err != nil {
		return fmt.Errorf("failed to setup routing: %w", err)
	}

	// Start packet processing
	go t.processPackets(ctx)

	return nil
}

func (t *TunInterceptor) configureTunInterface() error {
	// Get the interface by name
	link, err := netlink.LinkByName(t.config.InterfaceName)
	if err != nil {
		return err
	}

	// Parse IP address
	ip, ipnet, err := net.ParseCIDR(t.config.TunIP + "/24")
	if err != nil {
		return err
	}

	// Add IP address to interface
	addr := &netlink.Addr{
		IPNet: &net.IPNet{
			IP:   ip,
			Mask: ipnet.Mask,
		},
	}

	if err := netlink.AddrAdd(link, addr); err != nil {
		return err
	}

	// Bring interface up
	return netlink.LinkSetUp(link)
}

func (t *TunInterceptor) setupRouting() error {
	// Add default route through TUN interface
	cmd := exec.Command("ip", "route", "add", "default", "dev", t.config.InterfaceName, "table", "100")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to add route: %w", err)
	}

	// Add rule to use custom routing table
	cmd = exec.Command("ip", "rule", "add", "from", "all", "table", "100", "priority", "100")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to add routing rule: %w", err)
	}

	return nil
}

func (t *TunInterceptor) processPackets(ctx context.Context) {
	buffer := make([]byte, 1500) // MTU size

	for {
		select {
		case <-ctx.Done():
			return
		default:
			n, err := t.iface.Read(buffer)
			if err != nil {
				continue
			}

			// Process packet
			packet := buffer[:n]
			t.handlePacket(packet)
		}
	}
}

func (t *TunInterceptor) handlePacket(packet []byte) {
	// Basic packet parsing and forwarding
	// This is where we'll integrate with the proxy engine
	
	// For now, just log packet info
	if len(packet) > 20 {
		version := packet[0] >> 4
		if version == 4 {
			// IPv4 packet
			srcIP := net.IPv4(packet[12], packet[13], packet[14], packet[15])
			dstIP := net.IPv4(packet[16], packet[17], packet[18], packet[19])
			
			// TODO: Route through proxy based on destination
			_ = srcIP
			_ = dstIP
		}
	}
}

func (t *TunInterceptor) Stop() {
	if t.iface != nil {
		t.iface.Close()
	}
	
	// Clean up routing rules
	exec.Command("ip", "rule", "del", "table", "100").Run()
	exec.Command("ip", "route", "flush", "table", "100").Run()
}
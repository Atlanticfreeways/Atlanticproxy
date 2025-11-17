// +build darwin

package interceptor

import (
	"context"
	"fmt"
	"net"
	"os/exec"

	"github.com/songgao/water"
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
	// Configure TUN interface using macOS ifconfig
	if err := t.configureTunInterface(); err != nil {
		return fmt.Errorf("failed to configure TUN interface: %w", err)
	}

	// Set up routing rules using macOS route command
	if err := t.setupRouting(); err != nil {
		return fmt.Errorf("failed to setup routing: %w", err)
	}

	// Start packet processing
	go t.processPackets(ctx)

	return nil
}

func (t *TunInterceptor) configureTunInterface() error {
	// Use ifconfig to configure the interface on macOS
	// For utun interfaces, we set the local and remote addresses
	cmd := exec.Command("ifconfig", t.config.InterfaceName, t.config.TunIP, "10.8.0.2", "up")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to configure interface: %w (output: %s)", err, string(output))
	}

	return nil
}

func (t *TunInterceptor) setupRouting() error {
	// Add route through TUN interface on macOS
	// For now, we'll route specific subnets rather than all traffic
	// to avoid breaking the system
	
	// Route 10.0.0.0/8 through TUN
	cmd := exec.Command("route", "add", "-net", "10.0.0.0/8", "-interface", t.config.InterfaceName)
	cmd.Run() // Ignore errors as route might already exist

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
	
	// Clean up routing rules on macOS
	exec.Command("route", "delete", "-net", "10.0.0.0/8").Run()
}
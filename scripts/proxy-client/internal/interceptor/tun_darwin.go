//go:build darwin
// +build darwin

package interceptor

import (
	"context"
	"fmt"
	"net"
	"os/exec"

	"github.com/songgao/water"
)

// newWater allows mocking water.New in tests
var newWater = water.New

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

	var iface *water.Interface
	var err error

	// Try to find an available TUN interface
	// If specific name requested, try it first
	startIdx := 9
	if len(config.InterfaceName) > 4 && config.InterfaceName[:4] == "utun" {
		// Just try what's requested first
		iface, err = newWater(water.Config{
			DeviceType: water.TUN,
			PlatformSpecificParams: water.PlatformSpecificParams{
				Name: config.InterfaceName,
			},
		})
		if err == nil {
			return &TunInterceptor{
				iface:  iface,
				config: config,
			}, nil
		}
	} else {
		// If custom name not utunX, try it
		iface, err = newWater(water.Config{
			DeviceType: water.TUN,
			PlatformSpecificParams: water.PlatformSpecificParams{
				Name: config.InterfaceName,
			},
		})
		if err == nil {
			return &TunInterceptor{iface: iface, config: config}, nil
		}
	}

	// Fallback/Retry logic: Try utun9 to utun19
	for i := startIdx; i < 20; i++ {
		name := fmt.Sprintf("utun%d", i)
		iface, err = newWater(water.Config{
			DeviceType: water.TUN,
			PlatformSpecificParams: water.PlatformSpecificParams{
				Name: name,
			},
		})
		if err == nil {
			// Success! Update config to match actual interface
			config.InterfaceName = name
			return &TunInterceptor{
				iface:  iface,
				config: config,
			}, nil
		}
	}

	return nil, fmt.Errorf("failed to create TUN interface after retries: %w", err)
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

	// V1.5 SAFETY MODE:
	// Do NOT route 10.0.0.0/8 by default as this causes a black hole without a running tun2socks implementation.
	// Only route if explicitly enabled in config (not yet implemented) or for specific test IPs.

	// cmd := exec.Command("route", "add", "-net", "10.0.0.0/8", "-interface", t.config.InterfaceName)
	// cmd.Run()

	fmt.Println("TUN: Safety Mode enabled. Network routing disabled. Packet interception paused.")
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
	// Basic packet parsing
	if len(packet) < 20 {
		return
	}

	versionIHL := packet[0]
	version := versionIHL >> 4

	if version != 4 {
		return // Only IPv4 for now
	}

	headerLen := (versionIHL & 0x0F) * 4
	if len(packet) < int(headerLen) {
		return
	}

	protocol := packet[9]
	srcIP := net.IPv4(packet[12], packet[13], packet[14], packet[15])
	dstIP := net.IPv4(packet[16], packet[17], packet[18], packet[19])

	// Parse Transport Layer
	if len(packet) >= int(headerLen)+4 {
		payload := packet[headerLen:]

		// TCP (6) or UDP (17)
		if protocol == 6 || protocol == 17 {
			srcPort := uint16(payload[0])<<8 | uint16(payload[1])
			dstPort := uint16(payload[2])<<8 | uint16(payload[3])

			protoStr := "TCP"
			if protocol == 17 {
				protoStr = "UDP"
			}

			// Log interception (debug level in real world, print for now)
			// TODO: Integrate with tun2socks or similar for actual proxying
			// Currently serving as a traffic monitor/firewall
			fmt.Printf("TUN: Intercepted %s %s:%d -> %s:%d\n", protoStr, srcIP, srcPort, dstIP, dstPort)
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

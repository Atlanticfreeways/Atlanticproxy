//go:build linux
// +build linux

package interceptor

import (
	"context"
	"fmt"
	"net"
	"os/exec"
	"sync"

	"github.com/songgao/water"
	"github.com/vishvananda/netlink"
)

// newWater allows mocking water.New in tests
var newWater = water.New

type Config struct {
	InterfaceName string
	TunIP         string
	TunNetmask    string
}

type TunInterceptor struct {
	iface      *water.Interface
	config     *Config
	bufferPool sync.Pool
}

func NewTunInterceptor(config *Config) (*TunInterceptor, error) {
	if config == nil {
		config = &Config{
			InterfaceName: "utun9",
			TunIP:         "10.8.0.1",
			TunNetmask:    "255.255.255.0",
		}
	}

	iface, err := newWater(water.Config{
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
		bufferPool: sync.Pool{
			New: func() interface{} {
				return make([]byte, 65535) // Support max IP packet size
			},
		},
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
	for {
		select {
		case <-ctx.Done():
			return
		default:
			buffer := t.bufferPool.Get().([]byte)
			n, err := t.iface.Read(buffer)
			if err != nil {
				t.bufferPool.Put(buffer)
				continue
			}

			// Process packet in a goroutine to not block the reader
			// Note: For a high-performance interceptor, you'd use a worker pool or specialized handler
			go func(pkt []byte, buf []byte) {
				t.handlePacket(pkt)
				t.bufferPool.Put(buf)
			}(buffer[:n], buffer)
		}
	}
}

func (t *TunInterceptor) handlePacket(packet []byte) {
	if len(packet) < 20 {
		return
	}

	versionIHL := packet[0]
	version := versionIHL >> 4

	if version != 4 {
		return
	}

	headerLen := (versionIHL & 0x0F) * 4
	if len(packet) < int(headerLen) {
		return
	}

	protocol := packet[9]
	srcIP := net.IPv4(packet[12], packet[13], packet[14], packet[15])
	dstIP := net.IPv4(packet[16], packet[17], packet[18], packet[19])

	if len(packet) >= int(headerLen)+4 {
		payload := packet[headerLen:]

		if protocol == 6 || protocol == 17 {
			srcPort := uint16(payload[0])<<8 | uint16(payload[1])
			dstPort := uint16(payload[2])<<8 | uint16(payload[3])

			protoStr := "TCP"
			if protocol == 17 {
				protoStr = "UDP"
			}

			fmt.Printf("TUN: Intercepted %s %s:%d -> %s:%d\n", protoStr, srcIP, srcPort, dstIP, dstPort)
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

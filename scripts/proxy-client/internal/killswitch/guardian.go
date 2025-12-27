//go:build linux
// +build linux

package killswitch

import (
	"fmt"
	"os/exec"
	"strings"
)

func (g *Guardian) Enable() error {
	if !g.config.Enabled {
		return nil
	}

	// Block all outgoing traffic by default
	if err := g.blockAllTraffic(); err != nil {
		return fmt.Errorf("failed to enable kill switch: %w", err)
	}

	// Allow whitelisted traffic
	for _, addr := range g.config.Whitelist {
		if err := g.allowTraffic(addr); err != nil {
			return fmt.Errorf("failed to whitelist %s: %w", addr, err)
		}
	}

	g.enabled = true
	return nil
}

func (g *Guardian) Disable() error {
	if !g.enabled {
		return nil
	}

	// Remove all our iptables rules
	if err := g.removeRules(); err != nil {
		return fmt.Errorf("failed to disable kill switch: %w", err)
	}

	g.enabled = false
	return nil
}

func (g *Guardian) AllowProxy(proxyAddr string) error {
	if !g.enabled {
		return nil
	}

	return g.allowTraffic(proxyAddr)
}

func (g *Guardian) blockAllTraffic() error {
	// Create ATLANTIC_KILLSWITCH chain
	exec.Command("iptables", "-t", "filter", "-N", "ATLANTIC_KILLSWITCH").Run()

	// Block all OUTPUT traffic by default
	cmd := exec.Command("iptables", "-t", "filter", "-A", "OUTPUT", "-j", "ATLANTIC_KILLSWITCH")
	if err := cmd.Run(); err != nil {
		return err
	}

	// Default policy: DROP
	cmd = exec.Command("iptables", "-t", "filter", "-A", "ATLANTIC_KILLSWITCH", "-j", "DROP")
	return cmd.Run()
}

func (g *Guardian) allowTraffic(addr string) error {
	// Allow traffic to specific address
	var cmd *exec.Cmd

	if strings.Contains(addr, "/") {
		// CIDR notation
		cmd = exec.Command("iptables", "-t", "filter", "-I", "ATLANTIC_KILLSWITCH", "1", "-d", addr, "-j", "ACCEPT")
	} else if strings.Contains(addr, ":") {
		// Address with port
		parts := strings.Split(addr, ":")
		cmd = exec.Command("iptables", "-t", "filter", "-I", "ATLANTIC_KILLSWITCH", "1", "-d", parts[0], "-p", "tcp", "--dport", parts[1], "-j", "ACCEPT")
	} else {
		// Simple address
		cmd = exec.Command("iptables", "-t", "filter", "-I", "ATLANTIC_KILLSWITCH", "1", "-d", addr, "-j", "ACCEPT")
	}

	return cmd.Run()
}

func (g *Guardian) removeRules() error {
	// Remove our chain from OUTPUT
	exec.Command("iptables", "-t", "filter", "-D", "OUTPUT", "-j", "ATLANTIC_KILLSWITCH").Run()

	// Flush our chain
	exec.Command("iptables", "-t", "filter", "-F", "ATLANTIC_KILLSWITCH").Run()

	// Delete our chain
	exec.Command("iptables", "-t", "filter", "-X", "ATLANTIC_KILLSWITCH").Run()

	return nil
}

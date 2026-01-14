//go:build darwin
// +build darwin

package killswitch

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

// Define the PF anchor name
const pfAnchor = "com.atlantic.killswitch"

func (g *Guardian) blockAllTraffic() error {
	// macOS uses pf (Packet Filter)
	// We will create an anchor to hold our rules

	// 1. Enable pf if not enabled
	// -e: Enable
	// -E: Enable but do not load rules (if already enabled, does nothing)
	// We use -e but ignore output "pf already enabled" which is exit code 0 usually?
	// Actually `pfctl -e` returns 1 if already enabled on some versions, but 0 on newer.
	// Best to try enable and ignore error or check status.
	// We'll try to enable.
	exec.Command("pfctl", "-e").Run()

	// 2. Create the ruleset
	// Block all outgoing traffic by default
	// Allow traffic to local network (optional, but good for UX) -> usually 192.168.0.0/16, 10.0.0.0/8
	// But "Strict" mode usually means BLOCK ALL except Proxy.
	// For now, prompt: BLOCK OUT all on (outgoing interface)

	// We need to identify the active interface? PF handles "any" nicely usually, or "en0".
	// We'll block traffic on all interfaces
	rules := []string{
		"block drop out all",
		"pass out quick inet from any to 127.0.0.1/8", // Allow loopback for local proxy
		"pass out quick inet6 from any to ::1",        // Allow IPv6 loopback
		// We will add specific passes in allowTraffic
	}

	ruleBytes := bytes.NewBufferString(strings.Join(rules, "\n") + "\n")

	cmd := exec.Command("pfctl", "-a", pfAnchor, "-f", "-")
	cmd.Stdin = ruleBytes
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to apply block rules: %v (%s)", err, string(output))
	}

	return nil
}

func (g *Guardian) allowTraffic(addr string) error {
	// We need to modify the rules to add a "pass" line.
	// Unlike iptables, PF requires reloading the ruleset.
	// This is less efficient but functionally correct for typical desktop use.

	// Re-construct the baseline
	rules := []string{
		"block drop out all",
		"pass out quick inet from any to 127.0.0.1/8",
		"pass out quick inet6 from any to ::1",
	}

	// Add the specific allowance
	// addr might be IP or CIDR.
	// PF syntax: pass out quick proto tcp from any to <addr>
	// We'll allow all protocols to that destination for now to minimize breakage.
	if addr != "" {
		rules = append(rules, fmt.Sprintf("pass out quick from any to %s", addr))
	}

	ruleBytes := bytes.NewBufferString(strings.Join(rules, "\n") + "\n")

	cmd := exec.Command("pfctl", "-a", pfAnchor, "-f", "-")
	cmd.Stdin = ruleBytes
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to update allow rules: %v (%s)", err, string(output))
	}

	return nil
}

func (g *Guardian) removeRules() error {
	// Flush the anchor
	cmd := exec.Command("pfctl", "-a", pfAnchor, "-F", "all")
	if output, err := cmd.CombinedOutput(); err != nil {
		// Log but don't fail hard if it's already gone
		fmt.Printf("Warning: failed to clear pf rules: %v (%s)\n", err, string(output))
	}
	return nil
}

func (g *Guardian) Enable() error {
	if !g.config.Enabled {
		return nil
	}

	// WARNING: This requires root privileges (sudo).
	// If running without root, this will fail.

	if err := g.blockAllTraffic(); err != nil {
		return fmt.Errorf("failed to enable kill switch (root required?): %w", err)
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

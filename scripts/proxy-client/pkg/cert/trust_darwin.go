//go:build darwin

package cert

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func TrustCA() error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	certPath := filepath.Join(home, ".atlanticproxy", "certs", "ca.crt")

	// Check if already trusted to avoid repeated prompts
	// This is a simplified check
	if _, err := os.Stat(certPath); os.IsNotExist(err) {
		return fmt.Errorf("CA certificate not found at %s", certPath)
	}

	if os.Geteuid() != 0 {
		return fmt.Errorf("not running as root, skipping CA trust")
	}

	fmt.Printf("Trusting AtlanticProxy Root CA on macOS...\n")

	// Use security command to add to system keychain and trust
	// Note: This will prompt for user password via GUI if not run with sudo
	cmd := exec.Command("sudo", "security", "add-trusted-cert", "-d", "-r", "trustRoot", "-k", "/Library/Keychains/System.keychain", certPath)

	// For a better UX in a real app, we might use a helper tool or a localized prompt
	// but for the CLI/Service logic, sudo is the standard path.
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to trust CA: %w", err)
	}

	return nil
}

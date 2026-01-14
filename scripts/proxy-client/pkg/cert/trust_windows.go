//go:build windows

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

	if _, err := os.Stat(certPath); os.IsNotExist(err) {
		return fmt.Errorf("CA certificate not found at %s", certPath)
	}

	fmt.Printf("Trusting AtlanticProxy Root CA on Windows...\n")

	// certutil -addstore -f "ROOT" cert.pem
	cmd := exec.Command("certutil", "-addstore", "-f", "ROOT", certPath)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to trust CA on Windows: %w", err)
	}

	return nil
}

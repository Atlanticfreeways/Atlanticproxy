//go:build linux

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

	fmt.Printf("Trusting AtlanticProxy Root CA on Linux...\n")

	// Ubuntu/Debian: cp cert.pem /usr/local/share/ca-certificates/atlantic.crt && update-ca-certificates
	// Fedora/CentOS: cp cert.pem /etc/pki/ca-trust/source/anchors/ && update-ca-trust

	// Simplified for Debian/Ubuntu
	cmd := exec.Command("sudo", "cp", certPath, "/usr/local/share/ca-certificates/atlanticproxy.crt")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to copy cert to ca-certificates: %w", err)
	}

	cmd = exec.Command("sudo", "update-ca-certificates")
	return cmd.Run()
}

package cert

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"os"
	"path/filepath"
	"time"
)

func GetCA() (certPEM, keyPEM []byte, err error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, nil, err
	}
	caDir := filepath.Join(home, ".atlanticproxy", "certs")
	certPath := filepath.Join(caDir, "ca.crt")
	keyPath := filepath.Join(caDir, "ca.key")

	if _, err := os.Stat(certPath); err == nil {
		certPEM, _ = os.ReadFile(certPath)
		keyPEM, _ = os.ReadFile(keyPath)
		return certPEM, keyPEM, nil
	}

	return GenerateCA(caDir)
}

func GenerateCA(dir string) (certPEM, keyPEM []byte, err error) {
	if err := os.MkdirAll(dir, 0700); err != nil {
		return nil, nil, err
	}

	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, err
	}

	serialNumber, _ := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"Atlantic Proxy Limited"},
			CommonName:   "AtlanticProxy Root CA",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		KeyUsage:              x509.KeyUsageCertSign | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		return nil, nil, err
	}

	certPEM = pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	keyPEM = pem.EncodeToMemory(&pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)})

	os.WriteFile(filepath.Join(dir, "ca.crt"), certPEM, 0644)
	os.WriteFile(filepath.Join(dir, "ca.key"), keyPEM, 0600)

	return certPEM, keyPEM, nil
}

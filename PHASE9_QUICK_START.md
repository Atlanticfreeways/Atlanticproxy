# Phase 9: Quick Start - Data Encryption & Compliance

**Time:** 4-6 hours  
**Priority:** HIGH  
**Status:** READY TO START

---

## 🚀 QUICK OVERVIEW

Phase 9 secures your application by:
1. Encrypting sensitive data at rest
2. Configuring HTTPS/TLS for data in transit
3. Implementing audit logging for compliance
4. Ensuring GDPR compliance
5. Encrypting API keys and payment data
6. Implementing key rotation

---

## ⚡ QUICK TASKS

### 1. Create Encryption Module (1.5-2 hours)

**File:** `backend/internal/encryption/encryption.go`

```go
package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"io"
)

type Encryptor struct {
	key []byte
}

func NewEncryptor(key string) (*Encryptor, error) {
	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		keyBytes = make([]byte, 32)
		copy(keyBytes, key)
	}
	return &Encryptor{key: keyBytes}, nil
}

func (e *Encryptor) Encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(e.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func (e *Encryptor) Decrypt(ciphertext string) (string, error) {
	block, err := aes.NewCipher(e.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
```

**Test:** `backend/internal/encryption/encryption_test.go`

```go
package encryption

import (
	"testing"
)

func TestEncryptDecrypt(t *testing.T) {
	encryptor, err := NewEncryptor("my-secret-key-32-bytes-long!!!")
	if err != nil {
		t.Fatal(err)
	}

	plaintext := "sensitive data"
	encrypted, err := encryptor.Encrypt(plaintext)
	if err != nil {
		t.Fatal(err)
	}

	decrypted, err := encryptor.Decrypt(encrypted)
	if err != nil {
		t.Fatal(err)
	}

	if decrypted != plaintext {
		t.Errorf("Expected %s, got %s", plaintext, decrypted)
	}
}
```

---

### 2. Configure HTTPS/TLS (1-1.5 hours)

**File:** `backend/config/tls.go`

```go
package config

import (
	"crypto/tls"
	"log"
)

func GetTLSConfig() *tls.Config {
	return &tls.Config{
		MinVersion: tls.VersionTLS12,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		},
		PreferServerCipherSuites: true,
	}
}

func LoadCertificates(certFile, keyFile string) (tls.Certificate, error) {
	return tls.LoadX509KeyPair(certFile, keyFile)
}
```

**Update:** `backend/cmd/server/main.go`

```go
// Add to main function
tlsConfig := config.GetTLSConfig()
cert, err := config.LoadCertificates("certs/server.crt", "certs/server.key")
if err != nil {
	log.Printf("Warning: TLS certificates not found, running without HTTPS: %v", err)
} else {
	tlsConfig.Certificates = []tls.Certificate{cert}
	server.TLSConfig = tlsConfig
}
```

---

### 3. Implement Audit Logging (1-1.5 hours)

**File:** `backend/internal/audit/logger.go`

```go
package audit

import (
	"database/sql"
	"log"
	"time"
)

type AuditLog struct {
	ID        int
	UserID    int
	Action    string
	Resource  string
	Details   string
	Timestamp time.Time
	IPAddress string
}

type AuditLogger struct {
	db *sql.DB
}

func NewAuditLogger(db *sql.DB) *AuditLogger {
	return &AuditLogger{db: db}
}

func (al *AuditLogger) Log(userID int, action, resource, details, ipAddress string) error {
	query := `
		INSERT INTO audit_logs (user_id, action, resource, details, ip_address, timestamp)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	
	_, err := al.db.Exec(query, userID, action, resource, details, ipAddress, time.Now())
	if err != nil {
		log.Printf("Failed to log audit: %v", err)
		return err
	}
	
	return nil
}
```

---

### 4. Ensure GDPR Compliance (1-1.5 hours)

**File:** `backend/internal/gdpr/gdpr.go`

```go
package gdpr

import (
	"database/sql"
	"time"
)

type GDPRManager struct {
	db *sql.DB
}

func NewGDPRManager(db *sql.DB) *GDPRManager {
	return &GDPRManager{db: db}
}

// DeleteUserData deletes all user data (right to be forgotten)
func (gm *GDPRManager) DeleteUserData(userID int) error {
	tx, err := gm.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	tables := []string{
		"audit_logs",
		"billing_transactions",
		"proxy_connections",
		"proxy_usage",
		"referrals",
		"users",
	}
	
	for _, table := range tables {
		_, err := tx.Exec("DELETE FROM "+table+" WHERE user_id = $1", userID)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit().Error
}

// SetDataRetention sets data retention policy
func (gm *GDPRManager) SetDataRetention(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	_, err := gm.db.Exec(
		"DELETE FROM audit_logs WHERE timestamp < $1",
		cutoffDate,
	)
	return err
}
```

---

### 5. Encrypt API Keys & Payment Data (1-2 hours)

**Update services to use encryption:**

```go
// In your service
func (s *Service) StoreAPIKey(userID int, key string) error {
	encrypted, err := s.encryptor.Encrypt(key)
	if err != nil {
		return err
	}
	
	_, err = s.db.Exec(
		"INSERT INTO api_keys (user_id, key_encrypted) VALUES ($1, $2)",
		userID, encrypted,
	)
	return err
}

func (s *Service) GetAPIKey(userID int) (string, error) {
	var encrypted string
	err := s.db.QueryRow(
		"SELECT key_encrypted FROM api_keys WHERE user_id = $1",
		userID,
	).Scan(&encrypted)
	if err != nil {
		return "", err
	}
	
	return s.encryptor.Decrypt(encrypted)
}
```

---

### 6. Implement Key Rotation (1 hour)

**File:** `backend/internal/encryption/key_rotation.go`

```go
package encryption

import (
	"database/sql"
	"time"
)

type KeyRotation struct {
	db *sql.DB
}

func NewKeyRotation(db *sql.DB) *KeyRotation {
	return &KeyRotation{db: db}
}

func (kr *KeyRotation) RotateKeys(oldEncryptor, newEncryptor *Encryptor) error {
	rows, err := kr.db.Query("SELECT id, data FROM encrypted_data")
	if err != nil {
		return err
	}
	defer rows.Close()
	
	for rows.Next() {
		var id int
		var encryptedData string
		
		err := rows.Scan(&id, &encryptedData)
		if err != nil {
			return err
		}
		
		plaintext, err := oldEncryptor.Decrypt(encryptedData)
		if err != nil {
			return err
		}
		
		newEncrypted, err := newEncryptor.Encrypt(plaintext)
		if err != nil {
			return err
		}
		
		_, err = kr.db.Exec(
			"UPDATE encrypted_data SET data = $1, rotated_at = $2 WHERE id = $3",
			newEncrypted, time.Now(), id,
		)
		if err != nil {
			return err
		}
	}
	
	return nil
}
```

---

## 📋 CHECKLIST

- [ ] Encryption module created
- [ ] HTTPS/TLS configured
- [ ] Audit logging implemented
- [ ] GDPR compliance verified
- [ ] API keys encrypted
- [ ] Payment data encrypted
- [ ] Key rotation working
- [ ] All tests pass
- [ ] Documentation updated

---

## 🎯 SUCCESS CRITERIA

- All sensitive data encrypted at rest
- HTTPS/TLS working
- Audit logs being recorded
- GDPR compliance verified
- No security warnings
- All tests passing

---

**Phase 9: Data Encryption & Compliance**  
**Time: 4-6 hours**  
**Status: READY TO START**

🔐 **Let's secure this!**

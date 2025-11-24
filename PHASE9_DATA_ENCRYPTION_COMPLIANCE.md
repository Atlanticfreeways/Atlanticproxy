# Phase 9: Data Encryption & Compliance - START HERE 🔐

**Status:** READY TO START  
**Date:** November 24, 2025  
**Estimated Duration:** 4-6 hours  
**Priority:** HIGH

---

## 📋 PHASE 9 OVERVIEW

Phase 9 focuses on securing sensitive data and ensuring compliance with regulations like GDPR, CCPA, and industry standards.

### What This Phase Accomplishes
- ✅ Encrypt sensitive data at rest
- ✅ Configure HTTPS/TLS for data in transit
- ✅ Implement audit logging for compliance
- ✅ Ensure GDPR compliance
- ✅ Add encryption for API keys
- ✅ Add encryption for payment data
- ✅ Implement key rotation
- ✅ Add data retention policies

---

## 🎯 PHASE 9 TASKS

### Task 1: Encrypt Sensitive Data at Rest (1.5-2 hours)

**What to Encrypt:**
- User passwords (already done with bcrypt)
- API keys
- Payment tokens
- Personal information (PII)
- Session data

**Implementation:**
```go
// backend/internal/encryption/encryption.go
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
	// Key should be 32 bytes for AES-256
	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		// Pad or hash to 32 bytes
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

**Files to Create:**
- `backend/internal/encryption/encryption.go` - Encryption utilities
- `backend/internal/encryption/encryption_test.go` - Tests

**Acceptance Criteria:**
- [ ] Encryption module created
- [ ] AES-256-GCM implemented
- [ ] Encrypt/decrypt functions working
- [ ] Tests pass
- [ ] No plaintext sensitive data in database

---

### Task 2: Configure HTTPS/TLS (1-1.5 hours)

**What to Configure:**
- SSL/TLS certificates
- HTTPS on backend
- HTTPS on frontend
- Certificate renewal

**Implementation:**
```go
// backend/cmd/server/main.go
package main

import (
	"crypto/tls"
	"log"
	"net/http"
)

func main() {
	// Load certificates
	cert, err := tls.LoadX509KeyPair(
		"certs/server.crt",
		"certs/server.key",
	)
	if err != nil {
		log.Fatal(err)
	}

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{cert},
		MinVersion:   tls.VersionTLS12,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		},
	}

	server := &http.Server{
		Addr:      ":5000",
		TLSConfig: tlsConfig,
	}

	log.Fatal(server.ListenAndServeTLS("", ""))
}
```

**Files to Create:**
- `backend/config/tls.go` - TLS configuration
- `certs/` - Certificate directory (gitignored)

**Acceptance Criteria:**
- [ ] TLS configuration implemented
- [ ] HTTPS working on backend
- [ ] HTTPS working on frontend
- [ ] Certificate validation working
- [ ] Secure cipher suites configured

---

### Task 3: Implement Audit Logging (1-1.5 hours)

**What to Log:**
- User login/logout
- Data access
- Data modifications
- Admin actions
- Security events
- Failed authentication attempts

**Implementation:**
```go
// backend/internal/audit/logger.go
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

func (al *AuditLogger) GetLogs(userID int, limit int) ([]AuditLog, error) {
	query := `
		SELECT id, user_id, action, resource, details, timestamp, ip_address
		FROM audit_logs
		WHERE user_id = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`
	
	rows, err := al.db.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var logs []AuditLog
	for rows.Next() {
		var log AuditLog
		err := rows.Scan(&log.ID, &log.UserID, &log.Action, &log.Resource, &log.Details, &log.Timestamp, &log.IPAddress)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	
	return logs, nil
}
```

**Files to Create:**
- `backend/internal/audit/logger.go` - Audit logging
- `backend/internal/audit/logger_test.go` - Tests
- Database migration for audit_logs table

**Acceptance Criteria:**
- [ ] Audit logging implemented
- [ ] All critical actions logged
- [ ] Audit logs stored in database
- [ ] Audit logs retrievable
- [ ] Tests pass

---

### Task 4: Ensure GDPR Compliance (1-1.5 hours)

**What to Implement:**
- Data export functionality
- Data deletion (right to be forgotten)
- Consent management
- Privacy policy
- Data retention policies

**Implementation:**
```go
// backend/internal/gdpr/gdpr.go
package gdpr

import (
	"database/sql"
	"encoding/json"
	"time"
)

type GDPRManager struct {
	db *sql.DB
}

func NewGDPRManager(db *sql.DB) *GDPRManager {
	return &GDPRManager{db: db}
}

// ExportUserData exports all user data
func (gm *GDPRManager) ExportUserData(userID int) (map[string]interface{}, error) {
	data := make(map[string]interface{})
	
	// Get user info
	var user struct {
		ID    int
		Email string
		Name  string
	}
	
	err := gm.db.QueryRow("SELECT id, email, name FROM users WHERE id = $1", userID).
		Scan(&user.ID, &user.Email, &user.Name)
	if err != nil {
		return nil, err
	}
	
	data["user"] = user
	
	// Get user's proxy connections
	rows, err := gm.db.Query("SELECT * FROM proxy_connections WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var connections []interface{}
	// Scan and append connections
	data["proxy_connections"] = connections
	
	// Get user's transactions
	rows, err = gm.db.Query("SELECT * FROM billing_transactions WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var transactions []interface{}
	// Scan and append transactions
	data["transactions"] = transactions
	
	return data, nil
}

// DeleteUserData deletes all user data (right to be forgotten)
func (gm *GDPRManager) DeleteUserData(userID int) error {
	tx, err := gm.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Delete user data in order of dependencies
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
	// Delete old audit logs
	cutoffDate := time.Now().AddDate(0, 0, -days)
	_, err := gm.db.Exec(
		"DELETE FROM audit_logs WHERE timestamp < $1",
		cutoffDate,
	)
	return err
}
```

**Files to Create:**
- `backend/internal/gdpr/gdpr.go` - GDPR utilities
- `backend/internal/gdpr/gdpr_test.go` - Tests
- `backend/api/gdpr_handlers.go` - GDPR endpoints

**Acceptance Criteria:**
- [ ] Data export working
- [ ] Data deletion working
- [ ] Consent management implemented
- [ ] Privacy policy created
- [ ] Data retention policies enforced

---

### Task 5: Add Encryption for API Keys (0.5-1 hour)

**Implementation:**
```go
// Encrypt API keys before storing
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

// Decrypt API keys when needed
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

**Acceptance Criteria:**
- [ ] API keys encrypted at rest
- [ ] Decryption working
- [ ] Tests pass

---

### Task 6: Add Encryption for Payment Data (0.5-1 hour)

**Implementation:**
```go
// Encrypt payment tokens
func (s *Service) StorePaymentToken(userID int, token string) error {
	encrypted, err := s.encryptor.Encrypt(token)
	if err != nil {
		return err
	}
	
	_, err = s.db.Exec(
		"INSERT INTO payment_methods (user_id, token_encrypted) VALUES ($1, $2)",
		userID, encrypted,
	)
	return err
}

// Decrypt payment tokens
func (s *Service) GetPaymentToken(userID int) (string, error) {
	var encrypted string
	err := s.db.QueryRow(
		"SELECT token_encrypted FROM payment_methods WHERE user_id = $1",
		userID,
	).Scan(&encrypted)
	if err != nil {
		return "", err
	}
	
	return s.encryptor.Decrypt(encrypted)
}
```

**Acceptance Criteria:**
- [ ] Payment tokens encrypted
- [ ] Decryption working
- [ ] Tests pass

---

### Task 7: Implement Key Rotation (1 hour)

**Implementation:**
```go
// backend/internal/encryption/key_rotation.go
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

// RotateKeys rotates encryption keys
func (kr *KeyRotation) RotateKeys(oldEncryptor, newEncryptor *Encryptor) error {
	// Get all encrypted data
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
		
		// Decrypt with old key
		plaintext, err := oldEncryptor.Decrypt(encryptedData)
		if err != nil {
			return err
		}
		
		// Encrypt with new key
		newEncrypted, err := newEncryptor.Encrypt(plaintext)
		if err != nil {
			return err
		}
		
		// Update database
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

**Files to Create:**
- `backend/internal/encryption/key_rotation.go` - Key rotation
- `backend/internal/encryption/key_rotation_test.go` - Tests

**Acceptance Criteria:**
- [ ] Key rotation implemented
- [ ] Old data re-encrypted with new key
- [ ] Tests pass

---

## 📊 TASK BREAKDOWN

| Task | Hours | Status |
|------|-------|--------|
| Encrypt Sensitive Data | 1.5-2 | ⏳ Ready |
| Configure HTTPS/TLS | 1-1.5 | ⏳ Ready |
| Implement Audit Logging | 1-1.5 | ⏳ Ready |
| Ensure GDPR Compliance | 1-1.5 | ⏳ Ready |
| Encrypt API Keys | 0.5-1 | ⏳ Ready |
| Encrypt Payment Data | 0.5-1 | ⏳ Ready |
| Implement Key Rotation | 1 | ⏳ Ready |
| **TOTAL** | **6-8** | - |

---

## 🎯 SUCCESS CRITERIA

- [ ] All sensitive data encrypted at rest
- [ ] HTTPS/TLS configured
- [ ] Audit logging implemented
- [ ] GDPR compliance verified
- [ ] API keys encrypted
- [ ] Payment data encrypted
- [ ] Key rotation working
- [ ] All tests pass
- [ ] No security warnings
- [ ] Documentation updated

---

## 📁 FILES TO CREATE

```
backend/internal/
├── encryption/
│   ├── encryption.go
│   ├── encryption_test.go
│   ├── key_rotation.go
│   └── key_rotation_test.go
├── audit/
│   ├── logger.go
│   └── logger_test.go
├── gdpr/
│   ├── gdpr.go
│   └── gdpr_test.go
└── config/
    └── tls.go

backend/api/
└── gdpr_handlers.go

certs/
├── server.crt (gitignored)
└── server.key (gitignored)
```

---

## 🚀 NEXT STEPS

1. **Create encryption module** (1.5-2 hours)
2. **Configure HTTPS/TLS** (1-1.5 hours)
3. **Implement audit logging** (1-1.5 hours)
4. **Ensure GDPR compliance** (1-1.5 hours)
5. **Encrypt sensitive data** (1-2 hours)
6. **Implement key rotation** (1 hour)
7. **Test everything** (1 hour)
8. **Update documentation** (0.5 hour)

---

## 📞 RESOURCES

- OWASP Encryption: https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
- GDPR Compliance: https://gdpr-info.eu/
- TLS Best Practices: https://wiki.mozilla.org/Security/Server_Side_TLS

---

**Phase 9: Data Encryption & Compliance**  
**Status: READY TO START**  
**Estimated Time: 4-6 hours**  
**Next: Phase 10 - API Documentation**

🔐 **Let's secure this application!**

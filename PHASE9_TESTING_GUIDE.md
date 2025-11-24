# Phase 9: Testing & Verification Guide

## 🧪 Unit Tests

### Run All Tests
```bash
cd backend
go test ./internal/encryption -v
go test ./internal/audit -v
go test ./internal/gdpr -v
```

### Encryption Tests
```bash
go test ./internal/encryption -v -run TestEncryptDecrypt
go test ./internal/encryption -v -run TestEncryptMultipleTimes
go test ./internal/encryption -v -run TestDecryptInvalidData
go test ./internal/encryption -v -run TestKeyPadding
```

**Expected Output:**
```
=== RUN   TestEncryptDecrypt
--- PASS: TestEncryptDecrypt (0.01s)
=== RUN   TestEncryptMultipleTimes
--- PASS: TestEncryptMultipleTimes (0.02s)
=== RUN   TestDecryptInvalidData
--- PASS: TestDecryptInvalidData (0.01s)
=== RUN   TestKeyPadding
--- PASS: TestKeyPadding (0.01s)
ok      atlanticproxy/backend/internal/encryption       0.05s
```

---

## 🔐 Integration Tests

### 1. Test Encryption in Service

**Create test file:** `backend/tests/encryption_integration_test.go`

```go
package tests

import (
	"atlanticproxy/backend/internal/encryption"
	"testing"
)

func TestEncryptionIntegration(t *testing.T) {
	// Create encryptor
	encryptor, err := encryption.NewEncryptor("test-key-32-bytes-long-here!!")
	if err != nil {
		t.Fatalf("Failed to create encryptor: %v", err)
	}

	// Test data
	testCases := []string{
		"simple text",
		"email@example.com",
		"payment-token-12345",
		"api-key-secret-xyz",
		"",
	}

	for _, plaintext := range testCases {
		// Encrypt
		encrypted, err := encryptor.Encrypt(plaintext)
		if err != nil {
			t.Errorf("Failed to encrypt '%s': %v", plaintext, err)
			continue
		}

		// Decrypt
		decrypted, err := encryptor.Decrypt(encrypted)
		if err != nil {
			t.Errorf("Failed to decrypt: %v", err)
			continue
		}

		// Verify
		if decrypted != plaintext {
			t.Errorf("Mismatch: expected '%s', got '%s'", plaintext, decrypted)
		}
	}
}
```

### 2. Test Audit Logging

**Create test file:** `backend/tests/audit_integration_test.go`

```go
package tests

import (
	"atlanticproxy/backend/internal/audit"
	"atlanticproxy/backend/internal/database"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func TestAuditLogging(t *testing.T) {
	// Connect to test database
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		t.Skipf("Could not connect to test database: %v", err)
	}
	defer db.Close()

	// Initialize schema
	database.InitializeDatabase(db)

	// Create audit logger
	auditLogger := audit.NewAuditLogger(db)

	// Log test events
	err = auditLogger.Log(1, "LOGIN", "/api/auth/login", "Test login", "192.168.1.1")
	if err != nil {
		t.Fatalf("Failed to log event: %v", err)
	}

	// Retrieve logs
	logs, err := auditLogger.GetUserLogs(1, 10)
	if err != nil {
		t.Fatalf("Failed to get logs: %v", err)
	}

	if len(logs) == 0 {
		t.Error("No logs found")
	}

	// Verify log content
	if logs[0].Action != "LOGIN" {
		t.Errorf("Expected action 'LOGIN', got '%s'", logs[0].Action)
	}
}
```

### 3. Test GDPR Compliance

**Create test file:** `backend/tests/gdpr_integration_test.go`

```go
package tests

import (
	"atlanticproxy/backend/internal/database"
	"atlanticproxy/backend/internal/gdpr"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func TestGDPRDataExport(t *testing.T) {
	// Connect to test database
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		t.Skipf("Could not connect to test database: %v", err)
	}
	defer db.Close()

	// Initialize schema
	database.InitializeDatabase(db)

	// Create test user
	var userID int
	err = db.QueryRow(
		"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
		"test@example.com",
		"hash",
	).Scan(&userID)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Create GDPR manager
	gdprManager := gdpr.NewGDPRManager(db)

	// Export user data
	data, err := gdprManager.ExportUserData(userID)
	if err != nil {
		t.Fatalf("Failed to export user data: %v", err)
	}

	// Verify data structure
	if _, ok := data["user"]; !ok {
		t.Error("User data not found in export")
	}

	if _, ok := data["audit_logs"]; !ok {
		t.Error("Audit logs not found in export")
	}
}

func TestGDPRDataDeletion(t *testing.T) {
	// Connect to test database
	db, err := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	if err != nil {
		t.Skipf("Could not connect to test database: %v", err)
	}
	defer db.Close()

	// Initialize schema
	database.InitializeDatabase(db)

	// Create test user
	var userID int
	err = db.QueryRow(
		"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
		"delete@example.com",
		"hash",
	).Scan(&userID)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Create GDPR manager
	gdprManager := gdpr.NewGDPRManager(db)

	// Delete user data
	err = gdprManager.DeleteUserData(userID)
	if err != nil {
		t.Fatalf("Failed to delete user data: %v", err)
	}

	// Verify user is deleted
	var count int
	err = db.Get(&count, "SELECT COUNT(*) FROM users WHERE id = $1", userID)
	if err != nil {
		t.Fatalf("Failed to query users: %v", err)
	}

	if count != 0 {
		t.Error("User was not deleted")
	}
}
```

---

## 🔒 Manual Testing

### 1. Test Encryption Endpoint

**Create endpoint:** `backend/cmd/server/handlers.go`

```go
func encryptionTestHandler(encryptor *encryption.Encryptor) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Data string `json:"data"`
		}

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		encrypted, err := encryptor.Encrypt(req.Data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		decrypted, err := encryptor.Decrypt(encrypted)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"original":  req.Data,
			"encrypted": encrypted,
			"decrypted": decrypted,
			"match":     req.Data == decrypted,
		})
	}
}
```

**Test with curl:**
```bash
curl -X POST http://localhost:5000/api/test/encrypt \
  -H "Content-Type: application/json" \
  -d '{"data":"test data"}'
```

### 2. Test Audit Logging

**Query audit logs:**
```bash
# Connect to database
psql -U postgres -d atlantic_proxy

# View recent audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;

# View logs for specific user
SELECT * FROM audit_logs WHERE user_id = 1 ORDER BY timestamp DESC;

# Count logs by action
SELECT action, COUNT(*) FROM audit_logs GROUP BY action;
```

### 3. Test GDPR Export

**Create endpoint:** `backend/cmd/server/handlers.go`

```go
func gdprExportHandler(gdprManager *gdpr.GDPRManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		data, err := gdprManager.ExportUserData(userID.(int))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, data)
	}
}
```

**Test with curl:**
```bash
curl -X GET http://localhost:5000/api/gdpr/export \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test TLS Configuration

**Check TLS is working:**
```bash
# Test HTTPS connection
curl -k https://localhost:5000/health

# Check certificate
openssl s_client -connect localhost:5000 -showcerts

# Verify TLS version
curl -I --tlsv1.2 https://localhost:5000/health
```

---

## 📊 Performance Testing

### Encryption Performance

**Create benchmark:** `backend/internal/encryption/encryption_bench_test.go`

```go
package encryption

import (
	"testing"
)

func BenchmarkEncrypt(b *testing.B) {
	encryptor, _ := NewEncryptor("test-key-32-bytes-long-here!!")
	plaintext := "test data to encrypt"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		encryptor.Encrypt(plaintext)
	}
}

func BenchmarkDecrypt(b *testing.B) {
	encryptor, _ := NewEncryptor("test-key-32-bytes-long-here!!")
	encrypted, _ := encryptor.Encrypt("test data")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		encryptor.Decrypt(encrypted)
	}
}
```

**Run benchmarks:**
```bash
go test -bench=. -benchmem ./internal/encryption
```

### Audit Logging Performance

**Create benchmark:** `backend/internal/audit/logger_bench_test.go`

```go
package audit

import (
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func BenchmarkAuditLog(b *testing.B) {
	db, _ := sqlx.Connect("postgres", "postgres://postgres:password@localhost:5432/atlantic_proxy_test?sslmode=disable")
	defer db.Close()

	auditLogger := NewAuditLogger(db)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		auditLogger.Log(1, "TEST", "/test", "test", "192.168.1.1")
	}
}
```

---

## ✅ Verification Checklist

### Encryption
- [ ] Encrypt/decrypt roundtrip works
- [ ] Different encryptions produce different ciphertexts
- [ ] Invalid data handled gracefully
- [ ] Performance acceptable (< 1ms per operation)
- [ ] Key padding works for short keys

### Audit Logging
- [ ] Events logged to database
- [ ] User ID tracked correctly
- [ ] IP address captured
- [ ] Timestamps accurate
- [ ] Old logs can be deleted

### GDPR Compliance
- [ ] User data can be exported
- [ ] User data can be deleted
- [ ] User data can be anonymized
- [ ] Data retention policy works
- [ ] Transactions ensure consistency

### TLS/HTTPS
- [ ] Server starts with TLS
- [ ] HTTPS connections work
- [ ] TLS 1.2+ enforced
- [ ] Strong cipher suites used
- [ ] Security headers present

### Database
- [ ] All tables created
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Cascading deletes work
- [ ] Transactions supported

---

## 🐛 Troubleshooting

### Encryption Key Issues
```
Error: "ciphertext too short"
Solution: Ensure key is 32 bytes, use NewEncryptor() correctly
```

### Database Connection Issues
```
Error: "failed to connect to database"
Solution: Check DATABASE_URL, ensure PostgreSQL is running
```

### TLS Certificate Issues
```
Error: "failed to load certificates"
Solution: Generate certificates with openssl, set TLS_CERT_FILE and TLS_KEY_FILE
```

### Audit Logging Issues
```
Error: "failed to log audit"
Solution: Ensure audit_logs table exists, check database permissions
```

---

## 📈 Monitoring

### Monitor Encryption Performance
```sql
-- Check encryption operations per second
SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '1 minute';
```

### Monitor Audit Logs
```sql
-- Check audit log growth
SELECT DATE(timestamp), COUNT(*) FROM audit_logs GROUP BY DATE(timestamp);

-- Find suspicious activity
SELECT * FROM audit_logs WHERE action = 'FAILED_LOGIN' ORDER BY timestamp DESC;
```

### Monitor Key Rotation
```sql
-- Check rotation status
SELECT COUNT(*) as unrotated FROM api_keys WHERE rotated_at IS NULL;
SELECT MAX(rotated_at) as last_rotation FROM api_keys;
```

---

**Phase 9 Testing Complete!** ✅

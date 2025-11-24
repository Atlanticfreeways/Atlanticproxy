# Phase 9: Quick Reference Guide

## 🔐 Encryption Module

### Basic Usage
```go
import "atlanticproxy/backend/internal/encryption"

// Create encryptor
encryptor, err := encryption.NewEncryptor("your-32-byte-key-here!!")
if err != nil {
    log.Fatal(err)
}

// Encrypt data
encrypted, err := encryptor.Encrypt("sensitive data")

// Decrypt data
plaintext, err := encryptor.Decrypt(encrypted)
```

### In Services
```go
// Store encrypted API key
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

// Retrieve and decrypt API key
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

## 📋 Audit Logging

### Basic Usage
```go
import "atlanticproxy/backend/internal/audit"

// Create audit logger
auditLogger := audit.NewAuditLogger(db)

// Log an action
err := auditLogger.Log(
    userID,
    "LOGIN",
    "/api/auth/login",
    "User logged in successfully",
    "192.168.1.1",
)

// Get user's audit history
logs, err := auditLogger.GetUserLogs(userID, 100)

// Delete old logs (retention policy)
err := auditLogger.DeleteOldLogs(90) // Delete logs older than 90 days
```

### In Handlers
```go
// Log user action in handler
func loginHandler(c *gin.Context) {
    // ... authentication logic ...
    
    // Log successful login
    auditLogger.Log(
        user.ID,
        "LOGIN",
        "/api/auth/login",
        "Successful login",
        c.ClientIP(),
    )
}
```

---

## 🛡️ GDPR Compliance

### Delete User Data
```go
import "atlanticproxy/backend/internal/gdpr"

gdprManager := gdpr.NewGDPRManager(db)

// Delete all user data (right to be forgotten)
err := gdprManager.DeleteUserData(userID)
```

### Export User Data
```go
// Export all user data for GDPR compliance
data, err := gdprManager.ExportUserData(userID)
// Returns map with: user, proxy_connections, proxy_usage, 
// billing_transactions, audit_logs
```

### Anonymize User Data
```go
// Anonymize instead of delete
err := gdprManager.AnonymizeUserData(userID)
// Changes email to anonymized_[id]@example.com
// Replaces IP addresses with "ANONYMIZED"
```

### Data Retention
```go
// Delete records older than 90 days
err := gdprManager.SetDataRetention(90)
```

---

## 🔄 Key Rotation

### Rotate Keys
```go
import "atlanticproxy/backend/internal/encryption"

keyRotation := encryption.NewKeyRotation(db)

// Create new encryptor with new key
newEncryptor, err := encryption.NewEncryptor(newKey)

// Rotate all keys
err := keyRotation.RotateKeys(oldEncryptor, newEncryptor)
```

### Check Rotation Status
```go
status, err := keyRotation.GetRotationStatus()
// Returns: unrotated_api_keys, unrotated_encrypted_data, last_rotation
```

---

## 🔒 TLS Configuration

### Generate Certificates (Development)
```bash
# Self-signed certificate
openssl req -x509 -newkey rsa:4096 \
    -keyout certs/server.key \
    -out certs/server.crt \
    -days 365 -nodes
```

### Environment Variables
```bash
export ENCRYPTION_KEY="your-32-byte-encryption-key-here!!"
export TLS_CERT_FILE="certs/server.crt"
export TLS_KEY_FILE="certs/server.key"
```

### Server Configuration
```go
// Automatically configured in main.go
// TLS loads if certificates exist
// Falls back to HTTP if not available
```

---

## 📊 Database Tables

### audit_logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    resource VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP
);
```

### api_keys
```sql
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    key_encrypted TEXT,
    created_at TIMESTAMP,
    rotated_at TIMESTAMP
);
```

### encrypted_data
```sql
CREATE TABLE encrypted_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data_type VARCHAR(50),
    data_encrypted TEXT,
    created_at TIMESTAMP,
    rotated_at TIMESTAMP
);
```

---

## 🧪 Testing

### Run Encryption Tests
```bash
cd backend
go test ./internal/encryption -v
```

### Test Audit Logging
```bash
# Logs are automatically recorded
# Query audit_logs table to verify
SELECT * FROM audit_logs WHERE user_id = 1 ORDER BY timestamp DESC;
```

### Test GDPR Export
```bash
# Call export endpoint
curl -X GET http://localhost:5000/api/gdpr/export \
    -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Integration Checklist

- [ ] Encryption module imported in services
- [ ] Audit logger initialized in main.go
- [ ] GDPR manager available for compliance
- [ ] TLS certificates generated
- [ ] Environment variables set
- [ ] Database tables created
- [ ] Tests passing
- [ ] Security headers enabled
- [ ] Audit middleware active
- [ ] Key rotation tested

---

## 📚 Common Patterns

### Encrypt Sensitive Data
```go
// In service initialization
encryptor, _ := encryption.NewEncryptor(os.Getenv("ENCRYPTION_KEY"))

// When storing
encrypted, _ := encryptor.Encrypt(sensitiveData)
db.Exec("INSERT INTO table (data) VALUES ($1)", encrypted)

// When retrieving
var encrypted string
db.QueryRow("SELECT data FROM table WHERE id = $1", id).Scan(&encrypted)
plaintext, _ := encryptor.Decrypt(encrypted)
```

### Log User Actions
```go
// In handler
auditLogger.Log(
    userID,
    "ACTION_NAME",
    c.Request.URL.Path,
    "Additional details",
    c.ClientIP(),
)
```

### Handle GDPR Requests
```go
// Export data
data, _ := gdprManager.ExportUserData(userID)
// Return as JSON

// Delete data
gdprManager.DeleteUserData(userID)
// Confirm deletion

// Anonymize data
gdprManager.AnonymizeUserData(userID)
// Confirm anonymization
```

---

## ⚠️ Important Notes

1. **Encryption Key**: Keep your encryption key secure. Use environment variables or key management services.
2. **TLS Certificates**: Use proper certificates in production (Let's Encrypt, AWS ACM, etc.)
3. **Audit Logs**: Implement retention policies to manage storage
4. **Key Rotation**: Plan regular key rotation schedule
5. **Backups**: Ensure encrypted data is backed up securely

---

## 🔗 Related Files

- `backend/internal/encryption/encryption.go` - Core encryption
- `backend/internal/audit/logger.go` - Audit logging
- `backend/internal/gdpr/gdpr.go` - GDPR compliance
- `backend/internal/config/tls.go` - TLS configuration
- `backend/cmd/server/main.go` - Server integration
- `backend/internal/database/init.go` - Database schema

---

**Phase 9 Complete - Ready for Production Deployment!** 🚀

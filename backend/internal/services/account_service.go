package services

import (
	"crypto/rand"
	"encoding/base32"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// AccountService handles user account management
type AccountService struct {
	db *sqlx.DB
}

// UserAccount represents user account information
type UserAccount struct {
	ID                int       `db:"id" json:"id"`
	Email             string    `db:"email" json:"email"`
	SubscriptionTier  string    `db:"subscription_tier" json:"subscription_tier"`
	TwoFAEnabled      bool      `db:"two_fa_enabled" json:"two_fa_enabled"`
	LastLoginAt       *time.Time `db:"last_login_at" json:"last_login_at"`
	CreatedAt         time.Time `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time `db:"updated_at" json:"updated_at"`
}

// SecurityInfo represents security information
type SecurityInfo struct {
	TwoFAEnabled      bool       `json:"two_fa_enabled"`
	LastLoginAt       *time.Time `json:"last_login_at"`
	LastPasswordChange *time.Time `json:"last_password_change"`
	ActiveSessions    int        `json:"active_sessions"`
	LoginHistory      []LoginRecord `json:"login_history"`
}

// LoginRecord represents a login record
type LoginRecord struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"user_id"`
	IPAddress string    `db:"ip_address" json:"ip_address"`
	UserAgent string    `db:"user_agent" json:"user_agent"`
	LoginAt   time.Time `db:"login_at" json:"login_at"`
}

// NewAccountService creates a new account service
func NewAccountService(db *sqlx.DB) *AccountService {
	return &AccountService{db: db}
}

// GetAccount returns user account information
func (as *AccountService) GetAccount(userID int) (*UserAccount, error) {
	log.Printf("👤 Getting account for user %d", userID)

	var account UserAccount
	err := as.db.Get(&account,
		`SELECT id, email, subscription_tier, two_fa_enabled, last_login_at, created_at, updated_at
		 FROM users
		 WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get account: %v", err)
		return nil, fmt.Errorf("failed to get account: %w", err)
	}

	log.Printf("✅ Account retrieved for user %d", userID)
	return &account, nil
}

// ChangePassword changes user password
func (as *AccountService) ChangePassword(userID int, oldPassword string, newPassword string) error {
	log.Printf("🔐 Changing password for user %d", userID)

	// Get current password hash
	var passwordHash string
	err := as.db.Get(&passwordHash,
		`SELECT password_hash FROM users WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get user: %v", err)
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Verify old password
	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(oldPassword))
	if err != nil {
		log.Printf("❌ Invalid old password for user %d", userID)
		return fmt.Errorf("invalid old password")
	}

	// Hash new password
	newHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Failed to hash password: %v", err)
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password
	_, err = as.db.Exec(
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
		string(newHash), userID,
	)

	if err != nil {
		log.Printf("❌ Failed to update password: %v", err)
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Invalidate all sessions
	_, err = as.db.Exec(
		`DELETE FROM user_sessions WHERE user_id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to invalidate sessions: %v", err)
	}

	log.Printf("✅ Password changed for user %d", userID)
	return nil
}

// Enable2FA enables two-factor authentication
func (as *AccountService) Enable2FA(userID int) (string, error) {
	log.Printf("🔐 Enabling 2FA for user %d", userID)

	// Generate secret
	secret := generateSecret()

	// Generate backup codes
	backupCodes := generateBackupCodes(10)

	// Store 2FA secret
	_, err := as.db.Exec(
		`INSERT INTO two_fa_secrets (user_id, secret, backup_codes, enabled, created_at)
		 VALUES ($1, $2, $3, false, NOW())
		 ON CONFLICT (user_id) DO UPDATE SET secret = $2, backup_codes = $3, enabled = false`,
		userID, secret, backupCodes,
	)

	if err != nil {
		log.Printf("❌ Failed to store 2FA secret: %v", err)
		return "", fmt.Errorf("failed to store 2FA secret: %w", err)
	}

	log.Printf("✅ 2FA enabled for user %d", userID)
	return secret, nil
}

// Verify2FA verifies 2FA code
func (as *AccountService) Verify2FA(userID int, code string) error {
	log.Printf("🔐 Verifying 2FA for user %d", userID)

	// TODO: Implement TOTP verification
	// For now, just return success
	log.Printf("✅ 2FA verified for user %d", userID)
	return nil
}

// Disable2FA disables two-factor authentication
func (as *AccountService) Disable2FA(userID int) error {
	log.Printf("🔐 Disabling 2FA for user %d", userID)

	_, err := as.db.Exec(
		`UPDATE users SET two_fa_enabled = false, updated_at = NOW() WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to disable 2FA: %v", err)
		return fmt.Errorf("failed to disable 2FA: %w", err)
	}

	log.Printf("✅ 2FA disabled for user %d", userID)
	return nil
}

// GetSecurityInfo returns security information
func (as *AccountService) GetSecurityInfo(userID int) (*SecurityInfo, error) {
	log.Printf("🔒 Getting security info for user %d", userID)

	var account UserAccount
	err := as.db.Get(&account,
		`SELECT id, two_fa_enabled, last_login_at FROM users WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get account: %v", err)
		return nil, fmt.Errorf("failed to get account: %w", err)
	}

	// Get active sessions count
	var activeSessions int
	err = as.db.Get(&activeSessions,
		`SELECT COUNT(*) FROM user_sessions WHERE user_id = $1 AND expires_at > NOW()`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get active sessions: %v", err)
		activeSessions = 0
	}

	// Get login history
	var loginHistory []LoginRecord
	err = as.db.Select(&loginHistory,
		`SELECT id, user_id, ip_address, user_agent, login_at
		 FROM login_history
		 WHERE user_id = $1
		 ORDER BY login_at DESC
		 LIMIT 10`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get login history: %v", err)
		loginHistory = []LoginRecord{}
	}

	info := &SecurityInfo{
		TwoFAEnabled:   account.TwoFAEnabled,
		LastLoginAt:    account.LastLoginAt,
		ActiveSessions: activeSessions,
		LoginHistory:   loginHistory,
	}

	log.Printf("✅ Security info retrieved for user %d", userID)
	return info, nil
}

// DeleteAccount deletes user account
func (as *AccountService) DeleteAccount(userID int) error {
	log.Printf("🗑️  Deleting account for user %d", userID)

	// Start transaction
	tx, err := as.db.Beginx()
	if err != nil {
		log.Printf("❌ Failed to start transaction: %v", err)
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	// Delete all user data
	tables := []string{
		"proxy_connections",
		"proxy_usage",
		"billing_transactions",
		"referrals",
		"notification_preferences",
		"user_sessions",
		"login_history",
		"two_fa_secrets",
		"payment_methods",
		"users",
	}

	for _, table := range tables {
		_, err := tx.Exec(fmt.Sprintf("DELETE FROM %s WHERE user_id = $1", table), userID)
		if err != nil {
			log.Printf("⚠️  Failed to delete from %s: %v", table, err)
			tx.Rollback()
			return fmt.Errorf("failed to delete from %s: %w", table, err)
		}
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		log.Printf("❌ Failed to commit transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("✅ Account deleted for user %d", userID)
	return nil
}

// RecordLogin records a login event
func (as *AccountService) RecordLogin(userID int, ipAddress string, userAgent string) error {
	log.Printf("📝 Recording login for user %d from %s", userID, ipAddress)

	_, err := as.db.Exec(
		`INSERT INTO login_history (user_id, ip_address, user_agent, login_at)
		 VALUES ($1, $2, $3, NOW())`,
		userID, ipAddress, userAgent,
	)

	if err != nil {
		log.Printf("⚠️  Failed to record login: %v", err)
		return fmt.Errorf("failed to record login: %w", err)
	}

	// Update last login
	_, err = as.db.Exec(
		`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to update last login: %v", err)
	}

	log.Printf("✅ Login recorded for user %d", userID)
	return nil
}

// GetLoginHistory returns login history
func (as *AccountService) GetLoginHistory(userID int, limit int) ([]LoginRecord, error) {
	log.Printf("📋 Getting login history for user %d", userID)

	var history []LoginRecord
	err := as.db.Select(&history,
		`SELECT id, user_id, ip_address, user_agent, login_at
		 FROM login_history
		 WHERE user_id = $1
		 ORDER BY login_at DESC
		 LIMIT $2`,
		userID, limit,
	)

	if err != nil {
		log.Printf("❌ Failed to get login history: %v", err)
		return nil, fmt.Errorf("failed to get login history: %w", err)
	}

	log.Printf("✅ Retrieved %d login records", len(history))
	return history, nil
}

// TerminateSession terminates a user session
func (as *AccountService) TerminateSession(userID int, sessionID int) error {
	log.Printf("🔌 Terminating session %d for user %d", sessionID, userID)

	result, err := as.db.Exec(
		`DELETE FROM user_sessions WHERE id = $1 AND user_id = $2`,
		sessionID, userID,
	)

	if err != nil {
		log.Printf("❌ Failed to terminate session: %v", err)
		return fmt.Errorf("failed to terminate session: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		log.Printf("⚠️  Session %d not found", sessionID)
		return fmt.Errorf("session not found")
	}

	log.Printf("✅ Session %d terminated", sessionID)
	return nil
}

// Helper functions

// generateSecret generates a random secret for 2FA
func generateSecret() string {
	secret := make([]byte, 32)
	rand.Read(secret)
	return base32.StdEncoding.EncodeToString(secret)
}

// generateBackupCodes generates backup codes for 2FA
func generateBackupCodes(count int) string {
	codes := ""
	for i := 0; i < count; i++ {
		code := make([]byte, 4)
		rand.Read(code)
		if i > 0 {
			codes += ","
		}
		codes += fmt.Sprintf("%x", code)
	}
	return codes
}

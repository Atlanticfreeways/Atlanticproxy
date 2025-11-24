package services

import (
	"errors"
	"time"

	"atlanticproxy/backend/internal/models"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type AccountService struct {
	db *sqlx.DB
}

func NewAccountService(db *sqlx.DB) *AccountService {
	return &AccountService{db: db}
}

// GetSecurityInfo retrieves account security information
func (s *AccountService) GetSecurityInfo(userID string) (*models.SecurityInfo, error) {
	var lastLogin, lastLoginIP, lastPasswordChange string
	var twoFactorEnabled bool
	var activeDevices, loginAttempts int

	query := `
		SELECT 
			COALESCE(last_login, ''), 
			COALESCE(last_login_ip, ''),
			COALESCE(last_password_change, ''),
			COALESCE(two_factor_enabled, false),
			(SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND expires_at > NOW()),
			COALESCE(failed_login_attempts, 0)
		FROM users WHERE id = $1
	`

	err := s.db.QueryRow(query, userID).Scan(&lastLogin, &lastLoginIP, &lastPasswordChange, &twoFactorEnabled, &activeDevices, &loginAttempts)
	if err != nil {
		return nil, err
	}

	return &models.SecurityInfo{
		LastLogin:          lastLogin,
		LastLoginIP:        lastLoginIP,
		LastPasswordChange: lastPasswordChange,
		TwoFactorEnabled:   twoFactorEnabled,
		ActiveDevices:      activeDevices,
		LoginAttempts:      loginAttempts,
	}, nil
}

// GetActiveSessions retrieves active sessions
func (s *AccountService) GetActiveSessions(userID string) ([]*models.Session, error) {
	var sessions []*models.Session

	query := `
		SELECT id, user_id, device, ip, last_active, created_at, updated_at
		FROM sessions
		WHERE user_id = $1 AND expires_at > NOW()
		ORDER BY last_active DESC
	`

	err := s.db.Select(&sessions, query, userID)
	if err != nil {
		return nil, err
	}

	// Mark current session
	if len(sessions) > 0 {
		sessions[0].Current = true
	}

	return sessions, nil
}

// LogoutDevice logs out a specific device
func (s *AccountService) LogoutDevice(userID, sessionID string) error {
	query := `DELETE FROM sessions WHERE id = $1 AND user_id = $2`
	result, err := s.db.Exec(query, sessionID, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return errors.New("session not found")
	}

	return nil
}

// LogoutAllDevices logs out all devices
func (s *AccountService) LogoutAllDevices(userID string) error {
	query := `DELETE FROM sessions WHERE user_id = $1`
	_, err := s.db.Exec(query, userID)
	return err
}

// DeleteAccount deletes user account
func (s *AccountService) DeleteAccount(userID, password string) error {
	// Verify password
	var hashedPassword string
	query := `SELECT password FROM users WHERE id = $1`
	err := s.db.QueryRow(query, userID).Scan(&hashedPassword)
	if err != nil {
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return errors.New("invalid password")
	}

	// Delete user and all related data
	tx, err := s.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete related data
	tables := []string{
		"payment_methods",
		"invoices",
		"orders",
		"proxy_configurations",
		"session_settings",
		"custom_headers",
		"throttling_settings",
		"proxy_authentication",
		"notification_settings",
		"sessions",
	}

	for _, table := range tables {
		_, err := tx.Exec("DELETE FROM "+table+" WHERE user_id = $1", userID)
		if err != nil {
			return err
		}
	}

	// Delete user
	_, err = tx.Exec("DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		return err
	}

	return tx.Commit().Error
}

// ChangePassword changes user password
func (s *AccountService) ChangePassword(userID, oldPassword, newPassword string) error {
	// Verify old password
	var hashedPassword string
	query := `SELECT password FROM users WHERE id = $1`
	err := s.db.QueryRow(query, userID).Scan(&hashedPassword)
	if err != nil {
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(oldPassword))
	if err != nil {
		return errors.New("invalid password")
	}

	// Hash new password
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update password
	updateQuery := `UPDATE users SET password = $1, last_password_change = $2 WHERE id = $3`
	_, err = s.db.Exec(updateQuery, string(newHashedPassword), time.Now(), userID)
	return err
}

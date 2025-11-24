package gdpr

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type GDPRManager struct {
	db *sqlx.DB
}

// NewGDPRManager creates a new GDPR manager
func NewGDPRManager(db *sqlx.DB) *GDPRManager {
	return &GDPRManager{db: db}
}

// DeleteUserData deletes all user data (right to be forgotten)
func (gm *GDPRManager) DeleteUserData(userID int) error {
	tx, err := gm.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	tables := []string{
		"audit_logs",
		"billing_transactions",
		"proxy_connections",
		"proxy_usage",
		"referrals",
		"notification_preferences",
		"api_keys",
		"users",
	}

	for _, table := range tables {
		query := fmt.Sprintf("DELETE FROM %s WHERE user_id = $1 OR id = $1", table)
		_, err := tx.Exec(query, userID)
		if err != nil {
			log.Printf("Warning: Failed to delete from %s: %v", table, err)
			// Continue with other tables even if one fails
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("User data deleted for user ID: %d", userID)
	return nil
}

// SetDataRetention sets data retention policy by deleting old records
func (gm *GDPRManager) SetDataRetention(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)

	// Delete old audit logs
	_, err := gm.db.Exec(
		"DELETE FROM audit_logs WHERE timestamp < $1",
		cutoffDate,
	)
	if err != nil {
		return fmt.Errorf("failed to delete old audit logs: %w", err)
	}

	// Delete old proxy usage records
	_, err = gm.db.Exec(
		"DELETE FROM proxy_usage WHERE recorded_at < $1",
		cutoffDate,
	)
	if err != nil {
		return fmt.Errorf("failed to delete old proxy usage: %w", err)
	}

	log.Printf("Data retention policy applied: deleted records older than %d days", days)
	return nil
}

// ExportUserData exports all user data for GDPR compliance
func (gm *GDPRManager) ExportUserData(userID int) (map[string]interface{}, error) {
	data := make(map[string]interface{})

	// Get user info
	var user struct {
		ID               int       `db:"id"`
		Email            string    `db:"email"`
		SubscriptionTier string    `db:"subscription_tier"`
		CreatedAt        time.Time `db:"created_at"`
	}

	err := gm.db.Get(&user, "SELECT id, email, subscription_tier, created_at FROM users WHERE id = $1", userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user data: %w", err)
	}
	data["user"] = user

	// Get proxy connections
	var connections []map[string]interface{}
	rows, err := gm.db.Queryx(
		"SELECT id, client_id, status, ip_address, location, connected_at, disconnected_at FROM proxy_connections WHERE user_id = $1",
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var conn map[string]interface{}
			err := rows.MapScan(conn)
			if err == nil {
				connections = append(connections, conn)
			}
		}
	}
	data["proxy_connections"] = connections

	// Get usage stats
	var usage []map[string]interface{}
	rows, err = gm.db.Queryx(
		"SELECT id, bytes_sent, bytes_received, requests_count, recorded_at FROM proxy_usage WHERE user_id = $1",
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var u map[string]interface{}
			err := rows.MapScan(u)
			if err == nil {
				usage = append(usage, u)
			}
		}
	}
	data["proxy_usage"] = usage

	// Get billing transactions
	var transactions []map[string]interface{}
	rows, err = gm.db.Queryx(
		"SELECT id, plan_id, amount, status, reference, created_at FROM billing_transactions WHERE user_id = $1",
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var t map[string]interface{}
			err := rows.MapScan(t)
			if err == nil {
				transactions = append(transactions, t)
			}
		}
	}
	data["billing_transactions"] = transactions

	// Get audit logs
	var logs []map[string]interface{}
	rows, err = gm.db.Queryx(
		"SELECT id, action, resource, details, timestamp, ip_address FROM audit_logs WHERE user_id = $1",
		userID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var l map[string]interface{}
			err := rows.MapScan(l)
			if err == nil {
				logs = append(logs, l)
			}
		}
	}
	data["audit_logs"] = logs

	return data, nil
}

// AnonymizeUserData anonymizes user data instead of deleting it
func (gm *GDPRManager) AnonymizeUserData(userID int) error {
	tx, err := gm.db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Anonymize user email
	_, err = tx.Exec(
		"UPDATE users SET email = $1 WHERE id = $2",
		fmt.Sprintf("anonymized_%d@example.com", userID),
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to anonymize user: %w", err)
	}

	// Anonymize IP addresses in audit logs
	_, err = tx.Exec(
		"UPDATE audit_logs SET ip_address = 'ANONYMIZED' WHERE user_id = $1",
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to anonymize audit logs: %w", err)
	}

	// Anonymize IP addresses in proxy connections
	_, err = tx.Exec(
		"UPDATE proxy_connections SET ip_address = 'ANONYMIZED' WHERE user_id = $1",
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to anonymize proxy connections: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("User data anonymized for user ID: %d", userID)
	return nil
}

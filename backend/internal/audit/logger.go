package audit

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

type AuditLog struct {
	ID        int       `db:"id"`
	UserID    int       `db:"user_id"`
	Action    string    `db:"action"`
	Resource  string    `db:"resource"`
	Details   string    `db:"details"`
	Timestamp time.Time `db:"timestamp"`
	IPAddress string    `db:"ip_address"`
}

type AuditLogger struct {
	db *sqlx.DB
}

// NewAuditLogger creates a new audit logger
func NewAuditLogger(db *sqlx.DB) *AuditLogger {
	return &AuditLogger{db: db}
}

// Log records an audit event
func (al *AuditLogger) Log(userID int, action, resource, details, ipAddress string) error {
	query := `
		INSERT INTO audit_logs (user_id, action, resource, details, ip_address, timestamp)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := al.db.Exec(query, userID, action, resource, details, ipAddress, time.Now())
	if err != nil {
		log.Printf("Failed to log audit: %v", err)
		return fmt.Errorf("failed to log audit: %w", err)
	}

	return nil
}

// GetUserLogs retrieves audit logs for a specific user
func (al *AuditLogger) GetUserLogs(userID int, limit int) ([]AuditLog, error) {
	var logs []AuditLog
	query := `
		SELECT id, user_id, action, resource, details, timestamp, ip_address
		FROM audit_logs
		WHERE user_id = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`

	err := al.db.Select(&logs, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}

	return logs, nil
}

// GetLogs retrieves all audit logs with optional filtering
func (al *AuditLogger) GetLogs(action string, limit int) ([]AuditLog, error) {
	var logs []AuditLog
	var query string
	var err error

	if action == "" {
		query = `
			SELECT id, user_id, action, resource, details, timestamp, ip_address
			FROM audit_logs
			ORDER BY timestamp DESC
			LIMIT $1
		`
		err = al.db.Select(&logs, query, limit)
	} else {
		query = `
			SELECT id, user_id, action, resource, details, timestamp, ip_address
			FROM audit_logs
			WHERE action = $1
			ORDER BY timestamp DESC
			LIMIT $2
		`
		err = al.db.Select(&logs, query, action, limit)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get audit logs: %w", err)
	}

	return logs, nil
}

// DeleteOldLogs deletes audit logs older than specified days
func (al *AuditLogger) DeleteOldLogs(days int) error {
	cutoffDate := time.Now().AddDate(0, 0, -days)
	query := `DELETE FROM audit_logs WHERE timestamp < $1`

	result, err := al.db.Exec(query, cutoffDate)
	if err != nil {
		return fmt.Errorf("failed to delete old logs: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	log.Printf("Deleted %d old audit logs", rowsAffected)
	return nil
}

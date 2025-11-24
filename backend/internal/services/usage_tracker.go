package services

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type UsageTracker struct {
	db *sqlx.DB
}

type UsageStats struct {
	UserID        int       `json:"user_id" db:"user_id"`
	BytesSent     int64     `json:"bytes_sent" db:"bytes_sent"`
	BytesReceived int64     `json:"bytes_received" db:"bytes_received"`
	RequestsCount int       `json:"requests_count" db:"requests_count"`
	SessionTime   int       `json:"session_time" db:"session_time"`
	LastUpdated   time.Time `json:"last_updated" db:"last_updated"`
}

func NewUsageTracker(db *sqlx.DB) *UsageTracker {
	return &UsageTracker{db: db}
}

func (u *UsageTracker) RecordUsage(userID int, bytesSent, bytesReceived int64, requests int) error {
	_, err := u.db.Exec(`
		INSERT INTO proxy_usage (user_id, bytes_sent, bytes_received, requests_count, recorded_at)
		VALUES ($1, $2, $3, $4, NOW())
	`, userID, bytesSent, bytesReceived, requests)
	
	return err
}

func (u *UsageTracker) GetUserStats(userID int) (*UsageStats, error) {
	var stats UsageStats
	
	err := u.db.Get(&stats, `
		SELECT 
			user_id,
			COALESCE(SUM(bytes_sent), 0) as bytes_sent,
			COALESCE(SUM(bytes_received), 0) as bytes_received,
			COALESCE(SUM(requests_count), 0) as requests_count,
			COALESCE(EXTRACT(EPOCH FROM SUM(
				CASE WHEN disconnected_at IS NOT NULL 
				THEN disconnected_at - connected_at 
				ELSE NOW() - connected_at END
			)), 0) as session_time,
			COALESCE(MAX(recorded_at), NOW()) as last_updated
		FROM proxy_usage pu
		LEFT JOIN proxy_connections pc ON pu.user_id = pc.user_id
		WHERE pu.user_id = $1
		GROUP BY user_id
	`, userID)
	
	if err == sql.ErrNoRows {
		return &UsageStats{
			UserID:      userID,
			LastUpdated: time.Now(),
		}, nil
	}
	
	return &stats, err
}

func (u *UsageTracker) GetMonthlyUsage(userID int) (*UsageStats, error) {
	var stats UsageStats
	
	err := u.db.Get(&stats, `
		SELECT 
			user_id,
			COALESCE(SUM(bytes_sent), 0) as bytes_sent,
			COALESCE(SUM(bytes_received), 0) as bytes_received,
			COALESCE(SUM(requests_count), 0) as requests_count,
			MAX(recorded_at) as last_updated
		FROM proxy_usage
		WHERE user_id = $1 AND recorded_at >= date_trunc('month', NOW())
		GROUP BY user_id
	`, userID)
	
	if err == sql.ErrNoRows {
		return &UsageStats{UserID: userID}, nil
	}
	
	return &stats, err
}
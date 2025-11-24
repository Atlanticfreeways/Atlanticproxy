package services

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
)

// ProxyService handles proxy connection management
type ProxyService struct {
	db *sqlx.DB
}

// ProxyConnection represents a proxy connection
type ProxyConnection struct {
	ID             int       `db:"id" json:"id"`
	UserID         int       `db:"user_id" json:"user_id"`
	ClientID       string    `db:"client_id" json:"client_id"`
	Status         string    `db:"status" json:"status"`
	IPAddress      string    `db:"ip_address" json:"ip_address"`
	Location       string    `db:"location" json:"location"`
	ConnectedAt    time.Time `db:"connected_at" json:"connected_at"`
	DisconnectedAt *time.Time `db:"disconnected_at" json:"disconnected_at"`
}

// NewProxyService creates a new proxy service
func NewProxyService(db *sqlx.DB) *ProxyService {
	return &ProxyService{db: db}
}

// Connect creates a new proxy connection
func (ps *ProxyService) Connect(userID int) (*ProxyConnection, error) {
	log.Printf("🔗 Connecting proxy for user %d", userID)

	// Generate unique client ID
	clientID := fmt.Sprintf("client_%d_%d", userID, time.Now().Unix())

	// Get Oxylabs credentials
	oxylabsUsername := os.Getenv("OXYLABS_USERNAME")
	oxylabsPassword := os.Getenv("OXYLABS_PASSWORD")

	if oxylabsUsername == "" || oxylabsPassword == "" {
		log.Println("⚠️  Oxylabs credentials not set, using mock IP")
		oxylabsUsername = "demo"
		oxylabsPassword = "demo"
	}

	// For now, use mock IP and location
	// In production, this would call Oxylabs API to get real IP
	ipAddress := "192.168.1.1"
	location := "New York, USA"

	// Create connection record
	var conn ProxyConnection
	err := ps.db.QueryRowx(
		`INSERT INTO proxy_connections (user_id, client_id, status, ip_address, location, connected_at)
		 VALUES ($1, $2, 'active', $3, $4, NOW())
		 RETURNING id, user_id, client_id, status, ip_address, location, connected_at, disconnected_at`,
		userID, clientID, ipAddress, location,
	).StructScan(&conn)

	if err != nil {
		log.Printf("❌ Failed to create connection: %v", err)
		return nil, fmt.Errorf("failed to create connection: %w", err)
	}

	log.Printf("✅ Proxy connected for user %d: %s", userID, clientID)
	return &conn, nil
}

// Disconnect closes a proxy connection
func (ps *ProxyService) Disconnect(userID int) error {
	log.Printf("🔌 Disconnecting proxy for user %d", userID)

	result, err := ps.db.Exec(
		`UPDATE proxy_connections 
		 SET status = 'inactive', disconnected_at = NOW()
		 WHERE user_id = $1 AND status = 'active'`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to disconnect: %v", err)
		return fmt.Errorf("failed to disconnect: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		log.Printf("⚠️  No active connection found for user %d", userID)
		return fmt.Errorf("no active connection found")
	}

	log.Printf("✅ Proxy disconnected for user %d", userID)
	return nil
}

// GetStatus returns the current proxy status for a user
func (ps *ProxyService) GetStatus(userID int) (*ProxyConnection, error) {
	var conn ProxyConnection
	err := ps.db.Get(&conn,
		`SELECT id, user_id, client_id, status, ip_address, location, connected_at, disconnected_at
		 FROM proxy_connections
		 WHERE user_id = $1 AND status = 'active'
		 ORDER BY connected_at DESC
		 LIMIT 1`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  No active connection for user %d", userID)
		return nil, fmt.Errorf("no active connection found")
	}

	return &conn, nil
}

// GetConnections returns all connections for a user
func (ps *ProxyService) GetConnections(userID int) ([]ProxyConnection, error) {
	var conns []ProxyConnection
	err := ps.db.Select(&conns,
		`SELECT id, user_id, client_id, status, ip_address, location, connected_at, disconnected_at
		 FROM proxy_connections
		 WHERE user_id = $1
		 ORDER BY connected_at DESC`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get connections: %v", err)
		return nil, fmt.Errorf("failed to get connections: %w", err)
	}

	return conns, nil
}

// RecordUsage records proxy usage data
func (ps *ProxyService) RecordUsage(userID int, bytesSent, bytesReceived int64, requestsCount int) error {
	_, err := ps.db.Exec(
		`INSERT INTO proxy_usage (user_id, bytes_sent, bytes_received, requests_count, recorded_at)
		 VALUES ($1, $2, $3, $4, NOW())`,
		userID, bytesSent, bytesReceived, requestsCount,
	)

	if err != nil {
		log.Printf("❌ Failed to record usage: %v", err)
		return fmt.Errorf("failed to record usage: %w", err)
	}

	return nil
}

// GetUsageStats returns usage statistics for a user
func (ps *ProxyService) GetUsageStats(userID int) (map[string]interface{}, error) {
	var stats struct {
		BytesSent     int64 `db:"bytes_sent"`
		BytesReceived int64 `db:"bytes_received"`
		RequestsCount int   `db:"requests_count"`
	}

	err := ps.db.Get(&stats,
		`SELECT COALESCE(SUM(bytes_sent), 0) as bytes_sent,
		        COALESCE(SUM(bytes_received), 0) as bytes_received,
		        COALESCE(SUM(requests_count), 0) as requests_count
		 FROM proxy_usage
		 WHERE user_id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get usage stats: %v", err)
		return nil, fmt.Errorf("failed to get usage stats: %w", err)
	}

	return map[string]interface{}{
		"bytes_sent":     stats.BytesSent,
		"bytes_received": stats.BytesReceived,
		"requests_count": stats.RequestsCount,
	}, nil
}

// GetUsageTrends returns usage trends for a user
func (ps *ProxyService) GetUsageTrends(userID int, period string) ([]map[string]interface{}, error) {
	var timeFormat string
	switch period {
	case "day":
		timeFormat = "YYYY-MM-DD HH:00:00"
	case "week":
		timeFormat = "YYYY-MM-DD"
	case "month":
		timeFormat = "YYYY-MM-01"
	default:
		timeFormat = "YYYY-MM-DD"
	}

	var trends []map[string]interface{}
	rows, err := ps.db.Queryx(
		fmt.Sprintf(`SELECT 
			TO_CHAR(recorded_at, '%s') as date,
			SUM(bytes_sent) as bytes_sent,
			SUM(bytes_received) as bytes_received,
			SUM(requests_count) as requests_count
		 FROM proxy_usage
		 WHERE user_id = $1
		 GROUP BY TO_CHAR(recorded_at, '%s')
		 ORDER BY date DESC
		 LIMIT 30`, timeFormat, timeFormat),
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get usage trends: %v", err)
		return nil, fmt.Errorf("failed to get usage trends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var trend map[string]interface{}
		err := rows.MapScan(trend)
		if err != nil {
			log.Printf("❌ Failed to scan trend: %v", err)
			continue
		}
		trends = append(trends, trend)
	}

	return trends, nil
}

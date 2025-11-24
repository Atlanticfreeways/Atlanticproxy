package services

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type AnalyticsService struct {
	db *sqlx.DB
}

func NewAnalyticsService(db *sqlx.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// ExportData exports data in various formats
func (s *AnalyticsService) ExportData(
	userID, format, dateRange string,
	includeMetrics, includeBilling, includeConnections bool,
	startDate, endDate string,
) ([]byte, string, error) {
	// Determine date range
	var start, end time.Time
	now := time.Now()

	switch dateRange {
	case "week":
		start = now.AddDate(0, 0, -7)
		end = now
	case "month":
		start = now.AddDate(0, -1, 0)
		end = now
	case "year":
		start = now.AddDate(-1, 0, 0)
		end = now
	case "custom":
		var err error
		start, err = time.Parse("2006-01-02", startDate)
		if err != nil {
			return nil, "", errors.New("invalid start date")
		}
		end, err = time.Parse("2006-01-02", endDate)
		if err != nil {
			return nil, "", errors.New("invalid end date")
		}
	default:
		return nil, "", errors.New("invalid date range")
	}

	// Collect data
	data := make(map[string]interface{})

	if includeMetrics {
		metrics, err := s.getMetricsData(userID, start, end)
		if err != nil {
			return nil, "", err
		}
		data["metrics"] = metrics
	}

	if includeBilling {
		billing, err := s.getBillingData(userID, start, end)
		if err != nil {
			return nil, "", err
		}
		data["billing"] = billing
	}

	if includeConnections {
		connections, err := s.getConnectionsData(userID, start, end)
		if err != nil {
			return nil, "", err
		}
		data["connections"] = connections
	}

	// Export in requested format
	var exportData []byte
	var filename string

	switch format {
	case "csv":
		var err error
		exportData, err = s.exportAsCSV(data)
		if err != nil {
			return nil, "", err
		}
		filename = fmt.Sprintf("export_%s.csv", time.Now().Format("20060102"))

	case "json":
		var err error
		exportData, err = json.MarshalIndent(data, "", "  ")
		if err != nil {
			return nil, "", err
		}
		filename = fmt.Sprintf("export_%s.json", time.Now().Format("20060102"))

	case "pdf":
		// TODO: Implement PDF export
		return nil, "", errors.New("PDF export not yet implemented")

	default:
		return nil, "", errors.New("invalid format")
	}

	return exportData, filename, nil
}

// GetUsageTrends retrieves usage trends
func (s *AnalyticsService) GetUsageTrends(userID, period string) ([]map[string]interface{}, error) {
	var startDate time.Time
	now := time.Now()

	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
	case "month":
		startDate = now.AddDate(0, -1, 0)
	case "year":
		startDate = now.AddDate(-1, 0, 0)
	default:
		return nil, errors.New("invalid period")
	}

	query := `
		SELECT 
			DATE(created_at) as date,
			COALESCE(SUM(bandwidth), 0) as bandwidth,
			COALESCE(COUNT(*), 0) as requests,
			COALESCE(AVG(latency), 0) as avg_latency
		FROM connection_logs
		WHERE user_id = $1 AND created_at >= $2
		GROUP BY DATE(created_at)
		ORDER BY date ASC
	`

	rows, err := s.db.Queryx(query, userID, startDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trends []map[string]interface{}
	for rows.Next() {
		var date string
		var bandwidth, requests, avgLatency float64

		err := rows.Scan(&date, &bandwidth, &requests, &avgLatency)
		if err != nil {
			return nil, err
		}

		trends = append(trends, map[string]interface{}{
			"date":       date,
			"bandwidth":  bandwidth,
			"requests":   requests,
			"avgLatency": avgLatency,
		})
	}

	return trends, nil
}

// GetConnectionMetrics retrieves connection metrics
func (s *AnalyticsService) GetConnectionMetrics(userID string) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_connections,
			(SELECT COUNT(*) FROM sessions WHERE user_id = $1 AND expires_at > NOW()) as active_connections,
			COALESCE(AVG(latency), 0) as avg_latency,
			COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::float / COUNT(*) * 100, 0) as success_rate
		FROM connection_logs
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
	`

	var totalConnections, activeConnections int
	var avgLatency, successRate float64

	err := s.db.QueryRow(query, userID).Scan(&totalConnections, &activeConnections, &avgLatency, &successRate)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalConnections":  totalConnections,
		"activeConnections": activeConnections,
		"avgLatency":        avgLatency,
		"successRate":       successRate,
	}, nil
}

// Helper functions

func (s *AnalyticsService) getMetricsData(userID string, start, end time.Time) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			DATE(created_at) as date,
			COALESCE(SUM(bandwidth), 0) as bandwidth,
			COALESCE(COUNT(*), 0) as requests,
			COALESCE(AVG(latency), 0) as avg_latency
		FROM connection_logs
		WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
		GROUP BY DATE(created_at)
		ORDER BY date ASC
	`

	rows, err := s.db.Queryx(query, userID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var metrics []map[string]interface{}
	for rows.Next() {
		var date string
		var bandwidth, requests, avgLatency float64

		err := rows.Scan(&date, &bandwidth, &requests, &avgLatency)
		if err != nil {
			return nil, err
		}

		metrics = append(metrics, map[string]interface{}{
			"date":       date,
			"bandwidth":  bandwidth,
			"requests":   requests,
			"avgLatency": avgLatency,
		})
	}

	return metrics, nil
}

func (s *AnalyticsService) getBillingData(userID string, start, end time.Time) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			id,
			amount,
			status,
			description,
			date
		FROM invoices
		WHERE user_id = $1 AND date BETWEEN $2 AND $3
		ORDER BY date DESC
	`

	rows, err := s.db.Queryx(query, userID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var billing []map[string]interface{}
	for rows.Next() {
		var id, status, description string
		var amount float64
		var date time.Time

		err := rows.Scan(&id, &amount, &status, &description, &date)
		if err != nil {
			return nil, err
		}

		billing = append(billing, map[string]interface{}{
			"id":          id,
			"amount":      amount,
			"status":      status,
			"description": description,
			"date":        date.Format("2006-01-02"),
		})
	}

	return billing, nil
}

func (s *AnalyticsService) getConnectionsData(userID string, start, end time.Time) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			id,
			protocol,
			location,
			latency,
			status,
			created_at
		FROM connection_logs
		WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
		ORDER BY created_at DESC
		LIMIT 1000
	`

	rows, err := s.db.Queryx(query, userID, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var connections []map[string]interface{}
	for rows.Next() {
		var id, protocol, location, status string
		var latency int
		var createdAt time.Time

		err := rows.Scan(&id, &protocol, &location, &latency, &status, &createdAt)
		if err != nil {
			return nil, err
		}

		connections = append(connections, map[string]interface{}{
			"id":        id,
			"protocol":  protocol,
			"location":  location,
			"latency":   latency,
			"status":    status,
			"createdAt": createdAt.Format("2006-01-02 15:04:05"),
		})
	}

	return connections, nil
}

func (s *AnalyticsService) exportAsCSV(data map[string]interface{}) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write headers
	writer.Write([]string{"Type", "Date", "Value", "Details"})

	// Write metrics
	if metrics, ok := data["metrics"].([]map[string]interface{}); ok {
		for _, m := range metrics {
			writer.Write([]string{
				"Metrics",
				fmt.Sprintf("%v", m["date"]),
				fmt.Sprintf("%.2f", m["bandwidth"]),
				fmt.Sprintf("Requests: %v, Latency: %.2fms", m["requests"], m["avgLatency"]),
			})
		}
	}

	// Write billing
	if billing, ok := data["billing"].([]map[string]interface{}); ok {
		for _, b := range billing {
			writer.Write([]string{
				"Billing",
				fmt.Sprintf("%v", b["date"]),
				fmt.Sprintf("$%.2f", b["amount"]),
				fmt.Sprintf("%v - %v", b["status"], b["description"]),
			})
		}
	}

	writer.Flush()
	return buf.Bytes(), writer.Error()
}

package services

import (
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// AnalyticsService handles analytics and cost calculations
type AnalyticsService struct {
	db *sqlx.DB
}

// CostBreakdown represents cost breakdown
type CostBreakdown struct {
	ProxyCost      float64 `json:"proxy_cost"`
	BandwidthCost  float64 `json:"bandwidth_cost"`
	RequestsCost   float64 `json:"requests_cost"`
	TotalCost      float64 `json:"total_cost"`
	CurrencyCode   string  `json:"currency_code"`
}

// UsageTrend represents usage trend data
type UsageTrend struct {
	Date              string  `json:"date"`
	BytesSent         int64   `json:"bytes_sent"`
	BytesReceived     int64   `json:"bytes_received"`
	RequestsCount     int     `json:"requests_count"`
	EstimatedCost     float64 `json:"estimated_cost"`
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(db *sqlx.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// GetCostAnalysis returns cost analysis for a user
func (as *AnalyticsService) GetCostAnalysis(userID int) (*CostBreakdown, error) {
	log.Printf("📊 Calculating cost analysis for user %d", userID)

	// Get usage stats
	var stats struct {
		BytesSent     int64 `db:"bytes_sent"`
		BytesReceived int64 `db:"bytes_received"`
		RequestsCount int   `db:"requests_count"`
	}

	err := as.db.Get(&stats,
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

	// Get user subscription tier
	var tier string
	err = as.db.Get(&tier,
		`SELECT subscription_tier FROM users WHERE id = $1`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get subscription tier: %v", err)
		tier = "free"
	}

	// Calculate costs based on tier
	breakdown := as.calculateCosts(stats.BytesSent, stats.BytesReceived, stats.RequestsCount, tier)

	log.Printf("✅ Cost analysis calculated: $%.2f", breakdown.TotalCost)
	return breakdown, nil
}

// GetUsageTrends returns usage trends with cost estimates
func (as *AnalyticsService) GetUsageTrends(userID int, period string) ([]UsageTrend, error) {
	log.Printf("📈 Getting usage trends for user %d (period: %s)", userID, period)

	var timeFormat string
	var groupBy string
	switch period {
	case "day":
		timeFormat = "YYYY-MM-DD HH:00:00"
		groupBy = "YYYY-MM-DD HH:00:00"
	case "week":
		timeFormat = "YYYY-MM-DD"
		groupBy = "YYYY-MM-DD"
	case "month":
		timeFormat = "YYYY-MM-01"
		groupBy = "YYYY-MM-01"
	default:
		timeFormat = "YYYY-MM-DD"
		groupBy = "YYYY-MM-DD"
	}

	var trends []UsageTrend
	rows, err := as.db.Queryx(
		fmt.Sprintf(`SELECT 
			TO_CHAR(recorded_at, '%s') as date,
			COALESCE(SUM(bytes_sent), 0) as bytes_sent,
			COALESCE(SUM(bytes_received), 0) as bytes_received,
			COALESCE(SUM(requests_count), 0) as requests_count
		 FROM proxy_usage
		 WHERE user_id = $1
		 GROUP BY TO_CHAR(recorded_at, '%s')
		 ORDER BY date DESC
		 LIMIT 30`, timeFormat, groupBy),
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get usage trends: %v", err)
		return nil, fmt.Errorf("failed to get usage trends: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var trend UsageTrend
		err := rows.StructScan(&trend)
		if err != nil {
			log.Printf("❌ Failed to scan trend: %v", err)
			continue
		}

		// Calculate estimated cost for this period
		trend.EstimatedCost = as.estimateCost(trend.BytesSent, trend.BytesReceived, trend.RequestsCount)
		trends = append(trends, trend)
	}

	log.Printf("✅ Retrieved %d trend data points", len(trends))
	return trends, nil
}

// GetMonthlyStats returns monthly statistics
func (as *AnalyticsService) GetMonthlyStats(userID int) (map[string]interface{}, error) {
	log.Printf("📅 Getting monthly stats for user %d", userID)

	var stats struct {
		BytesSent     int64 `db:"bytes_sent"`
		BytesReceived int64 `db:"bytes_received"`
		RequestsCount int   `db:"requests_count"`
	}

	// Get current month stats
	err := as.db.Get(&stats,
		`SELECT COALESCE(SUM(bytes_sent), 0) as bytes_sent,
		        COALESCE(SUM(bytes_received), 0) as bytes_received,
		        COALESCE(SUM(requests_count), 0) as requests_count
		 FROM proxy_usage
		 WHERE user_id = $1 AND recorded_at >= DATE_TRUNC('month', NOW())`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get monthly stats: %v", err)
		return nil, fmt.Errorf("failed to get monthly stats: %w", err)
	}

	// Get previous month stats for comparison
	var prevStats struct {
		BytesSent     int64 `db:"bytes_sent"`
		BytesReceived int64 `db:"bytes_received"`
		RequestsCount int   `db:"requests_count"`
	}

	err = as.db.Get(&prevStats,
		`SELECT COALESCE(SUM(bytes_sent), 0) as bytes_sent,
		        COALESCE(SUM(bytes_received), 0) as bytes_received,
		        COALESCE(SUM(requests_count), 0) as requests_count
		 FROM proxy_usage
		 WHERE user_id = $1 AND recorded_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
		 AND recorded_at < DATE_TRUNC('month', NOW())`,
		userID,
	)

	if err != nil {
		log.Printf("⚠️  Failed to get previous month stats: %v", err)
		prevStats.BytesSent = 0
		prevStats.BytesReceived = 0
		prevStats.RequestsCount = 0
	}

	// Calculate percentage changes
	bytesSentChange := as.calculatePercentageChange(prevStats.BytesSent, stats.BytesSent)
	bytesReceivedChange := as.calculatePercentageChange(prevStats.BytesReceived, stats.BytesReceived)
	requestsChange := as.calculatePercentageChange(int64(prevStats.RequestsCount), int64(stats.RequestsCount))

	return map[string]interface{}{
		"current_month": map[string]interface{}{
			"bytes_sent":     stats.BytesSent,
			"bytes_received": stats.BytesReceived,
			"requests_count": stats.RequestsCount,
		},
		"previous_month": map[string]interface{}{
			"bytes_sent":     prevStats.BytesSent,
			"bytes_received": prevStats.BytesReceived,
			"requests_count": prevStats.RequestsCount,
		},
		"changes": map[string]interface{}{
			"bytes_sent_change":     bytesSentChange,
			"bytes_received_change": bytesReceivedChange,
			"requests_change":       requestsChange,
		},
	}, nil
}

// Helper functions

// calculateCosts calculates costs based on usage and tier
func (as *AnalyticsService) calculateCosts(bytesSent, bytesReceived int64, requestsCount int, tier string) *CostBreakdown {
	// Pricing (in USD)
	var proxyCostPerHour float64
	var bandwidthCostPerGB float64
	var requestCostPer1K float64

	switch tier {
	case "free":
		proxyCostPerHour = 0
		bandwidthCostPerGB = 0
		requestCostPer1K = 0
	case "pro":
		proxyCostPerHour = 0.5
		bandwidthCostPerGB = 0.1
		requestCostPer1K = 0.01
	case "enterprise":
		proxyCostPerHour = 0.2
		bandwidthCostPerGB = 0.05
		requestCostPer1K = 0.005
	default:
		proxyCostPerHour = 0
		bandwidthCostPerGB = 0
		requestCostPer1K = 0
	}

	// Calculate costs
	totalBandwidth := (bytesSent + bytesReceived) / (1024 * 1024 * 1024) // Convert to GB
	bandwidthCost := float64(totalBandwidth) * bandwidthCostPerGB
	requestsCost := float64(requestsCount/1000) * requestCostPer1K
	proxyCost := proxyCostPerHour // Simplified: 1 hour of proxy usage

	totalCost := proxyCost + bandwidthCost + requestsCost

	return &CostBreakdown{
		ProxyCost:     proxyCost,
		BandwidthCost: bandwidthCost,
		RequestsCost:  requestsCost,
		TotalCost:     totalCost,
		CurrencyCode:  "USD",
	}
}

// estimateCost estimates cost for given usage
func (as *AnalyticsService) estimateCost(bytesSent, bytesReceived int64, requestsCount int) float64 {
	// Simplified cost calculation
	totalBandwidth := (bytesSent + bytesReceived) / (1024 * 1024 * 1024) // Convert to GB
	bandwidthCost := float64(totalBandwidth) * 0.1
	requestsCost := float64(requestsCount/1000) * 0.01

	return bandwidthCost + requestsCost
}

// calculatePercentageChange calculates percentage change between two values
func (as *AnalyticsService) calculatePercentageChange(prev, current int64) float64 {
	if prev == 0 {
		if current == 0 {
			return 0
		}
		return 100
	}

	return float64((current-prev)*100) / float64(prev)
}

// ExportData exports user data in specified format
func (as *AnalyticsService) ExportData(userID int, format string) (interface{}, error) {
	log.Printf("📤 Exporting data for user %d (format: %s)", userID, format)

	// Get all usage data
	var usageData []map[string]interface{}
	rows, err := as.db.Queryx(
		`SELECT id, user_id, bytes_sent, bytes_received, requests_count, recorded_at
		 FROM proxy_usage
		 WHERE user_id = $1
		 ORDER BY recorded_at DESC`,
		userID,
	)

	if err != nil {
		log.Printf("❌ Failed to get usage data: %v", err)
		return nil, fmt.Errorf("failed to get usage data: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var data map[string]interface{}
		err := rows.MapScan(data)
		if err != nil {
			log.Printf("❌ Failed to scan data: %v", err)
			continue
		}
		usageData = append(usageData, data)
	}

	// Get cost analysis
	costAnalysis, err := as.GetCostAnalysis(userID)
	if err != nil {
		log.Printf("⚠️  Failed to get cost analysis: %v", err)
	}

	// Get monthly stats
	monthlyStats, err := as.GetMonthlyStats(userID)
	if err != nil {
		log.Printf("⚠️  Failed to get monthly stats: %v", err)
	}

	exportData := map[string]interface{}{
		"exported_at":   time.Now(),
		"user_id":       userID,
		"format":        format,
		"usage_data":    usageData,
		"cost_analysis": costAnalysis,
		"monthly_stats": monthlyStats,
	}

	log.Printf("✅ Data exported successfully")
	return exportData, nil
}

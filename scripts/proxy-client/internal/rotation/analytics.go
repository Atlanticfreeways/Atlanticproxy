package rotation

import (
	"sync"
	"time"
)

// RotationEvent represents a single IP rotation event
type RotationEvent struct {
	Timestamp time.Time
	SessionID string
	Reason    string // "expired", "forced", "manual", "init"
	Mode      RotationMode
	Country   string
}

// AnalyticsManager handles tracking and aggregation of rotation stats
type AnalyticsManager struct {
	mu           sync.RWMutex
	Events       []RotationEvent
	GeoStats     map[string]int
	HourlyStats  map[string]int // Key: "YYYY-MM-DD-HH"
	SuccessCount int64
	FailureCount int64
}

// NewAnalyticsManager creates a new analytics tracker
func NewAnalyticsManager() *AnalyticsManager {
	return &AnalyticsManager{
		Events:      make([]RotationEvent, 0),
		GeoStats:    make(map[string]int),
		HourlyStats: make(map[string]int),
	}
}

// TrackRotation records a rotation event
func (am *AnalyticsManager) TrackRotation(sessionID, reason string, mode RotationMode, country string) {
	am.mu.Lock()
	defer am.mu.Unlock()

	event := RotationEvent{
		Timestamp: time.Now(),
		SessionID: sessionID,
		Reason:    reason,
		Mode:      mode,
		Country:   country,
	}

	am.Events = append(am.Events, event)
	
	// Keep event log size manageable
	if len(am.Events) > 1000 {
		am.Events = am.Events[len(am.Events)-1000:]
	}

	// Update Geo Stats
	if country != "" {
		am.GeoStats[country]++
	} else {
		am.GeoStats["unknown"]++
	}

	// Update Hourly Stats
	hourKey := time.Now().Format("2006-01-02-15")
	am.HourlyStats[hourKey]++
}

// TrackSuccess records a successful proxy usage with the current rotation
func (am *AnalyticsManager) TrackSuccess() {
	am.mu.Lock()
	defer am.mu.Unlock()
	am.SuccessCount++
}

// TrackFailure records a failed proxy usage
func (am *AnalyticsManager) TrackFailure() {
	am.mu.Lock()
	defer am.mu.Unlock()
	am.FailureCount++
}

// GetStats returns a copy of current statistics
func (am *AnalyticsManager) GetStats() map[string]interface{} {
	am.mu.RLock()
	defer am.mu.RUnlock()

	totalRequest := am.SuccessCount + am.FailureCount
	successRate := 0.0
	if totalRequest > 0 {
		successRate = float64(am.SuccessCount) / float64(totalRequest) * 100
	}

	// copy maps
	geoStats := make(map[string]int)
	for k, v := range am.GeoStats {
		geoStats[k] = v
	}
	
	hourlyStats := make(map[string]int)
	for k, v := range am.HourlyStats {
		hourlyStats[k] = v
	}

	return map[string]interface{}{
		"total_rotations": len(am.Events),
		"success_count":   am.SuccessCount,
		"failure_count":   am.FailureCount,
		"success_rate":    successRate,
		"geo_stats":       geoStats,
		"hourly_stats":    hourlyStats,
		"recent_events":   am.Events[max(0, len(am.Events)-10):], // Last 10 events
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

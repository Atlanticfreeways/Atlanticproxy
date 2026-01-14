package billing

import (
	"sync"
	"time"
)

// UsageStats represents usage for a specific period (e.g., current month)
type UsageStats struct {
	PeriodStart      time.Time `json:"period_start"`
	PeriodEnd        time.Time `json:"period_end"`
	DataTransferred  int64     `json:"data_transferred_bytes"`
	RequestsMade     int64     `json:"requests_made"`
	AdsBlocked       int64     `json:"ads_blocked"`
	ThreatsBlocked   int64     `json:"threats_blocked"`
	ActiveConnections int       `json:"active_connections"`
}

type UsageTracker struct {
	mu           sync.RWMutex
	currentUsage *UsageStats
}

func NewUsageTracker() *UsageTracker {
	now := time.Now()
	// Default to current month
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	end := start.AddDate(0, 1, 0).Add(-time.Second)

	return &UsageTracker{
		currentUsage: &UsageStats{
			PeriodStart: start,
			PeriodEnd:   end,
		},
	}
}

func (u *UsageTracker) GetStats() *UsageStats {
	u.mu.RLock()
	defer u.mu.RUnlock()
	
	// Return a copy to avoid races
	stats := *u.currentUsage
	return &stats
}

func (u *UsageTracker) AddData(bytes int64) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.currentUsage.DataTransferred += bytes
}

func (u *UsageTracker) AddRequest() {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.currentUsage.RequestsMade++
}

func (u *UsageTracker) AddAdBlocked() {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.currentUsage.AdsBlocked++
}

func (u *UsageTracker) AddThreatBlocked() {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.currentUsage.ThreatsBlocked++
}

func (u *UsageTracker) SetActiveConnections(count int) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.currentUsage.ActiveConnections = count
}

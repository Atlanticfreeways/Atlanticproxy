package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Statistics endpoints
func (s *Server) handleGetStatisticsHourly(c *gin.Context) {
	stats := s.analyticsManager.GetStats()
	hourlyStats := stats["hourly_stats"].(map[string]int)

	// Convert to array format for frontend
	var data []map[string]interface{}
	for hour, count := range hourlyStats {
		data = append(data, map[string]interface{}{
			"hour":  hour,
			"count": count,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (s *Server) handleGetStatisticsCountries(c *gin.Context) {
	stats := s.analyticsManager.GetStats()
	geoStats := stats["geo_stats"].(map[string]int)

	// Convert to array format
	var data []map[string]interface{}
	for country, count := range geoStats {
		data = append(data, map[string]interface{}{
			"country": country,
			"count":   count,
		})
	}

	c.JSON(http.StatusOK, gin.H{"countries": data})
}

func (s *Server) handleGetStatisticsProtocols(c *gin.Context) {
	// Mock protocol breakdown - in production, track this in analytics
	protocols := []map[string]interface{}{
		{"protocol": "HTTPS", "count": 1250, "percentage": 62.5},
		{"protocol": "SOCKS5", "count": 500, "percentage": 25.0},
		{"protocol": "Shadowsocks", "count": 250, "percentage": 12.5},
	}

	c.JSON(http.StatusOK, gin.H{"protocols": protocols})
}

// Servers endpoints
func (s *Server) handleGetServersList(c *gin.Context) {
	servers := []map[string]interface{}{
		{
			"id":       "us-east-1",
			"name":     "US East (New York)",
			"country":  "United States",
			"city":     "New York",
			"status":   "online",
			"latency":  15,
			"load":     45,
			"protocol": "HTTPS",
		},
		{
			"id":       "us-west-1",
			"name":     "US West (Los Angeles)",
			"country":  "United States",
			"city":     "Los Angeles",
			"status":   "online",
			"latency":  25,
			"load":     62,
			"protocol": "SOCKS5",
		},
		{
			"id":       "uk-london-1",
			"name":     "UK (London)",
			"country":  "United Kingdom",
			"city":     "London",
			"status":   "online",
			"latency":  85,
			"load":     38,
			"protocol": "HTTPS",
		},
		{
			"id":       "de-frankfurt-1",
			"name":     "Germany (Frankfurt)",
			"country":  "Germany",
			"city":     "Frankfurt",
			"status":   "maintenance",
			"latency":  95,
			"load":     0,
			"protocol": "HTTPS",
		},
		{
			"id":       "jp-tokyo-1",
			"name":     "Japan (Tokyo)",
			"country":  "Japan",
			"city":     "Tokyo",
			"status":   "online",
			"latency":  145,
			"load":     71,
			"protocol": "Shadowsocks",
		},
	}

	c.JSON(http.StatusOK, gin.H{"servers": servers})
}

func (s *Server) handleGetServersStatus(c *gin.Context) {
	serverID := c.Query("id")
	if serverID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Server ID required"})
		return
	}

	// Mock server status
	status := map[string]interface{}{
		"id":      serverID,
		"status":  "online",
		"latency": 15,
		"load":    45,
	}

	c.JSON(http.StatusOK, status)
}

// Activity endpoints
func (s *Server) handleGetActivityLog(c *gin.Context) {
	stats := s.analyticsManager.GetStats()
	events := stats["recent_events"]

	// Convert rotation events to activity log format
	var activities []map[string]interface{}
	if eventSlice, ok := events.([]interface{}); ok {
		for _, e := range eventSlice {
			activities = append(activities, map[string]interface{}{
				"timestamp": time.Now().Add(-time.Hour),
				"type":      "rotation",
				"status":    "success",
				"details":   e,
			})
		}
	}

	// Add mock activities
	mockActivities := []map[string]interface{}{
		{
			"id":        "1",
			"timestamp": time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
			"type":      "connection",
			"status":    "success",
			"details":   "Connected to US East server",
			"ip":        "192.168.1.1",
			"location":  "New York, US",
		},
		{
			"id":        "2",
			"timestamp": time.Now().Add(-25 * time.Minute).Format(time.RFC3339),
			"type":      "rotation",
			"status":    "success",
			"details":   "IP rotated (sticky session expired)",
			"ip":        "192.168.1.2",
			"location":  "Los Angeles, US",
		},
		{
			"id":        "3",
			"timestamp": time.Now().Add(-1 * time.Hour).Format(time.RFC3339),
			"type":      "security",
			"status":    "blocked",
			"details":   "Blocked malicious request",
			"ip":        "10.0.0.1",
			"location":  "Unknown",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"activities": mockActivities,
		"total":      len(mockActivities),
		"page":       1,
		"pageSize":   20,
	})
}

// Settings endpoints
func (s *Server) handleGetSettings(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	settings := map[string]interface{}{
		"account": map[string]interface{}{
			"email":    "user@example.com",
			"username": "user123",
		},
		"preferences": map[string]interface{}{
			"theme":         "dark",
			"language":      "en",
			"notifications": true,
		},
		"security": map[string]interface{}{
			"twoFactorEnabled": false,
			"sessions": []map[string]interface{}{
				{
					"id":         "session-1",
					"device":     "Chrome on macOS",
					"location":   "New York, US",
					"lastActive": time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
					"current":    true,
				},
			},
		},
	}

	c.JSON(http.StatusOK, settings)
}

func (s *Server) handleUpdateSettings(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// In production, save to database
	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}

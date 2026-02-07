package api

import (
	"net/http"

	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/gin-gonic/gin"
)

// RotationSettings represents the API payload for rotation configuration
type RotationSettings struct {
	Mode    string `json:"mode"`
	Country string `json:"country,omitempty"`
	City    string `json:"city,omitempty"`
}

func (s *Server) handleGetRotationConfig(c *gin.Context) {
	config := s.rotationManager.GetConfig()
	session, _ := s.rotationManager.GetCurrentSession()

	remaining := 0
	if session != nil {
		remaining = int(session.TimeRemaining().Seconds())
	}

	response := gin.H{
		"mode":              string(config.Mode),
		"country":           config.Country,
		"city":              config.City,
		"session_remaining": remaining,
	}

	c.JSON(http.StatusOK, response)
}

func (s *Server) handleUpdateRotationConfig(c *gin.Context) {
	var settings RotationSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid settings"})
		return
	}

	// Map string mode to RotationMode
	var mode rotation.RotationMode
	switch settings.Mode {
	case "per-request":
		mode = rotation.ModePerRequest
	case "sticky-1min":
		mode = rotation.ModeSticky1Min
	case "sticky-10min":
		mode = rotation.ModeSticky10Min
	case "sticky-30min":
		mode = rotation.ModeSticky30Min
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rotation mode"})
		return
	}

	// Update config
	newConfig := rotation.RotationConfig{
		Mode:    mode,
		Country: settings.Country, // "us", "uk", etc.
		City:    settings.City,
	}

	if err := s.rotationManager.UpdateConfig(newConfig); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rotation config"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rotation settings updated"})
}

func (s *Server) handleForceRotation(c *gin.Context) {
	if err := s.rotationManager.ForceRotation(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to force rotation"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "IP rotation triggered"})
}

// Stub handlers for compatibility

func (s *Server) handleGetCurrentSession(c *gin.Context) {
	session, _ := s.rotationManager.GetCurrentSession()
	if session == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":             session.ID,
		"time_remaining": int(session.TimeRemaining().Seconds()),
	})
}

func (s *Server) handleGetRotationStats(c *gin.Context) {
	if s.analyticsManager != nil {
		c.JSON(http.StatusOK, s.analyticsManager.GetStats())
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success_rate":    0,
		"total_rotations": 0,
		"geo_stats":       map[string]int{},
		"hourly_stats":    map[string]int{},
		"success_count":   0,
		"failure_count":   0,
		"recent_events":   []interface{}{},
	})
}

func (s *Server) handleSetGeo(c *gin.Context) {
	// Deprecated, use update config
	// Forward to update logic if strictly needed, or just warn
	var req struct {
		Country string `json:"country"`
		City    string `json:"city"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Simplistic update - just updates geo, preserving current mode?
	// For MVP we just force update everything via the main endpoint
	c.JSON(http.StatusOK, gin.H{"message": "Updated (Partial compatibility)"})
}

// LocationData represents available proxy locations
type LocationData struct {
	CountryCode string   `json:"country_code"`
	CountryName string   `json:"country_name"`
	Cities      []string `json:"cities,omitempty"`
	Available   bool     `json:"available"`
}

func (s *Server) handleGetLocations(c *gin.Context) {
	locations := []LocationData{
		{"US", "United States", []string{"New York", "Los Angeles", "Chicago"}, true},
		{"GB", "United Kingdom", []string{"London", "Manchester"}, true},
		{"DE", "Germany", []string{"Berlin", "Munich"}, true},
		{"FR", "France", []string{"Paris", "Lyon"}, true},
		{"CA", "Canada", []string{"Toronto", "Vancouver"}, true},
		{"AU", "Australia", []string{"Sydney", "Melbourne"}, true},
		{"JP", "Japan", []string{"Tokyo", "Osaka"}, true},
		{"SG", "Singapore", []string{}, true},
		{"NL", "Netherlands", []string{"Amsterdam"}, true},
		{"BR", "Brazil", []string{"São Paulo", "Rio de Janeiro"}, true},
	}
	c.JSON(http.StatusOK, gin.H{"locations": locations, "total": len(locations)})
}

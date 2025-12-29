package api

import (
	"net/http"

	"github.com/atlanticproxy/proxy-client/internal/rotation"
	"github.com/gin-gonic/gin"
)

// RotationConfigReq represents the configuration request body
type RotationConfigReq struct {
	Mode    rotation.RotationMode `json:"mode" binding:"required"`
	Country string                `json:"country"`
	City    string                `json:"city"`
	State   string                `json:"state"`
}

// GeoConfigReq represents the geo-targeting request body
type GeoConfigReq struct {
	Country string `json:"country" binding:"required"`
	City    string `json:"city"`
	State   string `json:"state"`
}

func (s *Server) handleGetRotationConfig(c *gin.Context) {
	if s.rotationManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Rotation manager not available"})
		return
	}
	
	// Accessing config (assuming we add a Getter to manager or expose config safely)
	// Currently Manager.config is private, we should add a getter in Manager or just use what we have.
	// I'll add GetConfig() to Manager later, for now we will assume it exists or use what we can.
	// Wait, I didn't add GetConfig() to Manager. I added GetCurrentSession() and UpdateConfig().
	// I should add GetConfig() to Manager.
	
	// For now, returning a placeholder or error if not implemented
	// Let's assume I will add `GetConfig()` to Manager.
	config := s.rotationManager.GetConfig()
	c.JSON(http.StatusOK, config)
}

func (s *Server) handleSetRotationConfig(c *gin.Context) {
	if s.rotationManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Rotation manager not available"})
		return
	}

	var req RotationConfigReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	config := rotation.RotationConfig{
		Mode:    req.Mode,
		Country: req.Country,
		City:    req.City,
		State:   req.State,
	}

	if err := s.rotationManager.UpdateConfig(config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.broadcast(gin.H{"type": "rotation_config_updated", "config": config})
	c.JSON(http.StatusOK, gin.H{"message": "Rotation configuration updated"})
}

func (s *Server) handleNewSession(c *gin.Context) {
	if s.rotationManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Rotation manager not available"})
		return
	}

	if err := s.rotationManager.ForceRotation(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rotate session"})
		return
	}

	session, _ := s.rotationManager.GetCurrentSession()
	s.broadcast(gin.H{"type": "session_rotated", "session": session})
	c.JSON(http.StatusOK, gin.H{"message": "Session rotated", "session": session})
}

func (s *Server) handleGetCurrentSession(c *gin.Context) {
	if s.rotationManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Rotation manager not available"})
		return
	}

	session, err := s.rotationManager.GetCurrentSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get session"})
		return
	}

	c.JSON(http.StatusOK, session)
}

func (s *Server) handleGetRotationStats(c *gin.Context) {
	if s.analyticsManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Analytics manager not available"})
		return
	}
	
	stats := s.analyticsManager.GetStats()
	c.JSON(http.StatusOK, stats)
}

func (s *Server) handleSetGeo(c *gin.Context) {
	if s.rotationManager == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Rotation manager not available"})
		return
	}

	var req GeoConfigReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Get current config to preserve mode
	currentConfig := s.rotationManager.GetConfig()
	currentConfig.Country = req.Country
	currentConfig.City = req.City
	currentConfig.State = req.State

	if err := s.rotationManager.UpdateConfig(currentConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.broadcast(gin.H{"type": "geo_updated", "config": currentConfig})
	c.JSON(http.StatusOK, gin.H{"message": "Geo targeting updated"})
}

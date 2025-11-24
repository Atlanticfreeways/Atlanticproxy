package handlers

import (
	"net/http"

	"atlanticproxy/backend/internal/models"
	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ProxyHandler struct {
	proxyService *services.ProxyService
}

func NewProxyHandler(proxyService *services.ProxyService) *ProxyHandler {
	return &ProxyHandler{
		proxyService: proxyService,
	}
}

// GetLocations retrieves all proxy locations
// GET /api/proxy/locations
func (h *ProxyHandler) GetLocations(c *gin.Context) {
	region := c.Query("region")
	
	locations, err := h.proxyService.GetLocations(region)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, locations)
}

// SaveConfiguration saves proxy configuration
// POST /api/proxy/configuration
func (h *ProxyHandler) SaveConfiguration(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Protocol           string   `json:"protocol" binding:"required"`
		ISPTier            string   `json:"ispTier" binding:"required"`
		Locations          []string `json:"locations" binding:"required"`
		LoadBalancingMode  string   `json:"loadBalancingMode" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := h.proxyService.SaveConfiguration(userID, &models.ProxyConfiguration{
		Protocol:          req.Protocol,
		ISPTier:           req.ISPTier,
		Locations:         req.Locations,
		LoadBalancingMode: req.LoadBalancingMode,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"configId":   config.ID,
	})
}

// GetConfiguration retrieves current proxy configuration
// GET /api/proxy/configuration
func (h *ProxyHandler) GetConfiguration(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	config, err := h.proxyService.GetConfiguration(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, config)
}

// UpdateSessionSettings updates session persistence settings
// PUT /api/proxy/session-settings
func (h *ProxyHandler) UpdateSessionSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Enabled              bool `json:"enabled"`
		SessionDuration      int  `json:"sessionDuration" binding:"required,min=5,max=120"`
		SessionTimeout       int  `json:"sessionTimeout" binding:"required,min=10,max=300"`
		IPStickiness         bool `json:"ipStickiness"`
		CookiePreservation   bool `json:"cookiePreservation"`
		HeaderPreservation   bool `json:"headerPreservation"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.proxyService.UpdateSessionSettings(userID, &models.SessionSettings{
		Enabled:            req.Enabled,
		SessionDuration:    req.SessionDuration,
		SessionTimeout:     req.SessionTimeout,
		IPStickiness:       req.IPStickiness,
		CookiePreservation: req.CookiePreservation,
		HeaderPreservation: req.HeaderPreservation,
	}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateCustomHeaders updates custom HTTP headers
// PUT /api/proxy/custom-headers
func (h *ProxyHandler) UpdateCustomHeaders(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Headers []struct {
			Name    string `json:"name" binding:"required"`
			Value   string `json:"value" binding:"required"`
			Enabled bool   `json:"enabled"`
		} `json:"headers" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	headers := make([]*models.CustomHeader, len(req.Headers))
	for i, h := range req.Headers {
		headers[i] = &models.CustomHeader{
			Name:    h.Name,
			Value:   h.Value,
			Enabled: h.Enabled,
		}
	}

	if err := h.proxyService.UpdateCustomHeaders(userID, headers); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateThrottlingSettings updates request throttling settings
// PUT /api/proxy/throttling-settings
func (h *ProxyHandler) UpdateThrottlingSettings(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Enabled               bool `json:"enabled"`
		RequestsPerSecond     int  `json:"requestsPerSecond" binding:"required,min=1,max=100"`
		BurstSize             int  `json:"burstSize" binding:"required,min=1,max=100"`
		DelayBetweenRequests  int  `json:"delayBetweenRequests" binding:"required,min=0,max=1000"`
		ConnectionLimit       int  `json:"connectionLimit" binding:"required,min=1,max=200"`
		BandwidthLimit        int  `json:"bandwidthLimit" binding:"required,min=1,max=500"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.proxyService.UpdateThrottlingSettings(userID, &models.ThrottlingSettings{
		Enabled:              req.Enabled,
		RequestsPerSecond:    req.RequestsPerSecond,
		BurstSize:            req.BurstSize,
		DelayBetweenRequests: req.DelayBetweenRequests,
		ConnectionLimit:      req.ConnectionLimit,
		BandwidthLimit:       req.BandwidthLimit,
	}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// UpdateProxyAuthentication updates proxy authentication
// PUT /api/proxy/authentication
func (h *ProxyHandler) UpdateProxyAuthentication(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Username   string `json:"username" binding:"required"`
		Password   string `json:"password" binding:"required"`
		AuthMethod string `json:"authMethod" binding:"required,oneof=basic digest bearer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.proxyService.UpdateProxyAuthentication(userID, &models.ProxyAuthentication{
		Username:   req.Username,
		Password:   req.Password,
		AuthMethod: req.AuthMethod,
	}); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

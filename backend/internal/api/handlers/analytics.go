package handlers

import (
	"net/http"

	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
	}
}

// ExportData exports data in various formats
// POST /api/analytics/export
func (h *AnalyticsHandler) ExportData(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req struct {
		Format              string `json:"format" binding:"required,oneof=csv json pdf"`
		DateRange           string `json:"dateRange" binding:"required,oneof=week month year custom"`
		IncludeMetrics      bool   `json:"includeMetrics"`
		IncludeBilling      bool   `json:"includeBilling"`
		IncludeConnections  bool   `json:"includeConnections"`
		StartDate           string `json:"startDate"`
		EndDate             string `json:"endDate"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data, filename, err := h.analyticsService.ExportData(
		userID,
		req.Format,
		req.DateRange,
		req.IncludeMetrics,
		req.IncludeBilling,
		req.IncludeConnections,
		req.StartDate,
		req.EndDate,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contentType := "text/csv"
	if req.Format == "json" {
		contentType = "application/json"
	} else if req.Format == "pdf" {
		contentType = "application/pdf"
	}

	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, contentType, data)
}

// GetUsageTrends retrieves usage trends
// GET /api/analytics/usage-trends?period=month
func (h *AnalyticsHandler) GetUsageTrends(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	period := c.DefaultQuery("period", "month")
	trends, err := h.analyticsService.GetUsageTrends(userID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trends)
}

// GetConnectionMetrics retrieves connection metrics
// GET /api/analytics/connection-metrics
func (h *AnalyticsHandler) GetConnectionMetrics(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	metrics, err := h.analyticsService.GetConnectionMetrics(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

package handlers

import (
	"net/http"

	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type UsageHandler struct {
	usageTracker *services.UsageTracker
}

func NewUsageHandler(db *sqlx.DB) *UsageHandler {
	return &UsageHandler{
		usageTracker: services.NewUsageTracker(db),
	}
}

func (h *UsageHandler) GetStats(c *gin.Context) {
	userID := c.GetInt("user_id")

	stats, err := h.usageTracker.GetUserStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get usage stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *UsageHandler) GetMonthlyStats(c *gin.Context) {
	userID := c.GetInt("user_id")

	stats, err := h.usageTracker.GetMonthlyUsage(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get monthly stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
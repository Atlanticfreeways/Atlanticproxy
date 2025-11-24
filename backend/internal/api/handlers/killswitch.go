package handlers

import (
	"net/http"

	"atlanticproxy/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type KillSwitchHandler struct {
	proxyClient *services.ProxyClientService
}

func NewKillSwitchHandler() *KillSwitchHandler {
	return &KillSwitchHandler{
		proxyClient: services.NewProxyClientService(),
	}
}

func (h *KillSwitchHandler) ToggleKillSwitch(c *gin.Context) {
	enabled := c.Query("enabled") == "true"
	
	// Send kill switch command to proxy client
	err := h.proxyClient.SetKillSwitch(enabled)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle kill switch: " + err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"kill_switch_enabled": enabled,
		"message": func() string {
			if enabled {
				return "Kill switch activated - all traffic blocked"
			}
			return "Kill switch deactivated - traffic allowed"
		}(),
	})
}

func (h *KillSwitchHandler) GetKillSwitchStatus(c *gin.Context) {
	status, err := h.proxyClient.GetKillSwitchStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get kill switch status: " + err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"kill_switch_enabled": status,
	})
}